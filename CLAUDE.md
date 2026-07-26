# CLAUDE.md — AtölyeKart

> **Not:** Bu dosya bir **iskelet**tir. Proje henüz kurulmadı (dizin boş). Next.js iskeleti oluşturulup kod eklendikçe bu doküman güncellenmelidir.

## Proje Özeti

**AtölyeKart**, El yapımı seramik, mum ya da takı gibi ürünler satan küçük bir atölyeniz var. Ziyaretçiler ürün kataloğunuza bakıyor, sipariş
veriyor ve tükenen bir ürün geri geldiğinde haberdar olmak istiyor. **rezervasyon platformudur**.

### Kullanıcı Rolleri
- **Ziyaretçi** — atölyeleri görüntüler, arar (giriş yapmadan).
- **Kayıtlı Kullanıcı / Öğrenci** — rezervasyon yapar, ödeme yapar, geçmiş kayıtlarını görür.
- **Eğitmen / Atölye Yöneticisi** — atölye/kurs oluşturur, kontenjan ve takvim yönetir.
- **Admin** — kullanıcıları, içerikleri ve ödemeleri yönetir.

### Çekirdek Akış
Atölye listeleme → atölye detayı → rezervasyon / yer ayırtma → ödeme → onay & bildirim.

## Teknoloji Yığını

- **Framework:** Next.js (App Router) + React
- **Dil:** TypeScript (strict mod)
- **Çalışma zamanı:** Node.js

### Planlanan / Netleşecek Seçimler
- **Stil:** Tailwind CSS _(planlanan)_
- **Veritabanı & ORM:** PostgreSQL + Prisma _(planlanan)_
- **Kimlik doğrulama:** NextAuth / Auth.js _(planlanan)_
- **Ödeme:** Stripe veya Iyzico (TR için) _(netleşecek)_

## Planlanan Klasör Yapısı

> Aşağıdaki yapı **hedeflenen** düzendir; henüz oluşturulmadı.

```
AtölyeKart/
├── app/              # Next.js App Router route'ları ve sayfalar
│   ├── (public)/     # Ziyaretçi sayfaları (atölye listesi, detay)
│   ├── (auth)/       # Giriş / kayıt
│   ├── dashboard/    # Kullanıcı & eğitmen panelleri
│   └── api/          # Route handler'lar (backend uçları)
├── components/       # Yeniden kullanılabilir React bileşenleri
├── lib/              # Yardımcılar, veritabanı istemcisi, iş mantığı
├── prisma/           # Şema ve migration'lar
├── public/           # Statik dosyalar (görseller, ikonlar)
├── tests/            # Testler
├── .env.local        # Ortam değişkenleri (commit edilmez!)
└── CLAUDE.md
```

## Geliştirme Komutları

> Proje kurulduktan sonra kullanılacak standart komutlar.

```bash
# İlk kurulum (henüz yapılmadı)
npx create-next-app@latest .

# Geliştirme sunucusu
npm run dev

# Üretim derlemesi
npm run build
npm run start

# Kod kalitesi
npm run lint

# Testler
npm test
```

## Kod Kuralları / Konvansiyonlar

- **TypeScript strict** modu açık; `any` kullanımından kaçının.
- **Bileşen isimlendirme:** PascalCase (`WorkshopCard.tsx`), yardımcılar camelCase.
- **Server / Client ayrımı:** varsayılan Server Component; etkileşim gereken yerde `"use client"`.
- **Dosya organizasyonu:** ilgili bileşen, stil ve test dosyalarını yakın tutun.
- **Ortam değişkenleri:** gizli anahtarlar `.env.local` içinde; **asla commit edilmez**. Örnek değerler için `.env.example` tutulur.
- **Formatlama:** ESLint + Prettier kurallarına uyun (`npm run lint`).

## Dil ve İletişim

- **Claude ile iletişim** ve kullanıcıya görünen tüm metinler (UI, hata mesajları): **Türkçe**.
- **Kod** (değişken, fonksiyon, dosya isimleri) ve teknik yorumlar: **İngilizce**.

## Yapılacaklar / Notlar

- [ ] `create-next-app` ile gerçek iskeleti oluştur.
- [ ] Veritabanı, kimlik doğrulama ve ödeme sağlayıcılarını kesinleştir.
- [ ] Bu CLAUDE.md dosyasını gerçek klasör yapısı ve komutlara göre güncelle.
- [ ] Test stratejisini (birim / entegrasyon / e2e) belirle.
