# CLAUDE.md — AtölyeKart

> Bu dosya güncel proje durumunu yansıtır. Erken vizyon dokümanı **rezervasyon platformu**
> tanımlıyordu (roller, takvim, ödeme); proje o yönde ilerlemedi. Gerçekte inşa edilen ve
> canlıda olan şey daha dar: **statik ürün kataloğu + dijital kartvizit**, backend'siz,
> tek atölye sahibi için. Aşağıdaki içerik kod tabanının bugünkü hâlidir.

## Proje Özeti

**AtölyeKart**, el yapımı seramik/mum/takı satan tek bir atölyenin **ürün kataloğu ve
dijital kartviziti**dir. İki ayrı, birbirine linkli teslimattan oluşur:

| | Ürün kataloğu | Dijital kartvizit |
|---|---|---|
| Giriş noktası | `index.html` → React uygulaması | `AtolyeCard.html` (tek dosya, bağımsız) |
| Amaç | Ürünleri listele, sipariş/stok bildirimi talebi topla | Rehbere kaydedilebilir kartvizit (vCard) |
| Dış aksiyon | Webhook POST (n8n/Make/Zapier tarzı uç) | Yalnızca istemci taraflı vCard indirme |

Kayıt/giriş, ödeme, takvim/rezervasyon, veritabanı veya rol sistemi **yok**. Sipariş ve
stok bildirimi talepleri bir webhook'a POST edilir; gerçek sipariş işleme ve ödeme
kod tabanının dışında (muhtemelen webhook'un bağlandığı otomasyon tarafında) gerçekleşir.

KVKK uyumu somut bir gereksinim olarak ele alınmış: ayrı bir aydınlatma metni sayfası
(`gizlilik-politikasi.html`) var ve sipariş formu, stok bildirimi formu ile vCard
indirmesi bir onay kutusu ile bu metne kapılanmış durumda.

Derin, dosya-dosya sözleşmeler (webhook payload şeması, ürün veri şeması, kartvizit
kısıtları, erişilebilirlik hedefleri) için **`.claude/skills/atolyecard/SKILL.md`**
kaynak doküman — bu dosyada tekrarlanmıyor, sadece özetleniyor.

## Teknoloji Yığını

- **Framework:** Vite 8 + React 19 (App Router yok, SPA değil — çoklu HTML giriş noktalı statik derleme)
- **Dil:** JavaScript + JSDoc tip anotasyonları (TypeScript **kullanılmıyor**)
- **Stil:** El yazımı CSS (`src/index.css` katalog için, `AtolyeCard.html` içinde ayrı `<style>` bloğu — Tailwind yok)
- **Ek bağımlılık:** `qrcode.react` (sayfanın kendi adresini QR olarak basmak için)
- **Veri:** Yok — ürünler `src/data/products.js` içinde sabit dizi. Veritabanı, ORM, auth, ödeme sağlayıcısı **yok**
- **Dağıtım:** Vercel (proje bağlı: `atolyekart`)

## Gerçek Klasör Yapısı

```
AtölyeKart/
├── index.html                   # Vite giriş noktası → src/main.jsx (katalog)
├── AtolyeCard.html               # Kartvizit — tek dosya, kendi kendine yeten
├── gizlilik-politikasi.html      # KVKK aydınlatma metni
├── vite.config.js                # 3 giriş noktası (main/card/policy), server.host: true
├── src/
│   ├── App.jsx                   # Sayfa iskeleti, toast state'i, aksiyon handler'ları
│   ├── main.jsx                  # React root
│   ├── index.css                 # Katalogun tüm stilleri, tasarım token'ları
│   ├── components/
│   │   ├── ProductList.jsx       # Kullanılan grid bileşeni
│   │   ├── ProductGrid.jsx       # ÖLÜ KOD — import edilmiyor, dokunma
│   │   ├── ProductCard.jsx       # Tek ürün kartı, modalların sahibi
│   │   ├── ProductImage.jsx      # Görsel + placeholder fallback
│   │   ├── PageQrCode.jsx        # Sayfanın kendi adresinin QR'ı
│   │   ├── FormModal.jsx/.css    # Paylaşılan modal kabuğu (portal, Escape, odak)
│   │   ├── OrderModal.jsx/.css   # Sipariş formu (ad + telefon)
│   │   └── StockAlertModal.jsx   # Stok bildirimi formu (ad + e-posta)
│   ├── lib/
│   │   ├── webhook.js            # postEvent + WebhookError + buildMeta
│   │   ├── useWebhookForm.js     # Form yaşam döngüsü hook'u (idle→sending→success/error)
│   │   ├── consent.js            # KVKK onay metinleri/URL'i
│   │   └── format.js             # formatPrice
│   └── data/products.js          # Katalog verisi (tek kaynak)
├── public/images/products/       # Ürün fotoğrafları, <slug>.jpg, 900px
├── assets-source/                 # Tam çözünürlüklü orijinaller — .gitignore'da
├── docs/superpowers/               # Bu projede kullanılan plan/spec dokümanları
├── .claude/skills/atolyecard/SKILL.md  # Derin sözleşmeler — burada tekrarlanmıyor
├── .env.local                     # VITE_WEBHOOK_URL vb. — commit edilmez
└── CLAUDE.md
```

## Geliştirme Komutları

```bash
# Kurulum
npm install

# Geliştirme sunucusu (LAN'a bind edilir — QR kod telefonla test için)
npm run dev

# Üretim derlemesi (3 giriş noktasını dist/ altına basar)
npm run build

# Derlenmiş çıktıyı yerelde önizle
npm run preview

# Vercel'e dağıt
vercel deploy         # preview
vercel deploy --prod  # production
```

> Lint/test script'i **yok**. `package.json` içinde yalnızca `dev`/`build`/`preview` var.

## Kod Kuralları / Konvansiyonlar

- **TypeScript yok** — JSDoc ile tipleme (bkz. `src/data/products.js` başındaki `@typedef`'ler).
- **Bileşen isimlendirme:** PascalCase (`ProductCard.jsx`), yardımcılar camelCase.
- **Bileşenler saf:** veri prop olarak girer, `import { products }` bileşen içinde yapılmaz; fetch/webhook çağrısı bileşenlerde değil `lib/` içinde.
- **Sadece fonksiyon bileşenleri + hook'lar**, class bileşen yok.
- **Metinler:** kullanıcıya görünen her metin Türkçe; kod, değişken/fonksiyon isimleri ve teknik yorumlar İngilizce.
- **Ortam değişkenleri:** `VITE_WEBHOOK_URL` gibi gizli/ortama özgü değerler `.env.local`'de; **asla commit edilmez**. Placeholder `.env.example`'da tutulur.
- **`AtolyeCard.html`'e dokunurken:** tek dosya kuralı bilinçli bir tasarım kararı — parçalara bölmeyin veya `src/index.css`'e bağlamayın (taşınabilirliğini kaybeder). Kartvizit hiçbir webhook çağrısı yapmaz.
- Webhook payload şeması, ürün veri şeması, erişilebilirlik hedefleri ve "sık yapılan hatalar" listesi için **`.claude/skills/atolyecard/SKILL.md`**'yi okuyun — kod değişikliği öncesi kaynak doküman odur.

## Dil ve İletişim

- **Claude ile iletişim** ve kullanıcıya görünen tüm metinler (UI, hata mesajları): **Türkçe**.
- **Kod** (değişken, fonksiyon, dosya isimleri) ve teknik yorumlar: **İngilizce**.

## Bilinen Durum / Açık Noktalar

- `.env.local` içinde `VITE_WEBHOOK_URL` (stok bildirimi ucu) **hâlâ tanımlı değil** — yerelde stok bildirimi formu `missing_url` hatası verir. `VITE_ORDER_WEBHOOK_URL` (sipariş ucu, n8n `siparis-ver` workflow'u) tanımlı. Vercel prod ortamında ikisinin de tanımlı olduğu doğrulanmalı.
- `src/components/ProductGrid.jsx` ölü koddur, silinmeyi bekliyor.
- Kartvizitte alan adı henüz yok; "Web" satırı ve vCard `URL:` alanı bilerek boş bırakılmış (`atolyekart.com` yayına girince eklenecek).
- `AtolyeCard.html`'de iletişim bilgisi (telefon/e-posta) gerçek veri içeriyorsa dosya git'te izlendiği için repo geçmişine kalıcı işlenir — düzenlemeden önce repo görünürlüğünü teyit edin.
