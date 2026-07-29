# AtölyeKart'ı Vercel'de Yayına Alma

**Tarih:** 2026-07-29
**Durum:** Onaylandı

## Amaç

Mevcut statik siteyi (Vite+React ürün kataloğu + bağımsız `AtolyeCard.html` dijital kartvizit) Vercel üzerinde yayına almak. Bu, kodun veya mimarinin bir "web uygulamasına" dönüştürülmesi değil — proje zaten tarayıcıda çalışan bir React SPA'dır. Kapsam netleştirme sorusunda kullanıcı "sadece mevcut statik siteyi olduğu gibi Vercel'de yayına al" seçeneğini onayladı; CLAUDE.md'deki Next.js/rezervasyon-platformu vizyonu bu işin kapsamı dışında.

## Mevcut Durum

- **Framework:** Vite 8 + React 19, `npm run build` → `dist/`.
- **Giriş noktaları:** `vite.config.js` içinde `rollupOptions.input` iki HTML dosyasını tanımlıyor: `index.html` (katalog, `src/main.jsx` yükler) ve `AtolyeCard.html` (kendi kendine yeten, bağımsız statik dosya).
- **Backend yok.** Sipariş (`order_request`) ve stok bildirimi (`stock_alert`) formları `VITE_WEBHOOK_URL` ortam değişkenindeki dış uca (n8n/Make/Zapier tipi) POST atıyor. Bu değişken `.env.local`'de tutulur, git'e commit edilmez; repoda sadece `.env.example` (placeholder) var. Şu an yerelde de gerçek bir `.env.local` yok.
- **Git:** `origin` → `github.com/mergunoni/AtolyeCard-Miuul`. `main` branch'i yalnızca ilk commit'te ("React'e geçiş"), gerçek iş `Versiyon2` branch'inde (main'den 8 commit ileride: katalog, kartvizit, build entegrasyonu).
- **Vercel:** CLI kurulu (`vercel@58.1.0`), proje henüz Vercel'e bağlı değil (`.vercel/` yok).

## Kapsam

Değişecek olan: sitenin barındığı yer (yerel/build-only → Vercel'de canlı URL).
Değişmeyecek olan: kod, mimari, `vite.config.js`, bileşen yapısı, webhook sözleşmesi.

## Karar Noktaları

1. **Production branch:** `Versiyon2`. `main` neredeyse boş; onu production yapmak gerçek içeriği yayından kaldırmak anlamına gelir. `main` ileride güncellenirse production branch'i değiştirmek ayrı bir karar.
2. **Framework algılama / `vercel.json`:** Gerekmiyor. Vercel Vite framework'ünü otomatik tanır (`npm run build`, output `dist`); iki HTML girişi zaten `vite.config.js` üzerinden `dist/`e derleniyor, ek rewrite/route tanımına gerek yok.
3. **`VITE_WEBHOOK_URL`:** Kullanıcı gerçek webhook adresini şu an vermek istemedi. Vercel'e placeholder değerle (Production + Preview scope) eklenecek. Sonuç: canlıda sipariş/stok bildirimi formları gönderim anında hata verecek (form açık kalır, Türkçe hata mesajı gösterilir — mevcut hata davranışı zaten böyle tasarlanmış). Bu bilinen ve kabul edilen bir açık; gerçek URL eklendiğinde `vercel env` ile güncellenip yeniden deploy edilmesi yeterli.
4. **Dağıtım yöntemi:** GitHub reposu Vercel projesine bağlanacak, otomatik deploy açık olacak — `Versiyon2`'ye her push yeni bir production deploy tetikleyecek.

## Uygulama Adımları

1. `vercel link` (veya `vercel` ilk çalıştırma akışı) ile proje GitHub reposuna bağlanır; production branch `Versiyon2` olarak ayarlanır.
2. `VITE_WEBHOOK_URL` ortam değişkeni Vercel proje ayarlarına placeholder değerle eklenir (Production + Preview).
3. İlk deploy tetiklenir.
4. Doğrulama: canlı URL'de `/` (katalog listesi, ürün modalları açılıyor mu — webhook çağrısının hata vermesi *beklenen* davranış), `/AtolyeCard.html` (kart görünümü, "Rehbere Kaydet" vCard indirmesi, kataloğa dönüş linki) kontrol edilir.
5. Sonrasında her `Versiyon2` push'u otomatik yeni deploy üretir; ekstra adım gerekmez.

## Test / Doğrulama

- Build'in Vercel'de hatasız tamamlanması (`npm run build` çıktısı iki HTML dosyasını da üretiyor mu).
- Canlı ortamda katalog ve kartvizit sayfalarının açılması, aralarındaki göreli linklerin (`./index.html`, `./AtolyeCard.html`) çalışması.
- Sipariş/stok bildirimi formlarının *beklenen* şekilde hata mesajı göstermesi (gerçek webhook URL'i yokken).
- Kartvizitteki vCard indirmesinin tarayıcıda çalışması (istemci taraflı, backend'e bağlı değil).

## Kapsam Dışı

- CLAUDE.md'deki Next.js/rezervasyon platformu vizyonu (auth, ödeme, veritabanı, App Router geçişi).
- Gerçek webhook entegrasyonu / gerçek `VITE_WEBHOOK_URL` değeri.
- Özel domain bağlama (`atolyekart.com` henüz yok — `AtolyeCard.html` içindeki not bunu zaten belirtiyor).
- `main` branch'inin güncellenmesi veya production branch'inin değiştirilmesi.
