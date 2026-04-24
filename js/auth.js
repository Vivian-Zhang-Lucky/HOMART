/* ============================================================
   HOMART Hardware · Auth Layer
   ------------------------------------------------------------
   · 用户、会话都存在 localStorage
   · 两种角色: customer | merchant
   · 注册时填入"商家邀请码"才能成为商家
   · 页面守卫: Auth.requireMerchant() / Auth.requireAny()
   ------------------------------------------------------------
   注意: 演示版密码明文存储。真实系统必须用服务端+哈希。
   ============================================================ */

const AUTH_KEYS = {
  USERS: "HOMART.users",
  SESSION: "HOMART.session",
  SEED: "HOMART.auth.seeded.v1",
};

/* 商家注册邀请码 —— 真实场景下由后端验证 */
const MERCHANT_INVITE_CODE = "HOMART-MERCHANT-2026";

/* 种子账号（让用户可以直接登录试用） */
const SEED_USERS = [
  {
    id: "u_admin",
    email: "admin@HOMARThardware.co.ke",
    password: "merchant123",
    name: "Factory Admin",
    role: "merchant",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u_demo",
    email: "customer@demo.com",
    password: "demo123",
    name: "Demo Customer",
    role: "customer",
    phone: "+254 712 345 678",
    createdAt: new Date().toISOString(),
  },
];

const Auth = {
  /* ---------- 初始化 ---------- */
  init() {
    if (!localStorage.getItem(AUTH_KEYS.SEED)) {
      localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(SEED_USERS));
      localStorage.setItem(AUTH_KEYS.SEED, "1");
    }
  },

  /* ---------- 用户 ---------- */
  getUsers() {
    return JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || "[]");
  },
  saveUsers(list) {
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(list));
  },
  getUser(email) {
    return this.getUsers().find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase(),
    );
  },

  /* ---------- 注册 ---------- */
  register({ name, email, password, phone, inviteCode }) {
    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    phone = (phone || "").trim();

    if (!name || !email || !password) {
      return { ok: false, error: "Please fill in all required fields" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Please enter a valid email address" };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters" };
    }
    if (this.getUser(email)) {
      return { ok: false, error: "An account with this email already exists" };
    }

    /* 角色判定 */
    let role = "customer";
    if (inviteCode) {
      if (inviteCode.trim() !== MERCHANT_INVITE_CODE) {
        return { ok: false, error: "Invalid merchant invite code" };
      }
      role = "merchant";
    }

    const user = {
      id: "u_" + Date.now().toString(36),
      email,
      password,
      name,
      phone,
      role,
      createdAt: new Date().toISOString(),
    };

    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);

    this._writeSession(user);
    return { ok: true, user };
  },

  /* ---------- 登录 ---------- */
  login(email, password) {
    const user = this.getUser(email);
    if (!user) return { ok: false, error: "No account found with this email" };
    if (user.password !== password)
      return { ok: false, error: "Incorrect password" };
    this._writeSession(user);
    return { ok: true, user };
  },

  /* ---------- 登出 ---------- */
  logout() {
    localStorage.removeItem(AUTH_KEYS.SESSION);
  },

  /* ---------- 会话 ---------- */
  _writeSession(user) {
    const { password, ...safe } = user;
    localStorage.setItem(
      AUTH_KEYS.SESSION,
      JSON.stringify({
        user: safe,
        loginAt: new Date().toISOString(),
      }),
    );
  },
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEYS.SESSION) || "null");
    } catch (e) {
      return null;
    }
  },
  current() {
    return this.getSession()?.user || null;
  },
  isMerchant() {
    return this.current()?.role === "merchant";
  },
  isCustomer() {
    return this.current()?.role === "customer";
  },

  /* ---------- 更新当前用户资料 ---------- */
  updateProfile(patch) {
    const cur = this.current();
    if (!cur) return { ok: false, error: "Not signed in" };
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === cur.id);
    if (idx < 0) return { ok: false, error: "User not found" };
    users[idx] = { ...users[idx], ...patch };
    this.saveUsers(users);
    this._writeSession(users[idx]);
    return { ok: true, user: users[idx] };
  },

  /* ---------- 页面守卫 ---------- */
  requireMerchant() {
    if (!this.isMerchant()) {
      location.href =
        "login.html?redirect=" +
        encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  },
  requireAny() {
    if (!this.current()) {
      location.href =
        "login.html?redirect=" +
        encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  },
};

/* 跨 tab 会话同步 */
window.addEventListener("storage", (e) => {
  if (e.key === AUTH_KEYS.SESSION) {
    window.dispatchEvent(new CustomEvent("auth:change"));
  }
});

/* 全局暴露 */
window.Auth = Auth;
window.AUTH_KEYS = AUTH_KEYS;
window.MERCHANT_INVITE_CODE = MERCHANT_INVITE_CODE;

/* 初始化 */
Auth.init();
