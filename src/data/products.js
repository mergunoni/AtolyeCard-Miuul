/**
 * Demo product catalog. Replace with API/CMS source before production.
 *
 * @typedef {"in_stock" | "low_stock" | "out_of_stock"} StockStatus
 *
 * @typedef {Object} Product
 * @property {string}   id          Stable identifier, never reused.
 * @property {string}   slug        kebab-case, used in URLs.
 * @property {string}   name
 * @property {"seramik" | "mum" | "taki"} category
 * @property {number}   price       Minor units excluded — plain TRY amount.
 * @property {string}   currency    ISO 4217.
 * @property {string}   image       Path under /public.
 * @property {string}   description One or two sentences, shown on the detail page.
 * @property {{ status: StockStatus, quantity: number, restockAt?: string }} stock
 * @property {Object<string, string>} specs    Attribute rows on the detail page.
 * @property {string[]} features    Short selling points, 3 per product.
 */

/** @type {Product[]} */
export const products = [
  {
    id: "prd-001",
    slug: "toprak-seramik-kupa",
    name: "Toprak Seramik Kupa",
    category: "seramik",
    price: 480,
    currency: "TRY",
    image: "/images/products/toprak-seramik-kupa.jpg",
    description:
      "Çarkta elde şekillendirilmiş, mat toprak tonlu günlük kupa. Her parça kendi el izini taşır.",
    stock: { status: "in_stock", quantity: 24 },
    specs: {
      material: "Stoneware kil",
      dimensions: "9 × 9 × 10 cm",
      capacity: "300 ml",
      weight: "340 g",
      color: "Terrakota",
      care: "Bulaşık makinesinde yıkanabilir",
    },
    features: [
      "Çarkta tek tek şekillendirilir",
      "Gıdaya uygun kurşunsuz sır",
      "Mikrodalga fırına uygun",
    ],
  },
  {
    id: "prd-004",
    slug: "sirsiz-seramik-saksi",
    name: "Sırsız Seramik Saksı",
    category: "seramik",
    price: 620,
    currency: "TRY",
    image: "/images/products/sirsiz-seramik-saksi.jpg",
    description:
      "Nefes alan sırsız gövdesiyle sukulent ve kaktüsler için ideal, tabaklı saksı.",
    stock: { status: "out_of_stock", quantity: 0, restockAt: "2026-08-15" },
    specs: {
      material: "Kırmızı çömlek kili",
      dimensions: "Ø 16 × 15 cm",
      weight: "980 g",
      color: "Doğal kiremit",
      drainage: "Drenaj deliği + tabak dahil",
      care: "Dış mekâna uygun değil",
    },
    features: [
      "Sırsız gövde fazla nemi dışarı verir",
      "Tabağı ürüne dahildir",
      "Sukulent ve kaktüs için önerilir",
    ],
  },
  {
    id: "prd-005",
    slug: "soya-mumu-incir-sedir",
    name: 'Soya Mumu "İncir & Sedir"',
    category: "mum",
    price: 350,
    currency: "TRY",
    image: "/images/products/soya-mumu-incir-sedir.jpg",
    description:
      "Olgun incir ve sedir ağacı notalarıyla harmanlanmış, seramik kapta dökülmüş soya mumu.",
    stock: { status: "in_stock", quantity: 41 },
    specs: {
      material: "%100 soya mumu",
      dimensions: "Ø 8 × 8 cm",
      weight: "180 g",
      burnTime: "~35 saat",
      wick: "Pamuk fitil",
      care: "Her yakışta fitili 5 mm'ye kısaltın",
    },
    features: [
      "Kurşunsuz pamuk fitil",
      "Biten kabı saksı olarak kullanılabilir",
      "El ile küçük partiler hâlinde dökülür",
    ],
  },
  {
    id: "prd-007",
    slug: "kavanoz-mum-portakal-cicegi",
    name: 'Kavanoz Mum "Portakal Çiçeği"',
    category: "mum",
    price: 390,
    currency: "TRY",
    image: "/images/products/kavanoz-mum-portakal-cicegi.jpg",
    description:
      "Amber cam kavanozda, portakal çiçeği ve bergamot esansıyla hazırlanmış çift fitilli mum.",
    stock: { status: "low_stock", quantity: 4 },
    specs: {
      material: "Soya + hindistan cevizi mumu",
      dimensions: "Ø 9 × 10 cm",
      weight: "260 g",
      burnTime: "~45 saat",
      wick: "Çift pamuk fitil",
      care: "İlk yakışta 2 saat açık bırakın",
    },
    features: [
      "Çift fitil ile eşit erime",
      "Kapaklı amber cam kavanoz",
      "Fitil makası hediyeli",
    ],
  },
  {
    id: "prd-008",
    slug: "gumus-kaplama-yaprak-kolye",
    name: "Gümüş Kaplama Yaprak Kolye",
    category: "taki",
    price: 1150,
    currency: "TRY",
    image: "/images/products/gumus-kaplama-yaprak-kolye.jpg",
    description:
      "Gerçek zeytin yaprağının kalıbı alınarak dökülen, 925 ayar gümüş kaplama kolye ucu ve zinciri.",
    stock: { status: "in_stock", quantity: 11 },
    specs: {
      material: "925 ayar gümüş kaplama pirinç",
      dimensions: "Uç 3,5 cm · Zincir 45 cm",
      weight: "6 g",
      color: "Gümüş",
      clasp: "Ayarlanabilir ıstakoz kilit",
      care: "Parfüm ve suyla temastan kaçının",
    },
    features: [
      "Gerçek yapraktan kalıp alınır",
      "Zincir uzunluğu ayarlanabilir",
      "Hediye kutusunda gönderilir",
    ],
  },
  {
    id: "prd-010",
    slug: "el-dovme-pirinc-kupe",
    name: "El Dövme Pirinç Küpe",
    category: "taki",
    price: 760,
    currency: "TRY",
    image: "/images/products/el-dovme-pirinc-kupe.jpg",
    description:
      "Çekiçle dövülerek dokusu oluşturulan, hafif ve büyük hacimli pirinç küpe. Kancaları gümüştür.",
    stock: { status: "out_of_stock", quantity: 0, restockAt: "2026-09-01" },
    specs: {
      material: "Pirinç gövde, 925 ayar gümüş kanca",
      dimensions: "4,5 × 2,8 cm",
      weight: "9 g (çift)",
      color: "Antik altın",
      finish: "Çekiç dövme doku",
      care: "Yumuşak bezle parlatın",
    },
    features: [
      "Her çift elde dövülür",
      "Gümüş kanca ile alerji riski düşük",
      "Hafif yapı, gün boyu konfor",
    ],
  },
];

/** @param {string} slug */
export const getProductBySlug = (slug) =>
  products.find((product) => product.slug === slug);
