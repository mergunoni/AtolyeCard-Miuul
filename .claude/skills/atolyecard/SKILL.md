---
name: atolyecard
description: AtölyeKart dijital kartvizit (AtolyeCard) veya ürün kataloğu üzerinde çalışılırken kullanılır — kartvizit.html, AtolyeCard.jsx, ProductGrid.jsx, src/data/card.js, src/data/products.js, "Kartı Kaydet"/vCard indirme, "Toplantı Talep Et" formu, webhook payload'ı, n8n/Make/Zapier bağlantısı, ürün ekleme/fiyat/stok durumu değişikliği veya kart alanlarının (telefon, e-posta, sosyal linkler) düzenlenmesi söz konusu olduğunda.
---

# AtolyeCard

AtölyeKart'ın tek kişilik dijital kartvizitini render eden React bileşeni. İki dış aksiyonu vardır: **Kartı Kaydet** (vCard indirme) ve **Toplantı Talep Et** (form → webhook). Bu doküman bileşenin dosya/veri kurallarını ve webhook veri sözleşmesini tanımlar.

## Bileşen Kuralları

| Kural | Değer |
|---|---|
| Dosya | `src/components/AtolyeCard.jsx` — **tek dosya**, JSX + stiller birlikte |
| Tip | Fonksiyon bileşeni (`export default function AtolyeCard({ card })`) |
| State | Sadece hook'lar (`useState`, `useEffect`). Class bileşen yok |
| Demo veri | `src/data/card.js` — bileşenin içine gömülmez |
| Alt bileşen | Yok. Satır/ikon/buton parçaları aynı dosyada yerel fonksiyon olarak kalır |
| Metinler | Kullanıcıya görünen her metin Türkçe; kod ve yorumlar İngilizce |

**Tek dosya ne demek:** `AtolyeCard.jsx` kendi başına çalışır — dışarıdan sadece `src/data/card.js` ve webhook URL'i (`import.meta.env.VITE_WEBHOOK_URL`) alır. Bileşeni `AtolyeCardHeader`, `AtolyeCardRow` gibi ayrı dosyalara bölmeyin; kart tek bir görsel birim ve tek bir bakım noktasıdır.

**Veri bileşene prop olarak girer.** `AtolyeCard` içinde `import { card } from "../data/card"` yapmayın; veriyi çağıran taraf verir. Böylece kart ileride API/CMS verisiyle beslenebilir.

```jsx
// src/App.jsx
import { card } from "./data/card";
import AtolyeCard from "./components/AtolyeCard";

export default function App() {
  return <AtolyeCard card={card} />;
}
```

## Demo Veri — `src/data/card.js`

Tek bir named export: `card`. Şema sabittir; yeni alan eklendiğinde bu doküman ve webhook `card` bloğu birlikte güncellenir.

```js
// Demo data. Replace with API/CMS source before production.
export const card = {
  slug: "elif-yilmaz",                    // required — webhook'ta kartın kimliği
  fullName: "Elif Yılmaz",                // required
  initials: "EY",                         // required — avatar fallback
  role: "Seramik Eğitmeni · Atölye Kurucusu",
  organization: "AtölyeKart",
  tagline: "El yapımı seramik atölyeleri ve birebir dersler.",
  phone: "+905551234567",                 // E.164, boşluksuz
  email: "elif@atolyekart.com",
  website: "https://www.atolyekart.com",
  location: { label: "Kadıköy, İstanbul", mapsUrl: "https://maps.google.com/?q=..." },
  socials: [                              // type: instagram | whatsapp | linkedin | x
    { type: "instagram", url: "https://instagram.com/atolyekart" },
    { type: "whatsapp", url: "https://wa.me/905551234567" },
  ],
};
```

Kurallar:
- Telefon **E.164** (`+90...`, boşluk/parantez yok). Görüntülemede formatlamak bileşenin işi.
- Opsiyonel alan yoksa **anahtarı yazmayın** — `null`/`""` göndermeyin. Bileşen eksik alanın satırını render etmez.
- `slug` kebab-case ve değişmez; webhook tarafında kartı eşleştiren anahtardır.

## Ürün Kataloğu — `src/data/products.js`

Kartvizit tek bir objedir; katalog **dizi**dir. Aynı dosya/veri kuralları geçerlidir: veri dosyası saf veridir, bileşen veriyi prop olarak alır, kullanıcıya görünen metin veri dosyasına girmez.

```js
{
  id: "prd-001",                 // required — sabit, silinse bile yeniden kullanılmaz
  slug: "toprak-seramik-kupa",   // required — kebab-case, URL anahtarı
  name: "Toprak Seramik Kupa",   // required
  category: "seramik",           // seramik | mum | taki
  price: 480,                    // required — sade TRY tam sayısı, kuruş yok
  currency: "TRY",               // ISO 4217
  image: "/images/products/toprak-seramik-kupa.jpg",  // /public altında, slug ile aynı ad
  description: "…",              // 1–2 cümle
  stock: { status, quantity, restockAt },
  specs: { material: "…", dimensions: "…" },          // serbest anahtarlı
  features: ["…", "…", "…"],     // tam 3 madde
}
```

| Kural | Gerekçe |
|---|---|
| `price` sayı, string değil | Sıralama ve filtreleme; biçimleme `Intl.NumberFormat("tr-TR")` ile bileşende |
| `stock.status` enum: `in_stock` / `low_stock` / `out_of_stock` | Boolean, "son 3 adet" rozetini ve tükendi akışını ayıramaz |
| `stock.quantity` her zaman yazılır | `low_stock` rozeti adedi gösterir; `out_of_stock` için `0` |
| `stock.restockAt` **sadece** `out_of_stock` ürünlerde | "Gelince haber ver" akışının dayanağı; `YYYY-MM-DD` |
| `specs` anahtarları kategoriye göre değişir | Mumda `burnTime`, takıda `clasp`, seramikte `capacity`. Sabit liste boş satır üretir |
| `features` tam 3 madde | Kart yüksekliği grid'de tutarlı kalır |
| Türkçe etiketler veri dosyasında **yok** | `stockLabels` gibi UI metinleri bileşende durur; kod İngilizce / arayüz Türkçe |

Yeni ürün eklerken: `id` sıradaki numara, `slug` ve `image` dosya adı birebir aynı, `specs` içinde en az `material` ve `dimensions`.

### Liste bileşeni — `src/components/ProductGrid.jsx`

Tek dosya kuralı burada da geçerli: grid, ürün kartı ve stiller aynı dosyada. `ProductCard` ayrı dosyaya çıkarılmaz — sadece bu grid içinde kullanılır.

```jsx
<ProductGrid products={products} onAddToCart={fn} onNotify={fn} />
```

- Aksiyonlar **prop**tur, bileşen içinde fetch/webhook çağrısı yapılmaz.
- `out_of_stock` ürünlerde birincil buton "Sepete Ekle" yerine "Gelince Haber Ver" olur; buton `disabled` bırakılmaz — tükenen ürün de bir dönüşüm noktasıdır.
- Boş dizi geldiğinde grid değil, Türkçe boş durum metni render edilir.

## Webhook Veri Sözleşmesi

Her iki aksiyon da **aynı uca** POST edilir; ayrımı `event` alanı yapar.

```
POST  import.meta.env.VITE_WEBHOOK_URL
Content-Type: application/json
```

### Ortak zarf

Her payload tam olarak şu üst seviye anahtarları içerir — fazlası eklenmez:

```json
{
  "event": "card_saved | meeting_request",
  "sentAt": "2026-07-26T11:03:11.482Z",
  "card": {
    "slug": "elif-yilmaz",
    "fullName": "Elif Yılmaz",
    "organization": "AtölyeKart"
  },
  "meta": {
    "source": "web",
    "locale": "tr-TR",
    "referrer": "https://instagram.com/",
    "userAgent": "Mozilla/5.0 ..."
  }
}
```

- `sentAt`: ISO 8601, **UTC** (`new Date().toISOString()`).
- `card`: kartın tamamı değil, sadece bu üç alan. Telefon/e-posta gibi sahibinin iletişim bilgileri webhook'a gönderilmez — zaten alıcı tarafında bilinir.
- `meta.referrer`: boşsa anahtarı atlayın.

### `card_saved` — Kartı Kaydet

vCard **indirildikten sonra** gönderilir (kullanıcı dosyayı almadan olay üretilmez). Ortak zarfa ek alan yoktur:

```json
{
  "event": "card_saved",
  "sentAt": "2026-07-26T11:03:11.482Z",
  "card": { "slug": "elif-yilmaz", "fullName": "Elif Yılmaz", "organization": "AtölyeKart" },
  "meta": { "source": "web", "locale": "tr-TR", "userAgent": "Mozilla/5.0 ..." }
}
```

vCard indirmesi webhook'a **bağlı değildir**: istek başarısız olsa da dosya iner ve kullanıcıya hata gösterilmez (fire-and-forget, `catch` sessiz).

### `meeting_request` — Toplantı Talep Et

Ortak zarfa `request` bloğu eklenir:

```json
{
  "event": "meeting_request",
  "sentAt": "2026-07-26T11:05:40.117Z",
  "card": { "slug": "elif-yilmaz", "fullName": "Elif Yılmaz", "organization": "AtölyeKart" },
  "request": {
    "name": "Ayşe Demir",
    "email": "ayse@example.com",
    "phone": "+905321112233",
    "topic": "Birebir seramik dersi",
    "preferredAt": "2026-08-04T10:00:00+03:00",
    "message": "Hafta içi akşam saatleri benim için uygun."
  },
  "meta": { "source": "web", "locale": "tr-TR", "userAgent": "Mozilla/5.0 ..." }
}
```

| Alan | Zorunlu | Kural |
|---|---|---|
| `request.name` | ✅ | 2–80 karakter, trim'lenmiş |
| `request.email` | ✅ | Geçerli e-posta; küçük harfe çevrilir |
| `request.phone` | ➖ | E.164. Yoksa anahtar yazılmaz |
| `request.topic` | ➖ | Maks. 120 karakter |
| `request.preferredAt` | ➖ | ISO 8601, **timezone offset'li** (`+03:00`). Sadece tarih varsa `T00:00:00+03:00` |
| `request.message` | ➖ | Maks. 1000 karakter |

`meeting_request` fire-and-forget **değildir**: doğrulama istemcide yapılır, gönderim sırasında buton `disabled` olur, 2xx cevabı beklenir.

### `order_request` — Sipariş Ver

Katalog kartındaki "Sipariş Ver" butonunun açtığı modaldan gönderilir. Kartvizit olayları `card` bloğu taşır; sipariş olayı onun yerine **`product`** ve **`order`** bloklarını taşır:

```json
{
  "event": "order_request",
  "sentAt": "2026-07-26T15:22:08.940Z",
  "product": {
    "id": "prd-001",
    "slug": "toprak-seramik-kupa",
    "name": "Toprak Seramik Kupa",
    "price": 480,
    "currency": "TRY"
  },
  "order": {
    "name": "Ayşe Demir",
    "phone": "+905321112233"
  },
  "meta": { "source": "web", "locale": "tr-TR", "userAgent": "Mozilla/5.0 ..." }
}
```

| Alan | Zorunlu | Kural |
|---|---|---|
| `product` | ✅ | Ürünün tamamı değil, sadece bu beş alan. `specs`/`features`/`description` gönderilmez |
| `product.price` | ✅ | Sipariş anındaki fiyat; sonradan zam gelse bile talep bu fiyatla kaydedilir |
| `order.name` | ✅ | 2–80 karakter, trim'lenmiş |
| `order.phone` | ✅ | E.164'e çevrilmiş (`+90…`). Kullanıcı 10 haneli girer, istemci normalleştirir |

Kurallar:
- Buton **yalnızca stokta olan ürünlerde** gösterilir; `out_of_stock` kartlarda "Gelince Haber Ver" kalır — tükenen ürüne sipariş çıkmaz.
- `meeting_request` gibi fire-and-forget **değildir**: boş alanla gönderim istemcide engellenir, gönderim sırasında buton `disabled` olur, 2xx beklenir.
- 2xx sonrası modal "Siparişiniz alındı" onayını gösterir ve **3 sn** sonra kapanır; zamanlayıcı unmount'ta temizlenir.

### Cevap ve hata davranışı

| Durum | Bileşen davranışı |
|---|---|
| 2xx | Formu temizle, Türkçe onay mesajı göster |
| 4xx / 5xx / ağ hatası | Formu koru, Türkçe hata mesajı göster, tekrar denemeye izin ver |
| 10 sn timeout | `AbortController` ile iptal → hata durumu |

Cevap gövdesi okunmaz; sadece HTTP durumu dikkate alınır. Böylece webhook sağlayıcısı (n8n, Make, Zapier) değiştiğinde bileşen değişmez.

### Gönderim iskeleti

```js
// Single endpoint for both events; `event` discriminates.
async function postEvent(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
```

## Sık Yapılan Hatalar

- **Kartı alt bileşenlere bölmek** → tek dosya kuralı bozulur, stiller dağılır.
- **`src/data/card.js`'i bileşen içinden import etmek** → kart tek bir kişiye çakılır, prop'la geçin.
- **Tüm `card` nesnesini webhook'a göndermek** → sözleşme `slug`, `fullName`, `organization` ile sınırlı.
- **`preferredAt`'i offset'siz göndermek** → sunucu tarafında saat kayar; her zaman `+03:00` gibi offset ekleyin.
- **Webhook hatasında vCard indirmesini iptal etmek** → `card_saved` fire-and-forget'tir, kullanıcı akışını bloklamaz.
- **Webhook URL'ini koda gömmek** → `.env.local` içinde `VITE_WEBHOOK_URL`, `.env.example`'a örnek değer.
- **`price`'ı `"480 TL"` gibi string yazmak** → sıralama/filtreleme kırılır; sayı tutup bileşende biçimlendirin.
- **Stoku `inStock: true/false` yapmak** → `low_stock` ve "gelince haber ver" akışı kaybolur.
- **Tükenen ürünün butonunu `disabled` bırakmak** → talep toplama fırsatı kaçar, "Gelince Haber Ver"e çevirin.
