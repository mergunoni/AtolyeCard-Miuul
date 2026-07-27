---
name: atolyecard
description: AtölyeKart ürün kataloğu veya dijital kartvizit üzerinde çalışılırken kullanılır — AtolyeCard.html, src/data/products.js, ProductCard/ProductList, sipariş ve stok bildirimi modalları, vCard indirme, webhook payload'ı, n8n/Make/Zapier bağlantısı, ürün ekleme/fiyat/stok durumu değişikliği veya kart alanlarının (telefon, e-posta, sosyal linkler) düzenlenmesi söz konusu olduğunda.
---

# AtölyeKart

Projede **iki ayrı teslimat** var. Karıştırmayın:

| | Ürün kataloğu | Dijital kartvizit |
|---|---|---|
| Giriş noktası | `index.html` | `AtolyeCard.html` |
| Teknoloji | React + Vite | Düz HTML, inline CSS + JS |
| Veri | `src/data/products.js` | Dosyanın içinde sabit |
| Dış aksiyon | Sipariş Ver, Stok Bildirimi İste (webhook) | Rehbere Kaydet (vCard) |
| Stil | `src/index.css` | Kendi `<style>` bloğu |

İkisi de `npm run build` ile derlenir; `vite.config.js` içindeki `rollupOptions.input` iki giriş noktasını da tanımlar. Birbirlerine karşılıklı bağlanırlar (katalogda `.page__card-link`, kartta `.catalog-link`).

## Dosya Haritası

```
index.html                     Vite giriş noktası → src/main.jsx
AtolyeCard.html                Kartvizit, kendi kendine yeten tek dosya
vite.config.js                 İki giriş noktası + server.host
src/
  App.jsx                      Sayfa iskeleti, toast state'i, aksiyon handler'ları
  index.css                    Katalogun tüm stilleri, tasarım token'ları
  components/
    ProductList.jsx            Ürün dizisini grid'e basar, boş durumu yönetir
    ProductCard.jsx            Tek ürün kartı; modalların sahibi
    ProductImage.jsx           Görsel + yüklenemezse placeholder
    PageQrCode.jsx             Sayfanın kendi adresinin QR'ı
    FormModal.jsx / .css       Paylaşılan modal kabuğu (portal, Escape, odak)
    OrderModal.jsx / .css      Sipariş formu (ad + telefon)
    StockAlertModal.jsx        Stok bildirimi formu (ad + e-posta)
  lib/
    webhook.js                 postEvent + WebhookError + buildMeta
    useWebhookForm.js          Form yaşam döngüsü hook'u
    format.js                  formatPrice
  data/products.js             Katalog verisi
public/images/products/        Ürün fotoğrafları, <slug>.jpg
assets-source/                 Tam çözünürlüklü orijinaller — git dışında
```

**`src/components/ProductGrid.jsx` ölü koddur.** Hiçbir yerden import edilmiyor; `App.jsx` `ProductList` kullanır. Yeni iş yaparken ona dokunmayın, silinmesi gerekir.

## Bileşen Kuralları

| Kural | Değer |
|---|---|
| Tip | Fonksiyon bileşeni, sadece hook'lar. Class bileşen yok |
| Veri | Bileşen içinde `import { products }` yapılmaz; prop olarak girer |
| Aksiyonlar | Prop'tur. `ProductList`/`ProductCard` içinde fetch/webhook çağrılmaz |
| Metinler | Kullanıcıya görünen her metin Türkçe; kod ve yorumlar İngilizce |
| Stil | Katalog stilleri `src/index.css`'te; modal stilleri bileşenin yanında (`FormModal.css`) |

**Bileşen kompozisyonu serbesttir.** Modal kabuğu (`FormModal`) ve gönderim durum makinesi (`useWebhookForm`) iki form arasında paylaşılır; bu ayrıştırma bilinçlidir, geri alınmamalıdır. Yeni bir webhook formu gerektiğinde bu ikisinin üzerine kurun — alanlar, doğrulama, payload ve metinler çağıran tarafta kalır.

> Bu dokümanın eski sürümü "tek dosya, alt bileşen yok" kuralını dayatıyordu. Katalog bu kuralı aşmış durumda ve mevcut yapı kasıtlıdır; kural kaldırıldı.

## Kartvizit — `AtolyeCard.html`

| Kural | Değer |
|---|---|
| Dosya | `AtolyeCard.html`, kök dizinde, **tek parça** |
| Bağımlılık | Yok. Harici script, stylesheet veya font yüklemez |
| Veri | HTML içinde sabit; ayrı bir veri dosyası yoktur |
| Aksiyon | Yalnızca vCard indirme (`#saveVcard`). Webhook çağrısı yapmaz |
| Palet | `src/index.css`'teki token'ların elle tutulan kopyası |

**Neden tek parça:** kart elden ele verilen, tek başına açılan bir dosyadır. `src/index.css`'i import etseydi tek başına taşınamazdı. Bedeli şu: **palet katalogda değişirse `AtolyeCard.html` içindeki `:root` bloğunu elle güncellemeniz gerekir.** Dosyanın başında bu not duruyor.

**İletişim bilgileri dosyada üç yerde tekrar eder** ve elle senkron tutulur:

1. Görünen satırlar (`.row` içindeki `.value`) ve bunların `href`'leri (`tel:`, `mailto:`)
2. WhatsApp bağlantısı (`wa.me/<numara>`)
3. `#saveVcard` script'indeki vCard string'i (`TEL;`, `EMAIL;`, `FN:`, `N:`) ve indirilen dosya adı

**Alan adı henüz yok.** "Web" satırı `/` adresine (kataloğa) bakar ve vCard'da `URL:` satırı **bilerek yoktur** — rehbere kaydedilen ölü bir adres, adres olmamasından kötüdür. `atolyekart.com` yayına girdiğinde ikisini birlikte geri koyun.

Ayrıca avatar baş harfleri (`.avatar`) ve `<title>` de isme bağlıdır. Biri değişip diğeri unutulursa kartta yazan bilgi ile rehbere kaydedilen bilgi ayrışır; bu sessiz bir hatadır, kimse fark etmez.

> **Gerçek kişisel veri uyarısı.** Bu dosya git'te izleniyor. Gerçek telefon/e-posta yazıldığında commit edildiği anda repo geçmişine kalıcı girer; repo herkese açıksa bilgi internete açılır ve geçmişten çıkarmak force-push ile geçmiş yeniden yazmayı gerektirir. Gerçek veriye geçmeden önce reponun görünürlüğünü teyit edin.

## Ürün Kataloğu — `src/data/products.js`

Dizi. Veri dosyası saf veridir: kullanıcıya görünen etiketler (`Stokta`, `Malzeme`) bileşende durur, burada değil.

```js
{
  id: "prd-001",                 // required — sabit, silinse bile yeniden kullanılmaz
  slug: "toprak-seramik-kupa",   // required — kebab-case, URL ve dosya adı anahtarı
  name: "Toprak Seramik Kupa",   // required
  category: "seramik",           // seramik | mum | taki
  price: 480,                    // required — sade TRY tam sayısı, kuruş yok
  currency: "TRY",               // ISO 4217
  image: "/images/products/toprak-seramik-kupa.jpg",  // slug ile aynı ad
  description: "…",              // 1–2 cümle
  stock: { status, quantity, restockAt },
  specs: { material: "…", dimensions: "…" },          // serbest anahtarlı
  features: ["…", "…", "…"],     // tam 3 madde
}
```

| Kural | Gerekçe |
|---|---|
| `price` sayı, string değil | Sıralama ve filtreleme; biçimleme `lib/format.js` içinde |
| `stock.status` enum: `in_stock` / `low_stock` / `out_of_stock` | Boolean, "son 3 adet" rozetini ve tükendi akışını ayıramaz |
| `stock.quantity` her zaman yazılır | `low_stock` rozeti adedi gösterir; `out_of_stock` için `0` |
| `stock.restockAt` **sadece** `out_of_stock` ürünlerde | Kartın altındaki "tekrar stokta" notunun dayanağı; `YYYY-MM-DD` |
| `specs` anahtarları kategoriye göre değişir | Mumda `burnTime`, takıda `clasp`, seramikte `capacity` |
| `features` tam 3 madde | Kart yüksekliği grid'de tutarlı kalır |

**Mevcut durum:** 8 ürün — `prd-001, 004, 005, 008, 010, 011, 012, 013`. Aradaki numaralar emekliye ayrılmıştır (`prd-007` "Kavanoz Mum" katalogdan çıkarıldı); **id'ler yeniden kullanılmaz.**

### Görseller

Fotoğraflar `public/images/products/<slug>.jpg`, 900px genişlik, JPEG kalite 80. Tam çözünürlüklü orijinaller `assets-source/products/` altındadır ve `.gitignore`'dadır — ikili dosyalar git geçmişini kalıcı şişirir.

Yeni fotoğraf eklerken: 900px'e indirin, slug adıyla kaydedin, orijinali `assets-source/` altına koyun. macOS dosya adları NFD normalizasyonu kullanır; Türkçe adlarla eşleştirme yaparken iki tarafı da `normalize("NFC")` ile karşılaştırın, yoksa `ü`/`ö`/`ç` içeren adlar tutmaz.

## Katalog Davranışı

- `out_of_stock` ürünlerde birincil buton **"Stok Bildirimi İste"** olur, modal açar (ad + e-posta).
- Gönderim başarılı olunca buton **"Bildirim kaydedildi"** durumuna geçip `disabled` olur. Bu durum yalnızca `useState`'te tutulur; sayfa yenilenince sıfırlanır.
- Stokta olan ürünlerde "Sepete Ekle" (toast) ve "Sipariş Ver" (modal) bulunur.
- Boş dizi geldiğinde grid değil, Türkçe boş durum metni render edilir.
- Grid sabit 4 sütun; satır uzunluğu tasarım kararıdır, viewport'un yan etkisi değil.

## Webhook Veri Sözleşmesi

Her olay **aynı uca** POST edilir; ayrımı `event` alanı yapar. Taşıma katmanı `src/lib/webhook.js`.

```
POST  import.meta.env.VITE_WEBHOOK_URL
Content-Type: application/json
```

Payload tam olarak şu üst seviye anahtarları içerir — **fazlası eklenmez**: `event`, `sentAt`, olay bloğu, `meta`.

- `sentAt`: ISO 8601, **UTC** (`new Date().toISOString()`).
- `meta`: `{ source: "web", locale: "tr-TR", userAgent }`. `referrer` boşsa anahtar yazılmaz.
- Cevap gövdesi okunmaz; yalnızca HTTP durumu dikkate alınır. 10 sn'de `AbortController` ile iptal.

### `order_request` — Sipariş Ver

```json
{
  "event": "order_request",
  "sentAt": "2026-07-27T15:22:08.940Z",
  "product": { "id": "prd-001", "slug": "toprak-seramik-kupa",
               "name": "Toprak Seramik Kupa", "price": 480, "currency": "TRY" },
  "order":   { "name": "Ayşe Demir", "phone": "+905321112233" },
  "meta":    { "source": "web", "locale": "tr-TR", "userAgent": "…" }
}
```

| Alan | Zorunlu | Kural |
|---|---|---|
| `product` | ✅ | Ürünün tamamı değil, sadece bu beş alan |
| `product.price` | ✅ | Sipariş anındaki fiyat |
| `order.name` | ✅ | 2–80 karakter, trim'lenmiş |
| `order.phone` | ✅ | E.164'e çevrilmiş. Kullanıcı 10 hane girer, istemci normalleştirir |

### `stock_alert` — Stok Bildirimi İste

Yalnızca `out_of_stock` ürünlerde. `order` yerine **`alert`** bloğu taşır.

```json
{
  "event": "stock_alert",
  "sentAt": "2026-07-27T15:54:37.167Z",
  "product": { "id": "prd-004", "slug": "sirsiz-seramik-saksi",
               "name": "Sırsız Seramik Saksı", "price": 620, "currency": "TRY" },
  "alert":   { "name": "Ayşe Demir", "email": "ayse@ornek.com" },
  "meta":    { "source": "web", "locale": "tr-TR", "userAgent": "…" }
}
```

| Alan | Zorunlu | Kural |
|---|---|---|
| `alert.name` | ✅ | 2–80 karakter, trim'lenmiş |
| `alert.email` | ✅ | Geçerli e-posta; trim'lenir ve küçük harfe çevrilir |

### Cevap ve hata davranışı

| Durum | Bileşen davranışı |
|---|---|
| 2xx | Onay ekranı, 3 sn sonra modal kapanır; zamanlayıcı unmount'ta temizlenir |
| 4xx / 5xx / ağ hatası | Formu koru, Türkçe hata mesajı göster, tekrar denemeye izin ver |
| 10 sn timeout | `AbortController` ile iptal → hata durumu |

Hata kodları → Türkçe metin eşlemesi `lib/useWebhookForm.js` içindeki `DEFAULT_ERROR_MESSAGES`; akışa özel metinler `messages` ile override edilir.

### Uygulanmamış olaylar

`card_saved` ve `meeting_request` bu dokümanın eski sürümünde tanımlıydı ama **kodda karşılıkları yok**. Kartvizit webhook çağrısı yapmaz; vCard indirmesi tamamen istemci tarafındadır. Bu olaylar gerekirse önce burada tasarlanmalı, sonra yazılmalıdır.

## Erişilebilirlik

Katalog ve kartvizit WCAG AA hedefler; değişiklik yaparken bozmayın.

- Gövde metni ≥ 4.5:1, büyük metin ≥ 3:1. Mevcut değerler 5.2–12.9 aralığında.
- `--azure` (#3f83ab) **beyaz metin taşımaz** — 4.16:1'de kalır. Buton degradelerinin açık ucu `#3a789d` (4.8:1).
- `--azure` küçük metin rengi olarak da kullanılmaz; onun yerine `--azure-dark`.
- Tüm etkileşimli öğelerde `:focus-visible`; `prefers-reduced-motion` blokları mevcut.

## Sık Yapılan Hatalar

- **`src/data/products.js`'i bileşen içinden import etmek** → veri prop'la geçer.
- **Tüm ürün nesnesini webhook'a göndermek** → sözleşme beş alanla sınırlı.
- **Zarfa yeni üst seviye anahtar eklemek** (`formType` gibi) → ayrım `event` ile yapılır.
- **`price`'ı `"480 TL"` gibi string yazmak** → sıralama/filtreleme kırılır.
- **Stoku `inStock: true/false` yapmak** → `low_stock` ve stok bildirimi akışı kaybolur.
- **Tükenen ürünün butonunu baştan `disabled` bırakmak** → talep toplama fırsatı kaçar. Yalnızca **gönderim sonrası** pasifleşir.
- **`AtolyeCard.html`'i parçalara bölmek veya `index.css`'e bağlamak** → tek başına taşınabilirliği gider.
- **Katalog paletini değiştirip kartviziti unutmak** → iki dosya elle senkron tutulur.
- **Webhook URL'ini koda gömmek** → `.env.local` içinde `VITE_WEBHOOK_URL`, `.env.example`'a placeholder.
- **Tam çözünürlüklü fotoğrafı `public/` altına koymak** → 8 MB'lık PNG'ler build'e girer; 900px JPEG üretin.
