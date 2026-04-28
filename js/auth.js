/* ============================================================
   HOMART Hardware · Auth (Supabase)
   - Sign-up / Sign-in via Supabase Auth
   - Role stored in `profiles` table — only changeable via Supabase Dashboard
   - Session cached in localStorage for immediate synchronous access
   ============================================================ */

const AUTH_CACHE_KEY = "HOMART.auth.v2";

const Auth = {
  _user: null,
  _client: null,
  _initPromise: null,

  _getSb() {
    return window._sbClient || null;
  },

  init() {
    /* Restore cache immediately so Auth.current() works synchronously
       while the async Supabase session check is still in flight. */
    try {
      const c = localStorage.getItem(AUTH_CACHE_KEY);
      if (c) this._user = JSON.parse(c);
    } catch {}

    const sb = this._getSb();
    if (!sb) {
      this._initPromise = Promise.resolve();
      return this._initPromise;
    }

    this._initPromise = (async () => {
      try {
        const {
          data: { session },
        } = await sb.auth.getSession();
        if (session?.user) {
          await this._fetchAndCache(sb, session.user);
        } else {
          this._user = null;
          localStorage.removeItem(AUTH_CACHE_KEY);
        }
      } catch {}

      sb.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          this._user = null;
          localStorage.removeItem(AUTH_CACHE_KEY);
        } else if (session?.user) {
          await this._fetchAndCache(sb, session.user);
        }
        window.dispatchEvent(new CustomEvent("auth:change"));
      });
    })();

    return this._initPromise;
  },

  async _fetchAndCache(sb, sbUser) {
    try {
      const { data, error } = await sb
        .from("profiles")
        .select("name,role")
        .eq("id", sbUser.id)
        .single();
      console.log("[Auth] _fetchAndCache →", { data, error });
      this._user = {
        id: sbUser.id,
        email: sbUser.email,
        name: data?.name || sbUser.user_metadata?.name || "",
        role: data?.role || "customer",
      };
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(this._user));
    } catch (e) {
      console.warn("[Auth] _fetchAndCache failed:", e);
      this._user = null;
      localStorage.removeItem(AUTH_CACHE_KEY);
    }
  },

  ready() {
    return this._initPromise || Promise.resolve();
  },

  current() {
    return this._user;
  },

  isMerchant() {
    return this._user?.role === "merchant";
  },

  isCustomer() {
    return this._user?.role === "customer";
  },

  async login(email, password) {
    const sb = this._getSb();
    if (!sb) return { ok: false, error: "Service unavailable" };
    const { data, error } = await sb.auth.signInWithPassword({
      email: (email || "").trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: error.message };
    await this._fetchAndCache(sb, data.user);
    return { ok: true, user: this._user };
  },

  /* ---- Email registration: step 1 — signUp → Supabase sends OTP email ---- */
  async sendEmailRegistrationOtp(email, password, name) {
    const sb = this._getSb();
    if (!sb) return { ok: false, error: "Service unavailable" };
    if (!email || !password) return { ok: false, error: "Email and password required" };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    const { error } = await sb.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name } },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },

  async resendEmailOtp(email) {
    const sb = this._getSb();
    if (!sb) return { ok: false, error: "Service unavailable" };
    const { error } = await sb.auth.resend({ type: "signup", email });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },

  /* ---- OTP verification for email signup ---- */
  async verifyRegistrationOtp({ email, token, name }) {
    const sb = this._getSb();
    if (!sb) return { ok: false, error: "Service unavailable" };
    const { data, error } = await sb.auth.verifyOtp({ email, token, type: "signup" });
    if (error) return { ok: false, error: error.message };
    const { error: pErr } = await sb.from("profiles").upsert({
      id: data.user.id,
      name: name || data.user.user_metadata?.name || "",
      role: "customer",
    });
    if (pErr) console.warn("Profile error:", pErr.message);
    await this._fetchAndCache(sb, data.user);
    return { ok: true, user: this._user };
  },

  async register({ name, email, password, phone }) {
    const sb = this._getSb();
    if (!sb) return { ok: false, error: "Service unavailable" };

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    phone = (phone || "").trim();

    if (!name || !email || !password)
      return { ok: false, error: "Please fill in all required fields" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { ok: false, error: "Please enter a valid email address" };
    if (password.length < 6)
      return { ok: false, error: "Password must be at least 6 characters" };

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { ok: false, error: error.message };

    const { error: pErr } = await sb
      .from("profiles")
      .upsert({ id: data.user.id, name, role: "customer" });
    if (pErr) return { ok: false, error: pErr.message };

    await this._fetchAndCache(sb, data.user);
    return { ok: true, user: this._user };
  },

  async logout() {
    const sb = this._getSb();
    if (sb) await sb.auth.signOut();
    this._user = null;
    localStorage.removeItem(AUTH_CACHE_KEY);
  },

  async requireMerchant() {
    await this.ready();
    if (!this.isMerchant()) {
      location.href =
        "login.html?redirect=" +
        encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  },

  async requireAny() {
    await this.ready();
    if (!this.current()) {
      location.href =
        "login.html?redirect=" +
        encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  },
};

window.Auth = Auth;
Auth.init();
