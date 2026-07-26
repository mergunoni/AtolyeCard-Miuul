/**
 * Demo product catalog. Replace with API/CMS source before production.
 *
 * Images are the workshop's own photographs, resized to 900px JPEG for the web.
 * Full-resolution originals live in /assets-source/products (not shipped).
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
      "Çarkta çekilen gövde ağza doğru hafifçe incelir, kulp parmağa rahat oturur. Mat yüzeyde çark halkaları ve ustanın parmak izi belli belirsiz seçilir.",
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
      "Kırmızı kil sırlanmadan bırakıldığı için topraktaki fazla su gövdeden buharlaşır. Zamanla dış yüzeyde açık renkli mineral izleri belirir, saksı kendi patinasını edinir.",
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
      "Yeşil incir kabuğunun sütlü serinliği, altta ısınan sedir odunuyla dengeleniyor. Yakınca ağır durmuyor; geç yaz akşamlarında açık pencereden gelen bahçe kokusuna benziyor.",
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
  /* prd-007 "Kavanoz Mum (Portakal Çiçeği)" withdrawn from the catalog.
     The id is retired, never reassigned — see the schema note above. */
  {
    id: "prd-008",
    slug: "gumus-kaplama-yaprak-kolye",
    name: "Gümüş Kaplama Yaprak Kolye",
    category: "taki",
    price: 1150,
    currency: "TRY",
    image: "/images/products/gumus-kaplama-yaprak-kolye.jpg",
    description:
      "Bahçeden toplanan zeytin yaprağı kalıba gömülür; metal döküldüğünde yaprağın damarları ve kenarındaki küçük yırtık da yüzeye geçer. Bu yüzden hiçbir uç diğerinin aynısı olmaz.",
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
      "Pirinç levha soğukken çekiçlenir, her vuruş yüzeyde küçük bir çukur bırakır ve ışık bu çukurlardan dağınık yansır. Hacimli görünür ama kulakta ağırlığını hissettirmez.",
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
  {
    id: "prd-011",
    slug: "kul-sirli-servis-tabagi",
    name: "Kül Sırlı Servis Tabağı",
    category: "seramik",
    price: 690,
    currency: "TRY",
    image: "/images/products/kul-sirli-servis-tabagi.jpg",
    description:
      "Fırında eriyen odun külü sırı gövdenin alt kenarına doğru akar ve her pişirimde başka bir yerde toplanır. Bu yüzden iki tabağın damla deseni asla birbirini tutmaz.",
    stock: { status: "low_stock", quantity: 5 },
    specs: {
      material: "Şamotlu stoneware",
      dimensions: "Ø 24 × 3 cm",
      weight: "720 g",
      color: "Kül grisi · petrol mavisi",
      finish: "Odun külü sırı, yarı mat",
      care: "Fırına ve bulaşık makinesine uygun",
    },
    features: [
      "Her pişirimde farklı akış deseni",
      "Servis ve fırın kabı olarak kullanılır",
      "Çift pişirimle sertleştirilmiş gövde",
    ],
  },
  {
    id: "prd-012",
    slug: "blok-mum-deniz-tuzu-adacayi",
    name: 'Blok Mum "Deniz Tuzu & Adaçayı"',
    category: "mum",
    price: 420,
    currency: "TRY",
    image: "/images/products/blok-mum-deniz-tuzu-adacayi.jpg",
    description:
      "Deniz tuzunun serinliği adaçayının kuru otsu kokusuyla açılıyor, arkada ince bir okaliptüs izi kalıyor. Kalıptan çıkan blok, yüzeyinde mumun kendi çekme çizgilerini taşıyor.",
    stock: { status: "in_stock", quantity: 33 },
    specs: {
      material: "Soya + kolza mumu",
      dimensions: "7 × 7 × 12 cm",
      weight: "410 g",
      burnTime: "~60 saat",
      wick: "Ahşap fitil",
      care: "Düz ve ısıya dayanıklı tabak üzerinde yakın",
    },
    features: [
      "Ahşap fitil hafif çıtırtı verir",
      "Kabı yok, tamamı yanar",
      "Serin ve otsu koku ailesi",
    ],
  },
  {
    id: "prd-013",
    slug: "oksitlenmis-gumus-halka-bileklik",
    name: "Oksitlenmiş Gümüş Halka Bileklik",
    category: "taki",
    price: 980,
    currency: "TRY",
    image: "/images/products/oksitlenmis-gumus-halka-bileklik.jpg",
    description:
      "Gümüş tel halka hâline getirilip oksitlendikten sonra yalnızca çıkıntılı yerleri elle parlatılır; girintilerde kalan koyu ton dokuyu öne çıkarır. Kolda döndükçe mat ve parlak yüzeyler sırayla görünür.",
    stock: { status: "in_stock", quantity: 9 },
    specs: {
      material: "925 ayar gümüş",
      dimensions: "İç çap 6,2 cm · Tel 3 mm",
      weight: "18 g",
      color: "Antik gümüş",
      finish: "Oksit patina, tepe noktaları parlak",
      care: "Kuru bezle silin, parlatma bezi kullanmayın",
    },
    features: [
      "Bilek ölçüsüne göre hafifçe esnetilir",
      "Patina zamanla derinleşir",
      "Tek parça telden bükülür",
    ],
  },
];

/** @param {string} slug */
export const getProductBySlug = (slug) =>
  products.find((product) => product.slug === slug);
