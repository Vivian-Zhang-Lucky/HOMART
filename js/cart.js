/* ============================================================
   HOMART Hardware · Cart & Utils
   ============================================================ */

/* ---------- 格式化 ---------- */
const fmtKSh = (n) => "KSh " + Number(n || 0).toLocaleString("en-KE");

/* ---------- 购物车 ---------- */
const Cart = {
  get() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]");
  },
  save(items) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    Cart._dispatch();
  },
  count() {
    return Cart.get().reduce((a, i) => a + i.qty, 0);
  },
  /** 合并同 productId + 同 variantKey */
  add(productId, qty = 1, variant = null) {
    const items = Cart.get();
    const key = variant ? JSON.stringify(variant) : "";
    const existing = items.find(
      (i) => i.productId === productId && (i.variantKey || "") === key,
    );
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        productId,
        qty,
        variant,
        variantKey: key,
        addedAt: Date.now(),
      });
    }
    Cart.save(items);
    Toast.show(`Added to cart`);
  },
  remove(index) {
    const items = Cart.get();
    items.splice(index, 1);
    Cart.save(items);
  },
  update(index, qty) {
    const items = Cart.get();
    if (qty <= 0) {
      items.splice(index, 1);
    } else {
      items[index].qty = qty;
    }
    Cart.save(items);
  },
  clear() {
    Cart.save([]);
  },
  /** 返回 [{product, qty, variant, subtotal}] —— 自动拉取最新商品数据 */
  detailed() {
    return Cart.get()
      .map((item) => {
        const product = DataStore.getProduct(item.productId);
        return {
          ...item,
          product,
          subtotal: product ? product.price * item.qty : 0,
        };
      })
      .filter((row) => row.product);
  },
  subtotal() {
    return Cart.detailed().reduce((a, r) => a + r.subtotal, 0);
  },
  _dispatch() {
    window.dispatchEvent(new CustomEvent("cart:update"));
  },
};

/* 监听跨 tab 的 storage 事件（例如商家版改价后客户端同步） */
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEYS.CART || e.key === STORAGE_KEYS.PRODUCTS) {
    Cart._dispatch();
  }
});

/* ---------- Toast 提示 ---------- */
const Toast = {
  show(message, type = "success") {
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "toast toast--" + type;
    el.innerHTML = `
      <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${
          type === "success"
            ? '<polyline points="20 6 9 17 4 12"></polyline>'
            : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
        }
      </svg>
      <span>${message}</span>`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("toast--visible"));
    setTimeout(() => {
      el.classList.remove("toast--visible");
      setTimeout(() => el.remove(), 300);
    }, 2400);
  },
};

/* ---------- URL 参数 ---------- */
const URLParams = {
  get(key) {
    return new URLSearchParams(location.search).get(key);
  },
  getAll() {
    return Object.fromEntries(new URLSearchParams(location.search).entries());
  },
  build(obj) {
    return "?" + new URLSearchParams(obj).toString();
  },
};

/* ---------- 图片降级 ---------- */
function safeImg(src) {
  return `<img src="${src}" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';" alt="" loading="lazy">`;
}

/* 暴露全局 */
window.Cart = Cart;
window.Toast = Toast;
window.URLParams = URLParams;
window.fmtKSh = fmtKSh;
window.safeImg = safeImg;
