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
  SEED: "HOMART.seeded.v1",
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
const INITIAL_PRODUCTS = [
  /* 🌟 首页精选商品（截图 4 - featured: true） */
  {
    id: "p001",
    name: "Close Coupled Toilet Set",
    sku: "CCT-S-0001",
    category: "sanitary-ware",
    subcategory: "toilets",
    price: 12500,
    currency: "KSh",
    image: IMG.toilet,
    images: [IMG.toilet],
    inStock: true,
    stockQty: 40,
    featured: true,
    shortDesc: "S-Trap, Top Flush, White",
    description:
      "Premium porcelain two-piece toilet with soft-close seat and dual-flush system. Ideal for residential and commercial bathrooms.",
    tags: ["Porcelain", "Dual Flush", "Soft Close"],
    brand: "HOMART",
    material: "Porcelain",
    specs: {
      Type: "Close Coupled",
      Trap: "S-Trap",
      Flush: "Top Flush, Dual",
      Color: "White",
      Warranty: "3 Years",
      MOQ: "5 Pieces",
    },
    variants: { Size: ["Standard"], Color: ["White"] },
  },

  {
    id: "p002",
    name: "Basin Mixer Tap",
    sku: "BMT-BR-0012",
    category: "bathroom-fixtures",
    subcategory: "basin-mixer-taps",
    price: 5800,
    currency: "KSh",
    image: IMG.basinMixer,
    images: [
      IMG.basinMixer,
      IMG.basinMixer2,
      IMG.basinMixer,
      IMG.basinMixer2,
      IMG.basinMixer,
    ],
    inStock: true,
    stockQty: 120,
    featured: true,
    shortDesc: "Chrome Finish, Brass Body",
    description:
      "Premium solid brass construction with a brushed finish for long-lasting performance and elegant style.",
    longDescription:
      "This Brass Basin Mixer Tap blends durability with refined design. Crafted from high-grade solid brass and finished with a brushed surface, it resists corrosion and maintains a premium look for years. The smooth single-lever control ensures effortless water flow and temperature adjustment.",
    tags: ["Brass", "Chrome", "Single Lever"],
    brand: "HOMART",
    material: "Brass",
    specs: {
      Material: "Solid Brass",
      Finish: "Brushed Brass",
      "Tap Type": "Single Lever Basin Mixer",
      "Mounting Type": "Deck Mounted",
      "Cartridge Type": "Ceramic Disc Cartridge",
      "Fitting Type": 'G 1/2" (15mm)',
      Warranty: "5 Years (Manufacturing Defects)",
      MOQ: "10 Pieces",
    },
    variants: { Finish: ["Brushed Brass", "Chrome"] },
  },

  {
    id: "p003",
    name: 'uPVC Pipe 110mm (4")',
    sku: "UPVC-P-110",
    category: "plumbing",
    subcategory: "pipes",
    price: 1450,
    currency: "KSh",
    image: IMG.pipes,
    images: [IMG.pipes],
    inStock: true,
    stockQty: 500,
    featured: true,
    shortDesc: "Class D, 6m Length",
    description:
      "Heavy-duty uPVC pressure pipe, ideal for drainage and sewage applications. Corrosion-resistant with a long service life.",
    tags: ["uPVC", "Class D", "6m"],
    brand: "HOMART",
    material: "uPVC",
    specs: {
      Diameter: '110mm (4")',
      Length: "6 meters",
      Class: "Class D",
      Standard: "KS ISO 4422",
      MOQ: "10 Pieces",
    },
    variants: { Length: ["3m", "6m"] },
  },

  {
    id: "p004",
    name: "Brass Gate Valve 25mm",
    sku: "BGV-BSP-025",
    category: "plumbing",
    subcategory: "valves",
    price: 1250,
    currency: "KSh",
    image: IMG.gateValve,
    images: [IMG.gateValve],
    inStock: true,
    stockQty: 80,
    featured: true,
    shortDesc: "Screwed BSP, PN16",
    description:
      "Heavy duty forged brass gate valve with BSP threaded ends. Pressure rated to PN16 for municipal & industrial service.",
    tags: ["Brass", "BSP", "PN16"],
    brand: "HOMART",
    material: "Brass",
    specs: {
      Size: '25mm (1")',
      Type: "Gate Valve",
      "End Connection": "BSP Female Thread",
      "Pressure Rating": "PN16",
      MOQ: "10 Pieces",
    },
  },

  {
    id: "p005",
    name: "Adjustable Spanner 300mm",
    sku: "AS-CV-300",
    category: "tools",
    subcategory: "hand-tools",
    price: 1250,
    currency: "KSh",
    image: IMG.wrench,
    images: [IMG.wrench],
    inStock: true,
    stockQty: 150,
    featured: true,
    shortDesc: "Chrome Vanadium Steel",
    description:
      'Professional 12" adjustable spanner made from drop-forged chrome vanadium steel. Precision jaws & comfort grip.',
    tags: ["CrV", "300mm", "Hand Tool"],
    brand: "HOMART",
    material: "Chrome Vanadium Steel",
    specs: {
      Length: '300mm (12")',
      "Jaw Capacity": "35mm",
      Material: "Chrome Vanadium Steel",
      MOQ: "5 Pieces",
    },
  },

  {
    id: "p006",
    name: "Self Tapping Screws 4x25mm",
    sku: "STS-Z-425",
    category: "fasteners",
    subcategory: "screws",
    price: 320,
    currency: "KSh",
    image: IMG.screws,
    images: [IMG.screws],
    inStock: true,
    stockQty: 600,
    featured: true,
    shortDesc: "Zinc Plated, Box of 100",
    description:
      "Zinc-plated self-tapping screws with Phillips drive. Box of 100 pieces — ideal for metal, wood and plastic.",
    tags: ["Zinc Plated", "Phillips", "Box of 100"],
    brand: "HOMART",
    material: "Carbon Steel",
    specs: {
      Size: "4 × 25mm",
      Drive: "Phillips",
      Coating: "Zinc Plated",
      Pack: "Box of 100",
      MOQ: "20 Boxes",
    },
    variants: { Size: ["3×20mm", "4×25mm", "5×40mm", "6×60mm"] },
  },

  /* 💧 管配件分类页商品（截图 1） */
  {
    id: "p101",
    name: 'uPVC 90° Elbow 110mm (4")',
    sku: "UPVC-E90-110",
    category: "pipe-fittings",
    subcategory: "elbows",
    price: 450,
    currency: "KSh",
    image: IMG.elbow,
    images: [IMG.elbow],
    inStock: true,
    stockQty: 200,
    shortDesc: "uPVC, Class D, Socket End",
    description: "uPVC 90-degree socket-end elbow for drainage lines.",
    brand: "HOMART",
    material: "uPVC",
    specs: {
      Diameter: '110mm (4")',
      Angle: "90°",
      End: "Socket",
      MOQ: "10 Pieces",
    },
  },

  {
    id: "p102",
    name: 'uPVC Tee 110mm (4")',
    sku: "UPVC-T-110",
    category: "pipe-fittings",
    subcategory: "tees",
    price: 600,
    currency: "KSh",
    image: IMG.tee,
    images: [IMG.tee],
    inStock: true,
    stockQty: 180,
    shortDesc: "uPVC, Class D, Socket End",
    description: "Equal tee socket-end fitting for branch connections.",
    brand: "HOMART",
    material: "uPVC",
    specs: {
      Diameter: '110mm (4")',
      Type: "Equal Tee",
      End: "Socket",
      MOQ: "10 Pieces",
    },
  },

  {
    id: "p103",
    name: 'uPVC Coupler 110mm (4")',
    sku: "UPVC-C-110",
    category: "pipe-fittings",
    subcategory: "couplers",
    price: 350,
    currency: "KSh",
    image: IMG.coupler,
    images: [IMG.coupler],
    inStock: true,
    stockQty: 240,
    shortDesc: "uPVC, Class D, Socket End",
    description: "Straight coupler to join two pipes in the same diameter.",
    brand: "HOMART",
    material: "uPVC",
    specs: { Diameter: '110mm (4")', Type: "Straight", MOQ: "10 Pieces" },
  },

  {
    id: "p104",
    name: "uPVC Reducer 110x75mm",
    sku: "UPVC-R-110-75",
    category: "pipe-fittings",
    subcategory: "reducers",
    price: 320,
    currency: "KSh",
    image: IMG.reducer,
    images: [IMG.reducer],
    inStock: true,
    stockQty: 140,
    shortDesc: "uPVC, Class D, Socket End",
    description: "Reducer socket — 110mm to 75mm, for diameter transitions.",
    brand: "HOMART",
    material: "uPVC",
    specs: { From: "110mm", To: "75mm", MOQ: "10 Pieces" },
  },

  {
    id: "p105",
    name: 'Brass 90° Elbow 25mm (1")',
    sku: "BR-E90-25",
    category: "pipe-fittings",
    subcategory: "elbows",
    price: 1250,
    currency: "KSh",
    image: IMG.brassElbow,
    images: [IMG.brassElbow],
    inStock: true,
    stockQty: 90,
    shortDesc: "Brass, BSP Female Thread",
    description: "Heavy brass 90° elbow with female BSP threads on both ends.",
    brand: "HOMART",
    material: "Brass",
    specs: {
      Size: '25mm (1")',
      Angle: "90°",
      Thread: "BSP Female",
      MOQ: "10 Pieces",
    },
  },

  {
    id: "p106",
    name: 'Brass Tee 25mm (1")',
    sku: "BR-T-25",
    category: "pipe-fittings",
    subcategory: "tees",
    price: 1450,
    currency: "KSh",
    image: IMG.brassTee,
    images: [IMG.brassTee],
    inStock: true,
    stockQty: 75,
    shortDesc: "Brass, BSP Female Thread",
    description: "Brass equal-tee fitting, BSP female on all three ports.",
    brand: "HOMART",
    material: "Brass",
    specs: { Size: '25mm (1")', Thread: "BSP Female", MOQ: "10 Pieces" },
  },

  {
    id: "p107",
    name: "Stainless Steel Nipple 25mm",
    sku: "SS-N-25",
    category: "pipe-fittings",
    subcategory: "adapters",
    price: 780,
    currency: "KSh",
    image: IMG.brassNipple,
    images: [IMG.brassNipple],
    inStock: true,
    stockQty: 130,
    shortDesc: "SS 304, BSP Male Thread",
    description: "SS304 hex nipple, male BSP both ends. Corrosion-resistant.",
    brand: "HOMART",
    material: "Stainless Steel 304",
    specs: {
      Size: '25mm (1")',
      Thread: "BSP Male",
      Material: "SS 304",
      MOQ: "10 Pieces",
    },
  },

  {
    id: "p108",
    name: 'uPVC Union 32mm (1¼")',
    sku: "UPVC-U-32",
    category: "pipe-fittings",
    subcategory: "couplers",
    price: 950,
    currency: "KSh",
    image: IMG.union,
    images: [IMG.union],
    inStock: true,
    stockQty: 110,
    shortDesc: "uPVC, Socket End",
    description:
      "uPVC union with O-ring seal — allows easy dismantling for maintenance.",
    brand: "HOMART",
    material: "uPVC",
    specs: { Size: '32mm (1¼")', Type: "Union", MOQ: "10 Pieces" },
  },

  {
    id: "p109",
    name: "uPVC Pipe Clip 32mm",
    sku: "UPVC-PC-32",
    category: "pipe-fittings",
    subcategory: "adapters",
    price: 120,
    currency: "KSh",
    image: IMG.pipeClip,
    images: [IMG.pipeClip],
    inStock: true,
    stockQty: 350,
    shortDesc: "uPVC, Wall Mount",
    description: "Wall-mount pipe clip for 32mm pipes.",
    brand: "HOMART",
    material: "uPVC",
    specs: { Size: "32mm", Mount: "Wall", MOQ: "50 Pieces" },
  },

  {
    id: "p110",
    name: 'Brass Male Adapter 25mm (1")',
    sku: "BR-MA-25",
    category: "pipe-fittings",
    subcategory: "adapters",
    price: 0,
    currency: "KSh",
    requestPrice: true,
    image: IMG.adapter,
    images: [IMG.adapter],
    inStock: true,
    stockQty: 60,
    shortDesc: "Brass, BSP Male Thread",
    description:
      "Brass male adapter for transitioning between pipe systems. Contact sales for bulk pricing.",
    brand: "HOMART",
    material: "Brass",
    specs: { Size: '25mm (1")', Thread: "BSP Male", MOQ: "20 Pieces" },
  },

  /* 产品详情页的相关产品 */
  {
    id: "p201",
    name: "Chrome Basin Mixer Tap",
    sku: "CBMT-CR-0020",
    category: "bathroom-fixtures",
    subcategory: "basin-mixer-taps",
    price: 4200,
    currency: "KSh",
    image: IMG.basinMixer2,
    images: [IMG.basinMixer2],
    inStock: true,
    stockQty: 75,
    shortDesc: "Chrome Finish, Brass Body",
    description: "Classic chrome basin mixer with ceramic disc cartridge.",
    brand: "HOMART",
    material: "Brass",
    specs: { Finish: "Chrome", Material: "Brass", MOQ: "10 Pieces" },
  },

  {
    id: "p202",
    name: "Tall Basin Mixer Tap",
    sku: "TBMT-BR-0030",
    category: "bathroom-fixtures",
    subcategory: "basin-mixer-taps",
    price: 5900,
    currency: "KSh",
    image: IMG.basinMixer,
    images: [IMG.basinMixer],
    inStock: true,
    stockQty: 45,
    shortDesc: "Brushed Finish, Tall Body",
    description: "Tall body basin mixer — ideal for vessel basins.",
    brand: "HOMART",
    material: "Brass",
    specs: { Finish: "Brushed Brass", Height: "Tall", MOQ: "10 Pieces" },
  },

  {
    id: "p203",
    name: "Wall Mounted Basin Mixer",
    sku: "WMB-CR-0040",
    category: "bathroom-fixtures",
    subcategory: "basin-mixer-taps",
    price: 6700,
    currency: "KSh",
    image: IMG.basinMixer2,
    images: [IMG.basinMixer2],
    inStock: true,
    stockQty: 30,
    shortDesc: "Chrome, Wall Mounted",
    description: "Wall-mounted concealed basin mixer with lever handle.",
    brand: "HOMART",
    material: "Brass",
    specs: { Mount: "Wall", Finish: "Chrome", MOQ: "5 Pieces" },
  },

  {
    id: "p204",
    name: "Pop-up Waste Set (Brass)",
    sku: "PWS-BR-0050",
    category: "bathroom-fixtures",
    subcategory: "accessories",
    price: 950,
    currency: "KSh",
    image: IMG.brassNipple,
    images: [IMG.brassNipple],
    inStock: true,
    stockQty: 200,
    shortDesc: "Brass, Chrome Plated",
    description: "Pop-up waste set for basin — brass with chrome plating.",
    brand: "HOMART",
    material: "Brass",
    specs: { Material: "Brass", MOQ: "10 Pieces" },
  },

  {
    id: "p205",
    name: "Angle Valve (Brass)",
    sku: "AV-BR-0060",
    category: "plumbing",
    subcategory: "valves",
    price: 850,
    currency: "KSh",
    image: IMG.gateValve,
    images: [IMG.gateValve],
    inStock: true,
    stockQty: 180,
    shortDesc: 'Brass, 1/2"',
    description: 'Quarter-turn brass angle stop valve, 1/2".',
    brand: "HOMART",
    material: "Brass",
    specs: { Size: '1/2"', MOQ: "20 Pieces" },
  },

  {
    id: "p206",
    name: "Flexible Hose 60cm",
    sku: "FH-SS-060",
    category: "plumbing",
    subcategory: "plumbing-accessories",
    price: 380,
    currency: "KSh",
    image: IMG.pipes,
    images: [IMG.pipes],
    inStock: true,
    stockQty: 260,
    shortDesc: "SS Braided, 60cm",
    description: "Stainless steel braided flexible connector hose, 60cm.",
    brand: "HOMART",
    material: "Stainless Steel",
    specs: { Length: "60cm", MOQ: "20 Pieces" },
  },
];

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
    order.id = "o" + Date.now().toString(36).toUpperCase();
    order.status = order.status || "pending";
    order.createdAt = new Date().toISOString();
    list.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
    return order;
  },

  /* ---------- 客户 Session ---------- */
  getSession() {
    let s = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || "null");
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
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));
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
window.STORAGE_KEYS = STORAGE_KEYS;
window.FALLBACK_IMG = FALLBACK_IMG;

/* 初始化 */
DataStore.init();
