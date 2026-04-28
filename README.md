# HOMART Hardware

Factory-direct hardware, plumbing &amp; sanitary ware e‑commerce for the Kenyan market. One codebase — two faces:

- **Customer storefront** for shoppers (browse, cart, checkout, live chat)
- **Merchant admin panel** for store owners (products, orders, messages, analytics, settings)

Both share the same `localStorage` so a merchant edit is reflected instantly on the customer's tab.

Vanilla HTML / CSS / JavaScript. No build step. No backend.

---

## Quick start

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Demo accounts

| Role     | Email                        | Password      |
| -------- | ---------------------------- | ------------- |
| Merchant | `admin@HOMARThardware.co.ke` | `merchant123` |
| Customer | `customer@demo.com`          | `demo123`     |

Or register a fresh account at `/login.html`. To register as a **merchant**, expand "Have a merchant invite code?" and enter `HOMART-MERCHANT-2026`. Without a code you register as a customer.

---

## Pages

### Customer site

| File            | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `index.html`    | Home — hero, category tiles, featured products, CTA       |
| `category.html` | Category / search results with filters, sort, pagination  |
| `product.html`  | Product detail — gallery, variants, specs, related        |
| `cart.html`     | Cart + 4-step checkout (Cart → Delivery → Payment → Done) |
| `login.html`    | Shared sign-in / registration (customer or merchant)      |

### Merchant admin (requires merchant session)

| File                         | Purpose                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `merchant-dashboard.html`    | KPIs, sales/inquiry chart, recent updates, recent inquiries          |
| `merchant-products.html`     | Product list with search/filter/bulk actions, pagination, CSV export |
| `merchant-product-edit.html` | Create/edit a product — all fields, image upload, live preview       |
| `merchant-messages.html`     | 3-column chat inbox — conversations, thread, customer details        |
| `merchant-categories.html`   | Category &amp; subcategory CRUD                                      |
| `merchant-orders.html`       | Order table with status selector, detail drawer                      |
| `merchant-customers.html`    | Customer list derived from orders + registered users, CSV export     |
| `merchant-analytics.html`    | Revenue KPIs, 7‑day trend, category &amp; top‑product bars           |
| `merchant-settings.html`     | Store info, payments, notifications, account, data backup/reset      |

---

## File layout

```
/
├── index.html   category.html   product.html   cart.html   login.html
├── merchant-dashboard.html
├── merchant-products.html   merchant-product-edit.html
├── merchant-messages.html
├── merchant-categories.html
├── merchant-orders.html   merchant-customers.html   merchant-analytics.html
├── merchant-settings.html
├── css/
│   ├── style.css        (customer site + shared tokens)
│   └── merchant.css     (sidebar, topbar, panels, tables, charts)
├── js/
│   ├── auth.js          (users, sessions, role-based guards)
│   ├── data.js          (DataStore + seed products/categories)
│   ├── cart.js          (Cart API + fmtKSh + Toast + URLParams)
│   ├── layout.js        (customer header/trustbar/footer/chat drawer)
│   └── merchant-layout.js (merchant sidebar + topbar + footer)
└── README.md
```

---

## Authentication

`js/auth.js` provides a tiny localStorage-backed auth system.

- Users live under `HOMART.users`, sessions under `HOMART.session`.
- Two roles: `customer` and `merchant`.
- Registration flow in `login.html` includes an optional **merchant invite code** field — the correct code (`HOMART-MERCHANT-2026`) creates a merchant account; blank or wrong code creates a customer.
- Cross-tab session sync is wired via the `storage` event.
- **Passwords are stored in plaintext. This is demo-only.** Any real deployment must put auth on a server with hashed passwords.

### Public API

```js
Auth.init(); // seeds demo accounts once
Auth.register({ name, email, password, phone, inviteCode });
Auth.login(email, password);
Auth.logout();
Auth.current(); // → user object or null (no password)
Auth.isMerchant() / Auth.isCustomer();
Auth.updateProfile(patch);
Auth.requireMerchant(); // page guard — redirects to login.html if not merchant
Auth.requireAny(); // page guard — redirects if not signed in
```

Every `merchant-*.html` page calls `Auth.requireMerchant()` at the top of its script; a logged-out visitor or a customer is bounced to `login.html?redirect=<original>` and sent back after signing in.

---

## Data architecture

All state is persisted in `localStorage`. Keys are declared once in `js/data.js` &amp; `js/auth.js`. The merchant panel and customer site read/write the exact same keys, so a product edit, price change, or chat reply shows up live on the other side (cross-tab sync via the `storage` event).

### DataStore API

```js
DataStore.init()                     // seeds once, idempotent
DataStore.resetAll()                 // nukes store data, re-seeds sample data
                                     //   (does NOT touch auth/users)

// Categories
DataStore.getCategories() / getCategory(id)

// Products
DataStore.getProducts(filter?)       // filter = {category, subcategory, featured, material,
                                     //           minPrice, maxPrice, inStock, search, sort}
DataStore.getProduct(id)
DataStore.getRelatedProducts(p, n=6)
DataStore.saveProducts(list)
DataStore.upsertProduct(product)
DataStore.deleteProduct(id)

// Orders
DataStore.getOrders() / createOrder(order)

// Messages
DataStore.getMessages() / addMessage(msg)

// Wishlist
DataStore.getWishlist() / toggleWishlist(id) / isInWishlist(id)
```

### Cart API

```js
Cart.get() / save(items) / count() / clear();
Cart.add(productId, (qty = 1), (variant = null));
Cart.remove(index) / update(index, qty);
Cart.detailed() / subtotal();
```

---

## Design tokens (`css/style.css`)

```
--green-700: #1e4a34   (primary brand)
--green-800: #183a29   (hover)
--green-50 / --green-100 (tints)
--ink-50 … --ink-900    (neutrals)
--stock-bg / --stock-fg (In Stock badge)
--r-sm / --r-md / --r-lg (radii)
--font-display: 'Manrope'
```

Merchant-specific styles live in `css/merchant.css` and use the same tokens.

---

## Testing

Two jsdom-based test scripts cover the whole app:

```bash
cd /tmp && npm install jsdom
node test-pages.js   # all 15 pages load without errors
node test-e2e.js     # 29 behavioural assertions pass
```

Coverage includes: seed users, customer and merchant registration, invite-code validation, duplicate-email rejection, auth guards, product CRUD, message persistence, order lifecycle, `resetAll()` behaviour.

---

## Notes for production

Before going live:

1. **Replace `auth.js`** with real server-side auth (hashed passwords, JWT/session cookies, rate limiting, password reset).
2. **Replace `data.js` persistence** with API calls — the schema can stay the same.
3. **Integrate payment providers** — the M-PESA / Bank / Card flows in `cart.html` are UI-only today.
4. **Configure tax &amp; delivery** — default delivery is KSh 800 flat, tax is 0%. Adjust in checkout and merchant settings.
5. **Add image hosting** — product images are currently URLs or base64 data URLs. At scale, upload to S3/Cloudinary and store only the URL.
6. **Rotate the merchant invite code** in `js/auth.js` and move it server-side.
