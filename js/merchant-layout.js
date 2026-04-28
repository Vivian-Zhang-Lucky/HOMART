/* ============================================================
   HOMART Hardware · Merchant Layout (SPA edition)
   ------------------------------------------------------------
   所有 merchant-*.html 页面共享:
   · 左侧边栏 (logo + 导航 + 商家资料 + 登出)
   · 顶栏 (页面标题 + 搜索 + 通知 + 帮助 + 店铺状态)
   · 底部 "Proudly Kenyan" 黑色条

   用法:
     MerchantLayout.render({ active: 'dashboard', title: 'Merchant Dashboard' });

   SPA: 首次调用渲染完整 shell；后续调用（由 navigate() 触发）
   检测到 .m-shell 已存在则只更新 active 状态和标题。
   ============================================================ */

const MerchantLayout = {
  _initialized: false,   // shell 是否已渲染
  _pageCleanup: null,    // 当前页注册的清理函数（离开时调用）

  /* ── 守卫 + 渲染 / 更新 ── */
  async render({ active = "", title = "Dashboard", headerExtra = "" } = {}) {
    if (!await Auth.requireMerchant()) return false;
    const user = Auth.current();

    if (document.querySelector(".m-shell")) {
      /* Shell 已存在 → SPA 模式：只更新状态 */
      this._updateShell({ active, title, headerExtra });
      return true;
    }

    /* 首次渲染完整 shell */
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

    /* 实时订阅：客户发消息时立即更新 badge */
    if (window._sbClient) {
      window._sbClient
        .channel("merchant-badge")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "conversations",
        }, () => MerchantLayout.refreshBadges())
        .subscribe();
    }

    /* 兜底轮询：每15秒刷新一次 badge，防止 realtime 未启用时失效 */
    setInterval(() => MerchantLayout.refreshBadges(), 15000);

    /* SPA 导航监听（仅初始化一次） */
    if (!this._initialized) {
      this._initialized = true;
      this._bindNav();
      window.addEventListener("popstate", (e) => {
        if (e.state && e.state.spa) {
          MerchantLayout.navigate(e.state.url, { pushState: false });
        }
      });
      /* 记录当前页面状态，使浏览器返回键能回来 */
      history.replaceState(
        { spa: true, url: location.pathname + location.search },
        "",
        location.pathname + location.search,
      );
    }

    return true;
  },

  /* 更新已有 shell 中的动态部分 */
  _updateShell({ active, title, headerExtra }) {
    /* 更新 nav active */
    document.querySelectorAll(".m-nav__link[data-nav-id]").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.navId === active);
    });
    /* 更新标题 */
    const h1 = document.getElementById("m-topbar-title");
    if (h1) h1.textContent = title;
    /* 更新 headerExtra */
    const extra = document.getElementById("m-topbar-extra");
    if (extra) extra.innerHTML = headerExtra || "";
    /* 清空内容区，让页面脚本重新填充 */
    const content = document.getElementById("m-content");
    if (content) content.innerHTML = "";
  },

  /* 拦截页面内所有指向 merchant-*.html 的链接 */
  _bindNav() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (!link) return;
      /* 忽略外部链接、target="_blank"、非 merchant 页面 */
      if (link.target === "_blank") return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("//")) return;
      if (!href.match(/^merchant-[^/]+\.html/)) return;
      e.preventDefault();
      MerchantLayout.navigate(href, { pushState: true });
    });
  },

  /* SPA 页面切换 */
  async navigate(url, { pushState = true } = {}) {
    /* 规范化 URL（去掉 hash/search 中多余信息只保留文件名） */
    const fetchUrl = url.split("?")[0];

    /* 显示简单 loading 指示 */
    const content = document.getElementById("m-content");
    if (content) {
      content.innerHTML =
        '<div style="padding:60px 20px;text-align:center;color:var(--ink-400)">Loading…</div>';
    }

    /* 调用上一个页面的清理函数 */
    if (typeof this._pageCleanup === "function") {
      this._pageCleanup();
      this._pageCleanup = null;
    }

    let html;
    try {
      const res = await fetch(fetchUrl);
      html = await res.text();
    } catch {
      if (content)
        content.innerHTML =
          '<div style="padding:60px 20px;text-align:center;color:var(--ink-500)">Failed to load page.</div>';
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    /* 注入页面专属 <style> 标签（去重） */
    document.querySelectorAll("style[data-spa-page]").forEach((s) => s.remove());
    doc.querySelectorAll("style").forEach((s) => {
      const clone = document.createElement("style");
      clone.setAttribute("data-spa-page", "1");
      clone.textContent = s.textContent;
      document.head.appendChild(clone);
    });

    /* 更新浏览器地址栏 */
    if (pushState) {
      history.pushState({ spa: true, url }, "", url);
    }

    /* 执行页面内联脚本（body 里最后一个 <script> 块，通常是页面逻辑） */
    const scripts = Array.from(doc.querySelectorAll("body script"));
    /* 过滤掉外部脚本（src 属性已由主页面加载过了） */
    const inlineScripts = scripts.filter((s) => !s.src);

    for (const s of inlineScripts) {
      try {
        /* Wrap the page IIFE with "return await" so navigate() properly
           waits for the async IIFE to finish before resolving. Without
           this, fn.call() returns immediately and errors inside the IIFE
           are silently lost, leaving #m-content blank. */
        /* eslint-disable-next-line no-new-func */
        const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;
        /* Strip trailing ";" so  return await ((async()=>{})();)  → valid */
        const src = s.textContent.trim().replace(/;\s*$/, "");
        const fn = new AsyncFn(`return await (${src})`);
        await fn.call(window);
      } catch (err) {
        console.error("[SPA] script error in", fetchUrl, err);
        const c = document.getElementById("m-content");
        if (c) c.innerHTML = `<div style="padding:48px 24px;text-align:center;color:var(--ink-500)">Failed to load page content.<br><small style="color:var(--ink-400)">${err.message || err}</small></div>`;
      }
    }
  },

  /* ── Sidebar ── */
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
        <a href="merchant-dashboard.html" class="m-sidebar__logo" data-nav-id="dashboard">
          <div class="m-sidebar__brand"><b>HOMART</b><span>HARDWARE</span></div>
        </a>

        <nav class="m-nav">
          ${NAV.map(
            (item) => `
            <a class="m-nav__link ${active === item.id ? "is-active" : ""}" href="${item.href}" data-nav-id="${item.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
              <span>${item.label}</span>
              ${item.badge ? `<span class="m-nav__badge" data-badge="${item.badge}" style="display:none">0</span>` : ""}
            </a>`,
          ).join("")}
          <div class="m-nav__divider"></div>
          <a class="m-nav__link m-nav__link--store" href="index.html" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>View Store</span>
            <svg class="m-nav__external" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </a>
        </nav>

        <div class="m-sidebar__user">
          <div class="m-sidebar__user-info" onclick="MerchantLayout.toggleUserMenu(this)">
            <div class="m-sidebar__user-avatar">${initials}</div>
            <div>
              <b>${user.name || "Admin"}</b>
              <span>${user.email || ""}</span>
            </div>
            <button type="button" class="m-sidebar__user-caret" aria-label="Expand menu">
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
          <span id="m-topbar-extra">${headerExtra || ""}</span>
          <h1 id="m-topbar-title">${title}</h1>
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

  toggleUserMenu(anchor) {
    const root =
      anchor && anchor.classList && anchor.classList.contains("m-sidebar__user")
        ? anchor
        : anchor && anchor.closest && anchor.closest(".m-sidebar__user");
    if (root) root.classList.toggle("is-expanded");
  },

  doSearch(q) {
    q = (q || "").trim();
    if (!q) return;
    MerchantLayout.navigate("merchant-products.html?q=" + encodeURIComponent(q), { pushState: true });
  },

  async logout() {
    if (confirm("Sign out of the merchant panel?")) {
      await Auth.logout();
      location.href = "login.html";
    }
  },

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
      if (window._sbClient) {
        window._sbClient
          .from("conversations")
          .select("unread_merchant")
          .eq("merchant_id", "default-store")
          .then(({ data }) => {
            const n = (data || []).reduce((s, r) => s + (r.unread_merchant || 0), 0);
            msgBadge.style.display = n === 0 ? "none" : "";
            msgBadge.textContent = n;
            const dot = document.getElementById("m-notif-dot");
            if (dot) dot.hidden = n === 0 && (!orderBadge || orderBadge.style.display === "none");
          });
      } else {
        const msgs = DataStore.getMessages().filter(
          (m) => (m.sender === "customer" || m.from === "customer") && !m.merchantRead,
        );
        const n = msgs.length;
        msgBadge.style.display = n === 0 ? "none" : "";
        msgBadge.textContent = n;
      }
    }

    if (orderBadge) {
      const n = DataStore.getOrders().filter((o) => o.status === "pending").length;
      orderBadge.style.display = n === 0 ? "none" : "";
      orderBadge.textContent = n;
    }

    if (!window._sbClient) {
      const dot = document.getElementById("m-notif-dot");
      if (dot) {
        const hasAny =
          (msgBadge && msgBadge.style.display !== "none") ||
          (orderBadge && orderBadge.style.display !== "none");
        dot.hidden = !hasAny;
      }
    }
  },
};

window.MerchantLayout = MerchantLayout;
