/* ============================================================
   Supabase 聊天（跨设备）
   依赖：先加载 CDN @supabase/supabase-js，再加载 supabase-config.js
   ============================================================ */

const SupabaseChat = {
  MERCHANT_ID: "default-store",
  client: null,
  _merchantChannel: null,

  _createClient() {
    const lib = window.supabase;
    if (!lib) return null;
    if (typeof lib.createClient === "function") return lib.createClient;
    if (lib.default && typeof lib.default.createClient === "function")
      return lib.default.createClient;
    return null;
  },

  isReady() {
    return !!(
      window.SUPABASE_URL &&
      window.SUPABASE_ANON_KEY &&
      typeof this._createClient() === "function"
    );
  },

  getClient() {
    if (!this.isReady()) return null;
    const createClient = this._createClient();
    if (!this.client)
      this.client = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    return this.client;
  },

  customerKey() {
    const u = window.Auth && Auth.current && Auth.current();
    if (u && u.id) return u.id;
    const s = DataStore.getSession();
    return s.id || "guest";
  },

  customerNameEmail() {
    const u = window.Auth && Auth.current && Auth.current();
    if (u)
      return {
        name: u.name || u.email || "Customer",
        email: u.email || "",
      };
    const s = DataStore.getSession();
    return {
      name: s.name || "Guest",
      email: s.email || "",
    };
  },

  rowToMessage(row) {
    const type =
      row.message_type === "product"
        ? "product"
        : row.message_type === "quote"
          ? "quote"
          : undefined;
    return {
      id: row.id,
      conversationId: row.conversation_id,
      sender: row.sender,
      message: row.body || "",
      timestamp: row.created_at,
      type,
      productId: row.product_id || undefined,
    };
  },

  async ensureCustomerConversation() {
    const sb = this.getClient();
    const merchantId = this.MERCHANT_ID;
    const customerId = this.customerKey();
    const { name, email } = this.customerNameEmail();

    const { data: rows, error: selErr } = await sb
      .from("conversations")
      .select("id,status")
      .eq("merchant_id", merchantId)
      .eq("customer_id", customerId)
      .order("last_at", { ascending: false })
      .limit(8);
    if (selErr) throw selErr;
    const open = (rows || []).find((r) => r.status !== "resolved");
    if (open) return open.id;

    const { data: ins, error: insErr } = await sb
      .from("conversations")
      .insert({
        merchant_id: merchantId,
        customer_id: customerId,
        customer_name: name,
        customer_email: email,
        status: "open",
        last_message: "",
        last_at: new Date().toISOString(),
        unread_merchant: 0,
        unread_customer: 0,
      })
      .select("id")
      .single();
    if (insErr) throw insErr;
    return ins.id;
  },

  async listMessages(conversationId) {
    const sb = this.getClient();
    const { data, error } = await sb
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map((r) => this.rowToMessage(r));
  },

  async insertMessage(conversationId, sender, body, opts = {}) {
    const sb = this.getClient();
    const message_type = opts.type || "text";
    const product_id = opts.productId || null;
    const { error: mErr } = await sb.from("messages").insert({
      conversation_id: conversationId,
      sender,
      body: body || "",
      message_type,
      product_id,
    });
    if (mErr) throw mErr;

    const { data: conv, error: cErr } = await sb
      .from("conversations")
      .select("unread_merchant,unread_customer")
      .eq("id", conversationId)
      .single();
    if (cErr) throw cErr;

    const preview = (body || "").slice(0, 120);
    const patch = {
      last_message: preview,
      last_at: new Date().toISOString(),
    };
    if (sender === "customer")
      patch.unread_merchant = (conv.unread_merchant || 0) + 1;
    else patch.unread_customer = (conv.unread_customer || 0) + 1;

    const { error: uErr } = await sb
      .from("conversations")
      .update(patch)
      .eq("id", conversationId);
    if (uErr) throw uErr;
  },

  async seedWelcomeIfEmpty(conversationId, welcomeText) {
    const msgs = await this.listMessages(conversationId);
    if (msgs.length > 0) return;
    await this.insertMessage(conversationId, "seller", welcomeText, {
      type: "text",
    });
    const sb = this.getClient();
    await sb
      .from("conversations")
      .update({ unread_customer: 0 })
      .eq("id", conversationId);
  },

  subscribeConversation(conversationId, onChange) {
    const sb = this.getClient();
    const ch = sb
      .channel("conv-" + conversationId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: "conversation_id=eq." + conversationId,
        },
        () => onChange && onChange(),
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" && typeof console !== "undefined")
          console.warn("Supabase conversation realtime:", status);
      });
    return () => {
      try {
        sb.removeChannel(ch);
      } catch (e) {}
    };
  },

  subscribeMerchantMessages(onChange) {
    const sb = this.getClient();
    if (this._merchantChannel) {
      try {
        sb.removeChannel(this._merchantChannel);
      } catch (e) {}
      this._merchantChannel = null;
    }
    this._merchantChannel = sb
      .channel("merchant-msgs-" + Date.now().toString(36))
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => onChange && onChange(),
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" && typeof console !== "undefined")
          console.warn("Supabase merchant realtime:", status);
      });
    return () => {
      try {
        if (this._merchantChannel) sb.removeChannel(this._merchantChannel);
      } catch (e) {}
      this._merchantChannel = null;
    };
  },

  async listMerchantConversations() {
    const sb = this.getClient();
    const { data, error } = await sb
      .from("conversations")
      .select("*")
      .eq("merchant_id", this.MERCHANT_ID)
      .order("last_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async markMerchantRead(conversationId) {
    const sb = this.getClient();
    await sb
      .from("conversations")
      .update({ unread_merchant: 0 })
      .eq("id", conversationId);
  },

  async markCustomerRead(conversationId) {
    const sb = this.getClient();
    await sb
      .from("conversations")
      .update({ unread_customer: 0 })
      .eq("id", conversationId);
  },

  async updateConversationStatus(conversationId, status) {
    const sb = this.getClient();
    await sb.from("conversations").update({ status }).eq("id", conversationId);
  },
};

window.SupabaseChat = SupabaseChat;
