/* ============================================================
   HOMART Hardware · Shared Layout (Header / Footer / Chat)
   所有页面调用 Layout.render() 来注入共享 UI。
   ============================================================ */

const Layout = {
  _getStore() {
    const defaults = {
      name: "HOMART Hardware",
      tagline: "Built for quality. Built for Kenya.",
      phone: "+254 700 123 456",
      email: "sales@HOMARThardware.co.ke",
      address: "Industrial Area, Nairobi, Kenya",
    };
    try {
      return Object.assign({}, defaults, JSON.parse(localStorage.getItem("HOMART.storeSettings") || "null") || {});
    } catch { return defaults; }
  },

  renderTopBar() {
    return `
    <div class="topbar">
      <div class="container topbar__inner">
        <div class="topbar__left">
          <span class="topbar__item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l2-5h14l2 5"/><path d="M5 9h14v10H5z"/><path d="M9 13h6"/></svg>
            Nationwide supply across Kenya
          </span>
          <span class="topbar__dot"></span>
          <span class="topbar__item">Factory direct pricing</span>
          <span class="topbar__dot"></span>
          <span class="topbar__item">Bulk orders welcome</span>
        </div>
        <div class="topbar__right">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          Delivering to all counties
        </div>
      </div>
    </div>`;
  },

  renderLogo(size = "md") {
    const s = size === "lg" ? 44 : 36;
    return `
      <a href="index.html" class="logo" aria-label="HOMART Hardware home">
        <div class="logo__text">
          <span class="logo__name">HOMART</span>
          <span class="logo__tagline">HARDWARE</span>
        </div>
      </a>`;
  },

  renderHeader(active = "") {
    const cats = DataStore.getCategories();
    return `
    <header class="site-header">
      <!-- 1. Top bar -->
      ${this.renderTopBar()}

      <!-- 2. Main header: Logo · Search · Account · Wishlist · Cart · Chat -->
      <div class="header-main">
        <div class="container header-main__inner">
          ${this.renderLogo()}

          <form class="search" role="search" onsubmit="Layout.submitSearch(event)">
            <div class="search__category">
              <select id="search-category" aria-label="Category">
                <option value="">All Categories</option>
                ${cats.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <input type="search" id="search-input" placeholder="Search products, brands or categories…" autocomplete="off">
            <button type="submit" class="search__btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>

          <nav class="header-actions" aria-label="Account">
            ${Layout._renderAccountAction()}
            <a href="#" class="h-action" onclick="Toast.show('Wishlist coming soon');return false;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>Wishlist</span>
            </a>
            <a href="cart.html" class="h-action h-action--cart" id="cart-indicator">
              <span class="cart-badge" id="cart-badge">0</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
              <span>Cart</span>
            </a>
            <button class="btn btn--primary btn--chat" id="chat-btn" onclick="Chat.toggle()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat / Get Quote
              <span class="chat-unread-badge" id="chat-unread-badge" style="display:none;position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:9px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;padding:0 4px;line-height:1;"></span>
            </button>
          </nav>
        </div>

        <!-- 3. Category nav -->
        <div class="header-nav">
          <div class="container">
            <nav class="nav" aria-label="Primary">
              <a class="nav__link ${active === "home" ? "is-active" : ""}"     href="index.html">Home</a>
              <a class="nav__link ${active === "all" ? "is-active" : ""}"      href="category.html">Shop All Products <i class="caret"></i></a>
              <a class="nav__link ${active === "plumbing" ? "is-active" : ""}" href="category.html?cat=plumbing">Plumbing <i class="caret"></i></a>
              <a class="nav__link ${active === "sanitary-ware" ? "is-active" : ""}" href="category.html?cat=sanitary-ware">Sanitary Ware <i class="caret"></i></a>
              <a class="nav__link ${active === "bathroom-fixtures" ? "is-active" : ""}" href="category.html?cat=bathroom-fixtures">Bathroom Fixtures <i class="caret"></i></a>
              <a class="nav__link ${active === "tools" ? "is-active" : ""}"    href="category.html?cat=tools">Tools <i class="caret"></i></a>
              <a class="nav__link ${active === "pipe-fittings" ? "is-active" : ""}" href="category.html?cat=pipe-fittings">Pipe Fittings <i class="caret"></i></a>
              <a class="nav__link ${active === "valves" ? "is-active" : ""}"   href="category.html?cat=valves">Valves <i class="caret"></i></a>
              <a class="nav__link ${active === "fasteners" ? "is-active" : ""}" href="category.html?cat=fasteners">Fasteners <i class="caret"></i></a>
              <a class="nav__link" href="#" onclick="Toast.show('Brands page coming soon');return false;">Brands</a>
              <a class="nav__link" href="#" onclick="Chat.toggle();return false;">Bulk Orders</a>
              <a class="nav__link" href="#" onclick="Chat.toggle();return false;">Contact</a>
            </nav>
          </div>
        </div>
      </div>
    </header>`;
  },

  renderTrustBar() {
    return `
    <section class="trustbar">
      <div class="container trustbar__grid">
        <div class="trustbar__item">
          <div class="trustbar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l5-3 5 3 5-3 3 2v14"/><path d="M9 21v-6h6v6"/></svg>
          </div>
          <div><b>Factory Direct Supply</b><br><span>Better quality, better price.</span></div>
        </div>
        <div class="trustbar__item">
          <div class="trustbar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="7" height="7"/><rect x="14" y="7" width="7" height="7"/><rect x="9" y="14" width="7" height="7"/></svg>
          </div>
          <div><b>Bulk Orders</b><br><span>Competitive pricing for contractors & businesses.</span></div>
        </div>
        <div class="trustbar__item">
          <div class="trustbar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div><b>Fast Response</b><br><span>Quick quotes and timely delivery across Kenya.</span></div>
        </div>
        <div class="trustbar__item">
          <div class="trustbar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V7z"/></svg>
          </div>
          <div><b>Project Support</b><br><span>Technical support for projects of any size.</span></div>
        </div>
        <div class="trustbar__item">
          <div class="trustbar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div><b>Live Chat Negotiation</b><br><span>Discuss prices and quantities in real time.</span></div>
        </div>
      </div>
    </section>`;
  },

  renderFooter() {
    const s = this._getStore();
    const year = new Date().getFullYear();
    return `
    <footer class="site-footer">
      <div class="container footer__inner">
        <div class="footer__brand">
          ${this.renderLogo("lg")}
          <p>Kenyan factory-direct supplier of quality hardware, plumbing and sanitary ware for homes, businesses and projects.</p>
        </div>
        <div>
          <h4>SHOP</h4>
          <ul>
            <li><a href="category.html">Shop All Products</a></li>
            <li><a href="category.html?cat=plumbing">Plumbing</a></li>
            <li><a href="category.html?cat=bathroom-fixtures">Bathroom Fixtures</a></li>
            <li><a href="category.html?cat=tools">Tools</a></li>
            <li><a href="category.html?cat=pipe-fittings">Pipe Fittings</a></li>
            <li><a href="category.html?cat=valves">Valves</a></li>
            <li><a href="category.html?cat=fasteners">Fasteners</a></li>
          </ul>
        </div>
        <div>
          <h4>COMPANY</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#" onclick="Chat.toggle();return false;">Bulk Orders</a></li>
            <li><a href="#" onclick="Chat.toggle();return false;">Project Support</a></li>
            <li><a href="#">Delivery Information</a></li>
            <li><a href="#">Returns Policy</a></li>
          </ul>
        </div>
        <div>
          <h4>HELP &amp; SUPPORT</h4>
          <ul>
            <li><a href="#" onclick="Layout.showContactPhone();return false;">Contact Us</a></li>
            <li><a href="#" onclick="Chat.toggle();return false;">Live Chat</a></li>
          </ul>
        </div>
        <div>
          <h4>CONTACT US</h4>
          <ul class="footer__contact">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg><span>${s.name}<br>${s.address}</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 13 13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.36-1.27a2 2 0 0 1 2.11-.45 13 13 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${s.phone}</li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><polyline points="22 6 12 13 2 6"/></svg>${s.email}</li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Mon – Sat: 8:00am – 5:00pm</li>
          </ul>
          <h4 style="margin-top:24px">PAYMENT METHODS</h4>
          <div class="pay-methods">
            <span class="pay-pill pay-pill--mpesa">M‑PESA</span>
            <span class="pay-pill pay-pill--visa">VISA</span>
            <span class="pay-pill pay-pill--mc">●●</span>
            <span class="pay-pill">Bank Transfer</span>
          </div>
          <h4 style="margin-top:20px">FOLLOW US</h4>
          <div class="social">
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.87v-6.99H7.9V12h2.5V9.8c0-2.48 1.48-3.85 3.74-3.85 1.08 0 2.22.2 2.22.2v2.44h-1.26c-1.23 0-1.62.77-1.62 1.56V12h2.76l-.44 2.88h-2.32v6.99A10 10 0 0022 12z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
            <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11.01 5.01A2.5 2.5 0 014.98 3.5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.36c0-1.28-.02-2.93-1.79-2.93-1.79 0-2.06 1.4-2.06 2.84V21H10V9z"/></svg></a>
          </div>
        </div>
      </div>
      <div class="footer__meta">
        <div class="container footer__meta-inner">
          <span>© ${year} ${s.name}. All rights reserved.</span>
          <span>Proudly Kenyan 🇰🇪</span>
          <span>${s.tagline}</span>
        </div>
      </div>
    </footer>

    <!-- Contact phone modal -->
    <div id="contact-modal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);align-items:center;justify-content:center;" onclick="if(event.target===this)Layout.closeContactPhone()">
      <div style="background:#fff;border-radius:14px;padding:32px 36px;text-align:center;max-width:360px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,.18);">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--green-100,#d1fae5);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-700,#047857)" stroke-width="2" width="26" height="26"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 13 13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.36-1.27a2 2 0 0 1 2.11-.45 13 13 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <h3 id="contact-modal-name" style="font-size:17px;font-weight:700;margin:0 0 4px;"></h3>
        <p style="font-size:13px;color:#6b7280;margin:0 0 20px;">Call us during business hours<br>Mon – Sat: 8:00am – 5:00pm</p>
        <a id="contact-modal-tel" href="#" style="display:block;font-size:22px;font-weight:700;color:var(--green-700,#047857);text-decoration:none;letter-spacing:.5px;"></a>
        <button onclick="Layout.closeContactPhone()" style="margin-top:24px;padding:9px 28px;border-radius:8px;border:1.5px solid #d1d5db;background:#fff;font-size:14px;cursor:pointer;">Close</button>
      </div>
    </div>`;
  },

  /* ---------- 悬浮聊天抽屉 ---------- */
  renderChatDrawer() {
    const store = this._getStore();
    const initial = (store.name || "H").charAt(0).toUpperCase();
    return `
    <div class="chat" id="chat">
      <div class="chat__backdrop" onclick="Chat.close()"></div>
      <aside class="chat__panel" role="dialog" aria-label="Chat with HOMART">
        <header class="chat__header">
          <div class="chat__agent">
            <div class="chat__avatar">${initial}</div>
            <div>
              <div class="chat__name">${store.name || "HOMART"} Sales <span class="chat__status"></span></div>
              <div class="chat__sub">We reply in minutes · Bulk orders welcome</div>
            </div>
          </div>
          <button class="chat__close" onclick="Chat.close()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>

        <div class="chat__log" id="chat-log"></div>

        <!-- Product picker panel (hidden by default) -->
        <div class="chat__picker" id="chat-picker" style="display:none;">
          <div class="chat__picker-head">
            <span>Share a Product</span>
            <button onclick="Chat.closePicker()" aria-label="Close picker">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="chat__picker-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="picker-input" type="search" placeholder="Search products…" oninput="Chat.searchProducts(this.value)" autocomplete="off">
          </div>
          <div class="chat__picker-list" id="picker-list"></div>
        </div>

        <footer class="chat__composer">
          <div class="chat__toolbar">
            <button class="chat__tool-btn" onclick="Chat.openPicker()" title="Share a product">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              Share Product
            </button>
          </div>
          <div class="chat__input-row">
            <textarea id="chat-input" placeholder="Type a message…" rows="2"></textarea>
            <button class="btn btn--primary chat__send-btn" onclick="Chat.send()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </footer>
      </aside>
    </div>`;
  },

  /* ---------- 入口 ---------- */
  render(active) {
    document.getElementById("header-slot").innerHTML =
      this.renderHeader(active);
    document.getElementById("trustbar-slot").innerHTML = this.renderTrustBar();
    document.getElementById("footer-slot").innerHTML = this.renderFooter();
    document.body.insertAdjacentHTML("beforeend", this.renderChatDrawer());
    Layout.updateCartBadge();
    window.addEventListener("cart:update", Layout.updateCartBadge);
    Chat.init();
  },

  updateCartBadge() {
    const el = document.getElementById("cart-badge");
    if (!el) return;
    const n = Cart.count();
    el.textContent = n;
    el.classList.toggle("cart-badge--hide", n === 0);
  },

  submitSearch(e) {
    e.preventDefault();
    const q = document.getElementById("search-input").value.trim();
    const cat = document.getElementById("search-category").value;
    const params = {};
    if (q) params.q = q;
    if (cat) params.cat = cat;
    location.href =
      "category.html" +
      (Object.keys(params).length ? URLParams.build(params) : "");
  },

  /* ---------- 账号入口（根据登录态切换） ---------- */
  _renderAccountAction() {
    const user = (window.Auth && Auth.current()) || null;
    if (!user) {
      return `
        <a href="login.html" class="h-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
          <span>Sign in</span>
        </a>`;
    }
    const initials = (user.name || user.email || "?")
      .trim()
      .charAt(0)
      .toUpperCase();
    const merchantLink =
      user.role === "merchant"
        ? `<a class="acct-menu__item acct-menu__item--merchant" href="merchant-dashboard.html">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
           Merchant Panel
         </a>`
        : "";
    return `
      <div class="h-action h-action--account" onclick="Layout.toggleAccountMenu(event)" tabindex="0">
        <div class="h-action__avatar">${initials}</div>
        <span>${(user.name || "Account").split(" ")[0]}</span>
        <div class="acct-menu" id="acct-menu" onclick="event.stopPropagation()">
          <div class="acct-menu__user">
            <div class="acct-menu__avatar">${initials}</div>
            <div>
              <b>${user.name || "Account"}</b>
              <span>${user.email || ""}</span>
            </div>
          </div>
          ${merchantLink}
          ${user.role !== "merchant" ? `
          <a class="acct-menu__item" href="#" onclick="Toast.show('Orders page coming soon');return false;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            My Orders
          </a>` : ""}
          <a class="acct-menu__item" href="#" onclick="Layout.doLogout();return false;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </a>
        </div>
      </div>`;
  },
  toggleAccountMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById("acct-menu");
    if (!menu) return;
    menu.classList.toggle("is-open");
    const closeOnOutside = () => {
      menu.classList.remove("is-open");
      document.removeEventListener("click", closeOnOutside);
    };
    if (menu.classList.contains("is-open")) {
      setTimeout(() => document.addEventListener("click", closeOnOutside), 0);
    }
  },
  async doLogout() {
    try { if (window.Auth) await Auth.logout(); } catch (e) {}
    Toast.show("Signed out");
    setTimeout(() => (location.href = "index.html"), 400);
  },

  showContactPhone() {
    const s = this._getStore();
    const modal = document.getElementById("contact-modal");
    if (!modal) return;
    document.getElementById("contact-modal-name").textContent = s.name;
    const tel = document.getElementById("contact-modal-tel");
    tel.textContent = s.phone;
    tel.href = "tel:" + s.phone.replace(/\s/g, "");
    modal.style.display = "flex";
  },

  closeContactPhone() {
    const modal = document.getElementById("contact-modal");
    if (modal) modal.style.display = "none";
  },
};

/* ============================================================
   Chat — 客户侧聊天抽屉（实时双向）
   ============================================================ */
const Chat = {
  _convId: null,
  _useSb: false,
  _sbUnsub: null,
  _sbMsgs: [],
  _sbPoll: null,
  _sbLastSig: "",

  /* 初始化：Supabase 优先，否则 localStorage */
  init() {
    if (window.SupabaseChat && SupabaseChat.isReady()) {
      void Chat._initSupabase();
      return;
    }
    Chat._initLocal();
  },

  _initLocal() {
    const user = window.Auth && Auth.current();
    const session = user
      ? DataStore.updateSession({ name: user.name || user.email, email: user.email || "" })
      : DataStore.getSession();

    const conv = DataStore.getOrCreateConversation(
      session.id,
      session.name || "Guest",
      session.email || "",
    );
    Chat._convId = conv.id;

    const existing = DataStore.getConversationMessages(conv.id);
    if (existing.length === 0) {
      const store = window.Layout ? Layout._getStore() : {};
      DataStore.addMessage({
        conversationId: conv.id,
        sender: "seller",
        name: store.name || "HOMART Sales",
        message: "Hi! 👋 Welcome to HOMART Hardware. Ask us about pricing, stock, lead times, or paste a product list — we'll quote you quickly.",
      });
      DataStore.markConversationRead(conv.id, "customer");
    }

    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEYS.MESSAGES) Chat._onNewMessage();
    });
    window.addEventListener("homart:messages", (e) => {
      if (e.detail == null) {
        Chat._onNewMessage();
        return;
      }
      if (e.detail.conversationId === Chat._convId && e.detail.sender === "seller") {
        Chat._onNewMessage();
      }
    });
  },

  async _initSupabase() {
    try {
      const user = window.Auth && Auth.current();
      if (user)
        DataStore.updateSession({ name: user.name || user.email, email: user.email || "" });
      else DataStore.getSession();
      /* Mark Supabase as available but don't create a conversation until
         the customer actually opens the chat panel. */
      Chat._useSb = true;
      Chat._sbMsgs = [];
    } catch (err) {
      console.error("Supabase chat init failed", err);
      Chat._useSb = false;
      Chat._convId = null;
      Chat._initLocal();
    }
  },

  /* Called the first time the chat panel opens — creates the conversation lazily. */
  async _ensureConvAndRender() {
    if (!Chat._convId) {
      try {
        const convId = await SupabaseChat.ensureCustomerConversation();
        Chat._convId = convId;
        const welcome =
          "Hi! 👋 Welcome to HOMART Hardware. Ask us about pricing, stock, lead times, or paste a product list — we'll quote you quickly.";
        await SupabaseChat.seedWelcomeIfEmpty(convId, welcome);
        Chat._sbMsgs = await SupabaseChat.listMessages(convId);
        Chat._sbLastSig = Chat._sbMsgs
          .map((m) => m.id + "\t" + (m.timestamp || ""))
          .join("|");
        if (Chat._sbUnsub) Chat._sbUnsub();
        Chat._sbUnsub = SupabaseChat.subscribeConversation(convId, async () => {
          Chat._sbMsgs = await SupabaseChat.listMessages(convId);
          const el = document.getElementById("chat");
          if (el && el.classList.contains("chat--open"))
            await SupabaseChat.markCustomerRead(convId);
          Chat.render();
          Chat._updateUnreadBadge();
        });
        if (!Chat._sbPoll) {
          Chat._sbPoll = setInterval(async () => {
            if (!Chat._useSb || !Chat._convId) return;
            try {
              const next = await SupabaseChat.listMessages(Chat._convId);
              const sig = next.map((m) => m.id + "\t" + (m.timestamp || "")).join("|");
              if (sig !== Chat._sbLastSig) {
                Chat._sbLastSig = sig;
                Chat._sbMsgs = next;
                const el = document.getElementById("chat");
                if (el && el.classList.contains("chat--open"))
                  await SupabaseChat.markCustomerRead(Chat._convId);
                Chat.render();
                Chat._updateUnreadBadge();
              }
            } catch (e) {}
          }, 4000);
        }
      } catch (err) {
        console.error("Chat conversation init failed", err);
      }
    }
    Chat.render();
    Chat._updateUnreadBadge();
  },

  _markReadCustomer() {
    if (!Chat._convId) return;
    if (Chat._useSb) void SupabaseChat.markCustomerRead(Chat._convId);
    else DataStore.markConversationRead(Chat._convId, "customer");
  },

  _onNewMessage() {
    if (Chat._useSb) return;
    const el = document.getElementById("chat");
    const isOpen = el && el.classList.contains("chat--open");
    if (isOpen) {
      Chat.render();
      Chat._markReadCustomer();
    } else {
      Chat._updateUnreadBadge();
    }
  },

  _updateUnreadBadge() {
    const badge = document.getElementById("chat-unread-badge");
    if (!badge) return;
    if (Chat._useSb && Chat._convId) {
      void (async () => {
        try {
          const sb = SupabaseChat.getClient();
          if (!sb) return;
          const { data } = await sb
            .from("conversations")
            .select("unread_customer")
            .eq("id", Chat._convId)
            .single();
          const n = data && (data.unread_customer || 0);
          if (n > 0) {
            badge.textContent = n > 99 ? "99+" : String(n);
            badge.style.display = "inline-flex";
          } else {
            badge.style.display = "none";
          }
        } catch (e) {}
      })();
      return;
    }
    const conv = Chat._convId ? DataStore.getConversation(Chat._convId) : null;
    const n = conv ? (conv.unreadByCustomer || 0) : 0;
    if (n > 0) {
      badge.textContent = n > 99 ? "99+" : n;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  },

  open() {
    document.getElementById("chat").classList.add("chat--open");
    if (Chat._useSb && !Chat._convId) {
      Chat._ensureConvAndRender().then(() => Chat._markReadCustomer());
    } else {
      Chat.render();
      Chat._markReadCustomer();
      Chat._updateUnreadBadge();
    }
    setTimeout(() => document.getElementById("chat-input")?.focus(), 100);
  },
  close() {
    document.getElementById("chat").classList.remove("chat--open");
  },
  toggle() {
    const el = document.getElementById("chat");
    el.classList.toggle("chat--open");
    if (el.classList.contains("chat--open")) {
      if (Chat._useSb && !Chat._convId) {
        Chat._ensureConvAndRender().then(() => Chat._markReadCustomer());
      } else {
        Chat.render();
        Chat._markReadCustomer();
        Chat._updateUnreadBadge();
      }
      setTimeout(() => document.getElementById("chat-input")?.focus(), 100);
    }
  },

  render() {
    const log = document.getElementById("chat-log");
    if (!log || !Chat._convId) return;
    const msgs = Chat._useSb ? Chat._sbMsgs : DataStore.getConversationMessages(Chat._convId);
    const store = window.Layout ? Layout._getStore() : {};
    const storeName = store.name || "HOMART Sales";
    const storeInitial = storeName.charAt(0).toUpperCase();

    if (msgs.length === 0) {
      log.innerHTML = '<div style="text-align:center;color:var(--ink-400);font-size:13px;padding:20px">No messages yet. Say hi!</div>';
      return;
    }

    log.innerHTML = msgs.map((m) => {
      const isSeller = m.sender === "seller";
      const time = new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      let content = "";
      if (m.type === "product" && m.productId) {
        const p = DataStore.getProduct(m.productId);
        content = p
          ? `<a href="product.html?id=${p.id}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;background:var(--green-50);border:1px solid var(--green-100);border-radius:10px;padding:10px;margin:2px 0"><img src="${p.image}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;flex-shrink:0" onerror="this.style.display='none'"><div><div style="font-size:13px;font-weight:600;color:var(--ink-900)">${p.name}</div><div style="font-size:12px;color:var(--green-700);font-weight:600">KSh ${p.price.toLocaleString()}</div></div></a>`
          : `<div>📦 Product shared</div>`;
      } else if (m.type === "quote") {
        content = `<div style="background:var(--green-50);border:1px solid var(--green-200);border-radius:10px;padding:12px;font-size:13px"><div style="font-weight:700;color:var(--green-800);margin-bottom:4px">📄 Quotation</div><div>${(m.message || "").replace(/\n/g, "<br>")}</div></div>`;
      } else {
        content = `<div>${(m.message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</div>`;
      }
      return `
      <div class="chat-msg chat-msg--${m.sender}">
        ${isSeller ? `<div class="chat-msg__avatar">${storeInitial}</div>` : ""}
        <div class="chat-msg__bubble">
          ${content}
          <time>${time}</time>
        </div>
      </div>`;
    }).join("");
    log.scrollTop = log.scrollHeight;
  },

  send(text, productRef) {
    if (!Chat._convId) return;
    const input = document.getElementById("chat-input");
    const msg = text || (input && input.value.trim());
    if (!msg) return;
    const user = window.Auth && Auth.current();
    if (Chat._useSb) {
      void (async () => {
        try {
          await SupabaseChat.insertMessage(Chat._convId, "customer", msg, {
            type: "text",
          });
          Chat._sbMsgs = await SupabaseChat.listMessages(Chat._convId);
          Chat._sbLastSig = Chat._sbMsgs
            .map((m) => m.id + "\t" + (m.timestamp || ""))
            .join("|");
          if (input) input.value = "";
          Chat.render();
        } catch (err) {
          console.error(err);
          if (window.Toast) Toast.show("Could not send message", "error");
        }
      })();
      return;
    }
    DataStore.addMessage({
      conversationId: Chat._convId,
      sender: "customer",
      name: user ? (user.name || "Customer") : "Guest",
      message: msg,
      productRef: productRef || null,
    });
    if (input) input.value = "";
    Chat.render();
  },

  /* 从产品页一键询问 — 发送产品卡片 */
  askAbout(productId) {
    Chat.open();
    setTimeout(() => Chat.shareProduct(productId), 150);
  },

  /* 直接发送产品卡片消息 */
  shareProduct(productId) {
    if (!Chat._convId) return;
    const p = DataStore.getProduct(productId);
    if (!p) { if (window.Toast) Toast.show("Product not found", "error"); return; }
    const user = window.Auth && Auth.current();
    if (Chat._useSb) {
      void (async () => {
        try {
          await SupabaseChat.insertMessage(
            Chat._convId,
            "customer",
            `Shared product: ${p.name}`,
            { type: "product", productId },
          );
          Chat._sbMsgs = await SupabaseChat.listMessages(Chat._convId);
          Chat._sbLastSig = Chat._sbMsgs
            .map((m) => m.id + "\t" + (m.timestamp || ""))
            .join("|");
          Chat.closePicker();
          Chat.render();
          setTimeout(() => {
            const inp = document.getElementById("chat-input");
            if (inp) { inp.placeholder = "Add a message about this product…"; inp.focus(); }
          }, 80);
        } catch (err) {
          console.error(err);
          if (window.Toast) Toast.show("Could not share product", "error");
        }
      })();
      return;
    }
    DataStore.addMessage({
      conversationId: Chat._convId,
      sender: "customer",
      name: user ? (user.name || "Customer") : "Guest",
      type: "product",
      productId: productId,
      message: `Shared product: ${p.name}`,
    });
    Chat.closePicker();
    Chat.render();
    setTimeout(() => {
      const inp = document.getElementById("chat-input");
      if (inp) { inp.placeholder = "Add a message about this product…"; inp.focus(); }
    }, 80);
  },

  /* Product picker */
  openPicker() {
    const picker = document.getElementById("chat-picker");
    if (!picker) return;
    picker.style.display = "flex";
    Chat.searchProducts("");
    setTimeout(() => document.getElementById("picker-input")?.focus(), 80);
  },
  closePicker() {
    const picker = document.getElementById("chat-picker");
    if (picker) picker.style.display = "none";
  },
  searchProducts(query) {
    const list = document.getElementById("picker-list");
    if (!list) return;
    const q = (query || "").trim().toLowerCase();
    const products = DataStore.getProducts(q ? { search: q } : {}).slice(0, 12);
    if (products.length === 0) {
      list.innerHTML = '<div class="chat__picker-empty">No products found</div>';
      return;
    }
    list.innerHTML = products.map((p) => `
      <div class="chat__picker-item" onclick="Chat.shareProduct('${p.id}')">
        <img src="${p.image}" alt="" onerror="this.style.display='none'">
        <div class="chat__picker-item-body">
          <div class="chat__picker-item-name">${p.name}</div>
          <div class="chat__picker-item-price">KSh ${(p.price || 0).toLocaleString()}</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>`).join("");
  },
};

window.Layout = Layout;
window.Chat = Chat;

/* Enter 发送 */
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    !e.shiftKey &&
    e.target &&
    e.target.id === "chat-input"
  ) {
    e.preventDefault();
    Chat.send();
  }
});
