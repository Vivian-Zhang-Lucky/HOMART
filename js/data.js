/* ============================================================
   HOMART Hardware · Data Layer
   ------------------------------------------------------------
   整个网站的"数据库"。
   · 首次加载时把 INITIAL_* 写入 localStorage
   · 之后所有读写都走 localStorage
   · 商家版 (merchant.html) 读写完全相同的 key，修改立即对客户生效
   ============================================================ */

const STORAGE_KEYS = {
  CATEGORIES: "HOMART.categories",
  PRODUCTS: "HOMART.products",
  CART: "HOMART.cart",
  ORDERS: "HOMART.orders",
  MESSAGES: "HOMART.messages",
  CONVERSATIONS: "HOMART.conversations",
  SESSION: "HOMART.session",
  WISHLIST: "HOMART.wishlist",
  SEED: "HOMART.seeded.v2",
};

/* ---------- 分类结构 ---------- */
const INITIAL_CATEGORIES = [
  {
    id: "hardware",
    name: "Hardware",
    icon: "🔨",
    subcategories: [
      { id: "hinges", name: "Hinges" },
      { id: "handles", name: "Handles & Locks" },
      { id: "brackets", name: "Brackets" },
    ],
  },
  {
    id: "plumbing",
    name: "Plumbing",
    icon: "🚰",
    subcategories: [
      { id: "pipes", name: "Pipes" },
      { id: "pipe-fittings", name: "Pipe Fittings" },
      { id: "valves", name: "Valves" },
      { id: "plumbing-accessories", name: "Plumbing Accessories" },
    ],
  },
  {
    id: "sanitary-ware",
    name: "Sanitary Ware",
    icon: "🚽",
    subcategories: [
      { id: "toilets", name: "Toilets" },
      { id: "basins", name: "Wash Basins" },
      { id: "showers", name: "Showers" },
    ],
  },
  {
    id: "bathroom-fixtures",
    name: "Bathroom Fixtures",
    icon: "🛁",
    subcategories: [
      { id: "basin-mixer-taps", name: "Basin Mixer Taps" },
      { id: "shower-mixers", name: "Shower Mixers" },
      { id: "accessories", name: "Bathroom Accessories" },
    ],
  },
  {
    id: "tools",
    name: "Tools",
    icon: "🔧",
    subcategories: [
      { id: "hand-tools", name: "Hand Tools" },
      { id: "power-tools", name: "Power Tools" },
      { id: "measuring", name: "Measuring Tools" },
    ],
  },
  {
    id: "pipe-fittings",
    name: "Pipe Fittings",
    icon: "🔩",
    subcategories: [
      { id: "elbows", name: "Elbows" },
      { id: "tees", name: "Tees" },
      { id: "couplers", name: "Couplers" },
      { id: "reducers", name: "Reducers" },
      { id: "adapters", name: "Adapters" },
    ],
  },
  {
    id: "valves",
    name: "Valves",
    icon: "⚙️",
    subcategories: [
      { id: "gate-valves", name: "Gate Valves" },
      { id: "ball-valves", name: "Ball Valves" },
      { id: "check-valves", name: "Check Valves" },
    ],
  },
  {
    id: "fasteners",
    name: "Fasteners",
    icon: "🔩",
    subcategories: [
      { id: "screws", name: "Screws" },
      { id: "bolts", name: "Bolts & Nuts" },
      { id: "anchors", name: "Anchors" },
    ],
  },
];

/* ---------- 产品图（使用 Unsplash 稳定 CDN，按 id 可重现） ----------
   注：商家版后续会替换为自有图片。
------------------------------------------------------------ */
const IMG = {
  toilet:
    "https://images.unsplash.com/photo-1564540583246-934409427776?w=800&auto=format&fit=crop",
  basinMixer:
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop",
  basinMixer2:
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&auto=format&fit=crop",
  pipes:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop",
  gateValve:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
  wrench:
    "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=800&auto=format&fit=crop",
  screws:
    "https://images.unsplash.com/photo-1609205807107-454f1c7f5b6d?w=800&auto=format&fit=crop",
  elbow:
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&auto=format&fit=crop",
  tee: "https://images.unsplash.com/photo-1609205807490-89a2c4a80cf3?w=800&auto=format&fit=crop",
  coupler:
    "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&auto=format&fit=crop",
  reducer:
    "https://images.unsplash.com/photo-1609205264511-b3894e7598e5?w=800&auto=format&fit=crop",
  brassElbow:
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop",
  brassNipple:
    "https://images.unsplash.com/photo-1609205264783-7e21f7169b76?w=800&auto=format&fit=crop",
  pipeClip:
    "https://images.unsplash.com/photo-1558618047-fd8a1f8e7b3b?w=800&auto=format&fit=crop",
  brassTee:
    "https://images.unsplash.com/photo-1609205807107-e3c6e5bfda3f?w=800&auto=format&fit=crop",
  adapter:
    "https://images.unsplash.com/photo-1609205264636-a6c2e5b96c3d?w=800&auto=format&fit=crop",
  union:
    "https://images.unsplash.com/photo-1558618666-fbd8c1cd7f63?w=800&auto=format&fit=crop",
};

/* 产品图片降级占位符（网络失败时用） */
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f3f4f6"/>
  <g fill="none" stroke="#9ca3af" stroke-width="2">
    <circle cx="200" cy="170" r="60"/>
    <path d="M140 270 L260 270 L280 330 L120 330 Z"/>
  </g>
  <text x="200" y="370" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="14">HOMART Hardware</text>
</svg>`);

/* ---------- 产品数据 ---------- */
const INITIAL_PRODUCTS = [];

/* ============================================================
   图片压缩工具（canvas 缩放 + JPEG 压缩，用于 localStorage 回退场景）
   ============================================================ */
function compressImage(file, maxPx = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
        else { width = Math.round(width * maxPx / height); height = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

/* ============================================================
   DataStore — 数据操作 API（客户版 + 商家版 共用）
   ============================================================ */
const DataStore = {
  /* ---------- 初始化 / 种子 ---------- */
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SEED)) {
      localStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(INITIAL_CATEGORIES),
      );
      localStorage.setItem(
        STORAGE_KEYS.PRODUCTS,
        JSON.stringify(INITIAL_PRODUCTS),
      );
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SEED, "1");
    }
  },

  resetAll() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.init();
  },

  /* ---------- 分类 ---------- */
  getCategories() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
  },
  getCategory(id) {
    return this.getCategories().find((c) => c.id === id);
  },

  /* ---------- 产品 ---------- */
  getProducts(filter = {}) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]");
    if (!filter.includeDrafts) list = list.filter((p) => !p.draft);
    if (filter.category)
      list = list.filter((p) => p.category === filter.category);
    if (filter.subcategory)
      list = list.filter((p) => p.subcategory === filter.subcategory);
    if (filter.featured) list = list.filter((p) => p.featured);
    if (filter.material)
      list = list.filter(
        (p) =>
          (p.material || "").toLowerCase() === filter.material.toLowerCase(),
      );
    if (filter.minPrice != null)
      list = list.filter((p) => p.price >= filter.minPrice);
    if (filter.maxPrice != null)
      list = list.filter((p) => p.price <= filter.maxPrice);
    if (filter.inStock) list = list.filter((p) => p.inStock);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (p.shortDesc || "").toLowerCase().includes(q),
      );
    }
    if (filter.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (filter.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (filter.sort === "name-asc")
      list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  },
  getProduct(id, opts = {}) {
    return this.getProducts(opts).find((p) => p.id === id);
  },
  getRelatedProducts(product, limit = 6) {
    if (!product) return [];
    return this.getProducts()
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.subcategory === product.subcategory ||
            p.category === product.category),
      )
      .slice(0, limit);
  },
  /* 商家版写入 */
  saveProducts(list) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
  },
  upsertProduct(product) {
    const list = this.getProducts({ includeDrafts: true });
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx >= 0) list[idx] = product;
    else list.push(product);
    this.saveProducts(list);
  },
  deleteProduct(id) {
    const list = this.getProducts({ includeDrafts: true }).filter((p) => p.id !== id);
    this.saveProducts(list);
  },

  /* ---------- 订单 ---------- */
  getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
  },
  createOrder(order) {
    const list = this.getOrders();
    order.id = "o" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    order.status = order.status || "pending";
    order.createdAt = new Date().toISOString();
    list.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
    return order;
  },

  /* ---------- 客户 Session ----------
     Auth 与 DataStore 共用 HOMART.session。登录后存的是 { user, loginAt }，需合并 user.id
     作为 DataStore 层的稳定 id，否则聊天会话的 customerId 会变成 undefined。 */
  getSession() {
    let s = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || "null");
    if (s && s.user && s.user.id) {
      if (!s.id || s.id !== s.user.id) {
        s = {
          ...s,
          id: s.user.id,
          name: s.name || s.user.name,
          email: s.email || s.user.email || "",
        };
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(s));
      }
    }
    if (!s) {
      s = { id: "sess_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(s));
    }
    return s;
  },
  updateSession(patch) {
    const s = Object.assign(this.getSession(), patch);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(s));
    return s;
  },

  /* ---------- 会话管理 ---------- */
  getConversations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || "[]");
  },
  getConversation(id) {
    return this.getConversations().find((c) => c.id === id) || null;
  },
  saveConversations(list) {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("homart:conversations"));
    if (window.__homartSyncPost) window.__homartSyncPost("conversations");
  },
  getOrCreateConversation(customerId, customerName, customerEmail) {
    const list = this.getConversations();
    let conv = list.find((c) => c.customerId === customerId && c.status !== "resolved");
    if (!conv) {
      conv = {
        id: "conv_" + Date.now().toString(36),
        customerId,
        customerName: customerName || "Guest",
        customerEmail: customerEmail || "",
        status: "open",
        tags: [],
        lastMessage: "",
        lastTimestamp: new Date().toISOString(),
        unreadByMerchant: 0,
        unreadByCustomer: 0,
        createdAt: new Date().toISOString(),
      };
      list.unshift(conv);
      this.saveConversations(list);
    }
    return conv;
  },
  updateConversation(id, patch) {
    const list = this.getConversations();
    const idx = list.findIndex((c) => c.id === id);
    if (idx < 0) return;
    Object.assign(list[idx], patch);
    this.saveConversations(list);
    return list[idx];
  },
  markConversationRead(convId, side) {
    const field = side === "merchant" ? "unreadByMerchant" : "unreadByCustomer";
    this.updateConversation(convId, { [field]: 0 });
  },

  /* ---------- 聊天消息 ---------- */
  getMessages() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "[]");
  },
  getConversationMessages(conversationId) {
    return this.getMessages().filter((m) => m.conversationId === conversationId);
  },
  addMessage(msg) {
    const list = this.getMessages();
    msg.id = "m" + Date.now().toString(36);
    msg.timestamp = msg.timestamp || new Date().toISOString();
    list.push(msg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("homart:messages", { detail: msg }));
    if (window.__homartSyncPost) window.__homartSyncPost("messages");
    // update conversation metadata
    if (msg.conversationId) {
      const convs = this.getConversations();
      const idx = convs.findIndex((c) => c.id === msg.conversationId);
      if (idx >= 0) {
        const preview = msg.message ? msg.message.slice(0, 80) : (msg.type === "product" ? "Shared a product" : "Sent a quote");
        convs[idx].lastMessage = preview;
        convs[idx].lastTimestamp = msg.timestamp;
        if (msg.sender === "customer") convs[idx].unreadByMerchant = (convs[idx].unreadByMerchant || 0) + 1;
        else convs[idx].unreadByCustomer = (convs[idx].unreadByCustomer || 0) + 1;
        // bubble conversation to top
        const [conv] = convs.splice(idx, 1);
        convs.unshift(conv);
        this.saveConversations(convs);
      }
    }
    return msg;
  },

  /* ---------- 图片上传（Supabase Storage 优先，回退压缩 base64） ---------- */
  async uploadImage(file) {
    const sb = window._sbClient;
    if (sb) {
      try {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await sb.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (!error && data) {
          const { data: urlData } = sb.storage.from("product-images").getPublicUrl(data.path);
          return urlData.publicUrl;
        }
      } catch (e) {}
    }
    return compressImage(file);
  },

  /* ---------- Supabase product sync ---------- */
  async fetchProductsFromSupabase() {
    const sb = window._sbClient;
    if (!sb) return false;
    const { data, error } = await sb
      .from("store_config")
      .select("value")
      .eq("key", "products")
      .maybeSingle();
    if (error || !data?.value || !Array.isArray(data.value) || data.value.length === 0) return false;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.value));
    return true;
  },
  async syncProductsToSupabase() {
    const sb = window._sbClient;
    if (!sb) return false;
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]");
    const { error } = await sb.from("store_config").upsert({
      key: "products",
      value: products,
      updated_at: new Date().toISOString(),
    });
    if (error) { console.error("[Sync] store_config upsert failed:", error.message); return false; }
    return true;
  },

  /* ---------- 心愿单 ---------- */
  getWishlist() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || "[]");
  },
  toggleWishlist(productId) {
    const list = this.getWishlist();
    const idx = list.indexOf(productId);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(productId);
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    return list.includes(productId);
  },
  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  },
};

/* 全局暴露 */
window.DataStore = DataStore;
window.compressImage = compressImage;
window.STORAGE_KEYS = STORAGE_KEYS;
window.FALLBACK_IMG = FALLBACK_IMG;

/* 跨窗口/多标签同 origin 的实时同步（storage 在部分环境不可靠） */
(function setupHomartSyncBroadcast() {
  if (typeof BroadcastChannel === "undefined") {
    window.__homartSyncPost = function () {};
    return;
  }
  const ch = new BroadcastChannel("homart-sync");
  ch.addEventListener("message", (ev) => {
    const k = ev.data && ev.data.k;
    if (k === "messages")
      window.dispatchEvent(new CustomEvent("homart:messages", { detail: null }));
    if (k === "conversations")
      window.dispatchEvent(new CustomEvent("homart:conversations", { detail: null }));
  });
  window.__homartSyncPost = (k) => {
    try {
      ch.postMessage({ k, t: Date.now() });
    } catch (e) {}
  };
})();

/* 初始化 */
DataStore.init();
