/* ============================================================
   HOMART Hardware · Merchant Layout
   ------------------------------------------------------------
   所有 merchant-*.html 页面共享:
   · 左侧边栏 (logo + 导航 + 商家资料 + 登出)
   · 顶栏 (页面标题 + 搜索 + 通知 + 帮助 + 店铺状态)
   · 底部 "Proudly Kenyan" 黑色条

   用法:
     MerchantLayout.render({ active: 'dashboard', title: 'Merchant Dashboard' });
   ============================================================ */

const MerchantLayout = {
  /* 守卫 + 渲染 */
  render({ active = "", title = "Dashboard", headerExtra = "" } = {}) {
    if (!Auth.requireMerchant()) return false;
    const user = Auth.current();

    document.body.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="m-shell">
        ${this.renderSidebar(active, user)}
        <div class="m-main">
          ${this.renderTopbar(title, headerExtra)}
          <div class="m-content" id="m-content"></div>
          ${this.renderFooter()}
        </div>
      </div>
    `,
    );
    document.body.classList.add("merchant-body");

    /* 通知点 */
    MerchantLayout.refreshBadges();
    window.addEventListener("storage", MerchantLayout.refreshBadges);
    return true;
  },

  renderSidebar(active, user) {
    const NAV = [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "merchant-dashboard.html",
        icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
      },
      {
        id: "products",
        label: "Products",
        href: "merchant-products.html",
        icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
      },
      {
        id: "categories",
        label: "Categories",
        href: "merchant-categories.html",
        icon: '<circle cx="6.5" cy="6.5" r="3.5"/><circle cx="17.5" cy="6.5" r="3.5"/><circle cx="6.5" cy="17.5" r="3.5"/><circle cx="17.5" cy="17.5" r="3.5"/>',
      },
      {
        id: "messages",
        label: "Messages",
        href: "merchant-messages.html",
        icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        badge: "msg",
      },
      {
        id: "customers",
        label: "Customers",
        href: "merchant-customers.html",
        icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      },
      {
        id: "orders",
        label: "Orders",
        href: "merchant-orders.html",
        icon: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
        badge: "order",
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "merchant-analytics.html",
        icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
      },
      {
        id: "settings",
        label: "Settings",
        href: "merchant-settings.html",
        icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      },
    ];

    const initials = (user.name || user.email || "?")
      .trim()
      .charAt(0)
      .toUpperCase();

    return `
      <aside class="m-sidebar">
        <a href="merchant-dashboard.html" class="m-sidebar__logo">
          <div class="m-sidebar__brand"><b>HOMART</b><span>HARDWARE</span></div>
        </a>

        <nav class="m-nav">
          ${NAV.map(
            (item) => `
            <a class="m-nav__link ${active === item.id ? "is-active" : ""}" href="${item.href}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
              <span>${item.label}</span>
              ${item.badge ? `<span class="m-nav__badge" data-badge="${item.badge}" hidden>0</span>` : ""}
            </a>`,
          ).join("")}
        </nav>

        <div class="m-sidebar__user">
          <div class="m-sidebar__user-info">
            <div class="m-sidebar__user-avatar">${initials}</div>
            <div>
              <b>${user.name || "Admin"}</b>
              <span>${user.email || ""}</span>
            </div>
            <button class="m-sidebar__user-caret" aria-label="Expand" onclick="MerchantLayout.toggleUserMenu(this)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          <button class="m-logout" onclick="MerchantLayout.logout()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>`;
  },

  renderTopbar(title, headerExtra) {
    return `
      <div class="m-sidebar-overlay" id="m-sidebar-overlay" onclick="MerchantLayout.closeSidebar()"></div>
      <header class="m-topbar">
        <div class="m-topbar__title">
          <button class="m-hamburger" aria-label="Open menu" onclick="MerchantLayout.openSidebar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          ${headerExtra || ""}
          <h1>${title}</h1>
        </div>
        <div class="m-topbar__search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" placeholder="Search products, orders, customers…" id="m-global-search" onkeydown="if(event.key==='Enter') MerchantLayout.doSearch(this.value)">
        </div>
        <div class="m-topbar__actions">
          <button class="m-icon-btn" aria-label="Notifications" onclick="Toast.show('No new notifications')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="m-icon-btn__dot" id="m-notif-dot" hidden></span>
          </button>
          <button class="m-icon-btn m-help-btn" aria-label="Help" onclick="Toast.show('Help centre coming soon')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
          </button>
          <button class="m-status-toggle" id="m-store-status" onclick="MerchantLayout.toggleStore(this)">
            <span class="m-status-dot"></span>
            <span class="m-status-label">Store Online</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </header>`;
  },

  renderFooter() {
    return `
      <footer class="m-footer">
        <span>Proudly Kenyan <span class="flag" aria-hidden="true">🇰🇪</span></span>
        <span>Built for quality. Built for Kenya.</span>
      </footer>`;
  },

  /* ---------- 小工具 ---------- */
  toggleStore(el) {
    const online = !el.classList.contains("is-offline");
    el.classList.toggle("is-offline", online);
    const label = el.querySelector(".m-status-label");
    label.textContent = online ? "Store Offline" : "Store Online";
    Toast.show(
      online ? "Store set to Offline" : "Store is now Online",
      online ? "info" : "success",
    );
  },

  toggleUserMenu(btn) {
    btn.closest(".m-sidebar__user").classList.toggle("is-expanded");
  },

  doSearch(q) {
    q = (q || "").trim();
    if (!q) return;
    // 简化: 直接跳商品列表页
    location.href = "merchant-products.html?q=" + encodeURIComponent(q);
  },

  logout() {
    if (confirm("Sign out of the merchant panel?")) {
      Auth.logout();
      location.href = "login.html";
    }
  },

  /* 侧边栏徽章: 未读消息 + 待处理订单 */
  openSidebar() {
    document.querySelector(".m-sidebar")?.classList.add("is-open");
    document.getElementById("m-sidebar-overlay")?.classList.add("is-visible");
  },
  closeSidebar() {
    document.querySelector(".m-sidebar")?.classList.remove("is-open");
    document.getElementById("m-sidebar-overlay")?.classList.remove("is-visible");
  },

  refreshBadges() {
    const msgBadge = document.querySelector('[data-badge="msg"]');
    const orderBadge = document.querySelector('[data-badge="order"]');

    if (msgBadge) {
      // 未读 = 来自客户 且 没被 merchant-read 标记
      const msgs = DataStore.getMessages().filter(
        (m) =>
          (m.sender === "customer" || m.from === "customer") && !m.merchantRead,
      );
      const n = msgs.length;
      msgBadge.hidden = n === 0;
      msgBadge.textContent = n;
    }
    if (orderBadge) {
      const n = DataStore.getOrders().filter(
        (o) => o.status === "pending",
      ).length;
      orderBadge.hidden = n === 0;
      orderBadge.textContent = n;
    }

    const dot = document.getElementById("m-notif-dot");
    if (dot) {
      const hasAny =
        (msgBadge && !msgBadge.hidden) || (orderBadge && !orderBadge.hidden);
      dot.hidden = !hasAny;
    }
  },
};

window.MerchantLayout = MerchantLayout;
