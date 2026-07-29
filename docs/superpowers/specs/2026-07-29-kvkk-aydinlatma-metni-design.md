# KVKK Aydınlatma Metni Sayfası ve Form Onayı

**Tarih:** 2026-07-29
**Durum:** Onaylandı

## Amaç

AtölyeKart'ta iki form kişisel veri topluyor: "Sipariş Ver" (ad-soyad + telefon) ve "Stok Bildirimi İste" (ad-soyad + e-posta). Şu an sitede bu veri toplamaya dair hiçbir aydınlatma metni, gizlilik politikası sayfası veya kullanıcı onayı yok. Bu spec, KVKK madde 10 uyarınca bir aydınlatma metni yazıp siteye entegre etmeyi ve formlara açık rıza onay kutusu eklemeyi kapsıyor.

**Not:** Bu metin standart KVKK aydınlatma metni yapısına dayanan bir taslaktır, hukuki danışmanlık yerine geçmez. Yayınlanmadan önce bir hukukçu tarafından gözden geçirilmesi önerilir.

## Kapsam Netleştirmesi (kullanıcı onayı)

- Veri sorumlusu kimliği: kartvizitteki gerçek bilgiler kullanılacak (Mehmet Ergün / AtölyeKart, gerçek kişi/şahıs işletmesi, mehmet@atolyekart.com, +90 535 765 06 68, Kadıköy/İstanbul).
- Sayfa yeri: `AtolyeCard.html` gibi kendi başına duran yeni bir statik sayfa (`gizlilik-politikasi.html`), `vite.config.js`'e üçüncü Rollup giriş noktası olarak eklenecek.
- Form onayı: Hem "Sipariş Ver" hem "Stok Bildirimi İste" formuna, gönderimden önce zorunlu bir onay kutusu eklenecek.

## Mimari

Üç değişiklik grubu:

1. **Yeni statik sayfa — `gizlilik-politikasi.html`**
   `AtolyeCard.html` deseniyle aynı: bağımsız dosya, inline `<style>`, harici bağımlılık yok, `file://` ile de açılabilir. `vite.config.js`'teki `rollupOptions.input`'a üçüncü giriş noktası (`policy: entry("./gizlilik-politikasi.html")`) olarak eklenir ki `npm run build` onu `dist/`e kopyalasın.

2. **Footer linki — `src/App.jsx` + `src/index.css`**
   `App.jsx`'in şu an hiç footer'ı yok. `<main>`'den sonra `<footer className="page__foot">` eklenir, içinde `/gizlilik-politikasi.html`'e giden bir link olur. Mevcut `page__card-link`'in kullandığı mutlak yol (`/AtolyeCard.html`) konvansiyonu izlenir — bu sayfa (App.jsx) her zaman bir sunucudan servis edilir, `AtolyeCard.html`'in aksine `file://` ile açılma riski yok, o yüzden göreli yola gerek yok. Stiller `index.css`'in sonuna, mevcut token'lar (`--muted`, `--line`, `--space-*`) kullanılarak eklenir.

3. **Onay kutusu — `OrderModal.jsx`, `OrderModal.css`, `StockAlertModal.jsx`, `FormModal.css`**
   Her iki formun `validate()` fonksiyonuna `consent` alanı eklenir: `values.consent` `false`/boş ise `errors.consent = "Devam etmek için aydınlatma metnini okuyup onaylamalısınız."` döner, gönderim engellenir (mevcut validate → errors → early-return deseni zaten iki formda da var, aynı desen kullanılacak). Checkbox'ın label metni `/gizlilik-politikasi.html`'e `target="_blank" rel="noopener"` ile link verir. `OrderModal` kendi `values`/`errors` state'ini lokal tutuyor (hook kullanmıyor) — checkbox oraya aynı şekilde eklenir. `StockAlertModal` `useWebhookForm` hook'unu kullanıyor; hook zaten jenerik `values`/`errors`/`handleChange` döndürdüğü için checkbox'ın `handleChange("consent")` çağrısı checkbox'ın `checked` değerini değil `event.target.value`'yu okur — bu yüzden checkbox için `handleChange` doğrudan kullanılamaz, `onChange` içinde `event.target.checked` okuyup state'i manuel güncelleyen küçük bir yerel fonksiyon yazılacak (hook'un imzası değişmeyecek, sadece çağıran taraf checkbox'a özel bir adapter kullanacak).

   Checkbox işaretlenmeden submit butonu disabled OLMAYACAK (mevcut formlardaki `sending` disabled deseniyle karışmasın diye) — bunun yerine mevcut validate/errors akışı üzerinden, submit denendiğinde hata gösterilecek. Bu, iki formdaki "önce dene, sonra alan bazlı hata göster" deseniyle tutarlı.

## Aydınlatma Metni İçeriği (nihai metin)

`gizlilik-politikasi.html` içine, başlıklandırılmış düzyazı olarak aşağıdaki metin konur (madde başlıkları `<h2>`, içerik `<p>`/`<ul>`):

---

**AtölyeKart — Kişisel Verilerin Korunması Hakkında Aydınlatma Metni**

*Son güncelleme: 29 Temmuz 2026*

**1. Veri Sorumlusunun Kimliği**

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, aşağıda belirtilen kişisel verileriniz veri sorumlusu sıfatıyla Mehmet Ergün (AtölyeKart) tarafından bu aydınlatma metninde açıklanan kapsamda işlenmektedir.

- Veri Sorumlusu: Mehmet Ergün (AtölyeKart) — gerçek kişi / şahıs işletmesi
- Adres: Kadıköy, İstanbul
- E-posta: mehmet@atolyekart.com
- Telefon: +90 535 765 06 68

**2. İşlenen Kişisel Veri Kategorileri**

AtölyeKart web sitesindeki "Sipariş Ver" ve "Stok Bildirimi İste" formlarını doldurduğunuzda aşağıdaki kişisel verileriniz işlenir:

- Kimlik: Ad, soyad
- İletişim: Telefon numarası (sipariş formu) ve/veya e-posta adresi (stok bildirimi formu)
- İşlem Güvenliği: Talebin gönderildiği tarih ve saat, kullandığınız tarayıcı/cihaz bilgisi (user agent), varsa siteye yönlendiren sayfa adresi (referrer)

Sitedeki dijital kartvizit sayfası (AtölyeKart Dijital Kartvizit) sizden herhangi bir kişisel veri toplamaz; tam tersine, kartvizit sahibinin iletişim bilgilerini "Rehbere Kaydet" butonuyla sizin cihazınıza (vCard olarak) aktarır. Bu işlem tamamen tarayıcınızda gerçekleşir, AtölyeKart'a herhangi bir veri gönderilmez.

**3. Kişisel Verilerin İşlenme Amaçları**

Kişisel verileriniz;

- İlettiğiniz sipariş taleplerinin alınması, değerlendirilmesi ve sizinle iletişime geçilerek sonuçlandırılması,
- Stok bildirimi taleplerinin kaydedilmesi ve ürün stoğa girdiğinde sizinle iletişime geçilmesi,
- Talebinizle ilgili sizinle iletişim kurulması

amaçlarıyla işlenmektedir.

**4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi**

Kişisel verileriniz, web sitesindeki ilgili formu doldurup göndermeniz yoluyla, doğrudan sizden, elektronik ortamda toplanmaktadır.

Verileriniz;

- Form gönderimi öncesinde işaretlediğiniz onay kutusuyla verdiğiniz açık rızanıza (KVKK m.5/1) dayanılarak,
- Sipariş talepleri bakımından ayrıca bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (KVKK m.5/2-c) hukuki sebebine dayanılarak

işlenmektedir.

**5. Kişisel Verilerin Aktarılması**

Kişisel verileriniz;

- Sipariş ve stok bildirimi taleplerinizin yürütülmesi amacıyla kullandığımız otomasyon/entegrasyon hizmet sağlayıcısına (veri işleyen sıfatıyla),
- Web sitesinin barındırılmasını sağlayan Vercel Inc.'e (barındırma hizmeti kapsamında, teknik erişim kayıtları bağlamında),
- Yasal bir yükümlülüğün yerine getirilmesi gerektiği hallerde yetkili kamu kurum ve kuruluşlarına

KVKK'nın 8. ve 9. maddelerinde öngörülen şartlara uygun olarak aktarılabilir.

*Not: Sipariş ve stok bildirimi taleplerinin işlenmesinde kullanılan otomasyon/entegrasyon hizmet sağlayıcısı şu an netleşmemiştir; sağlayıcı belirlendiğinde bu metin güncellenecektir.*

**6. Yurt Dışına Aktarım**

Yukarıda belirtilen hizmet sağlayıcılarının (barındırma ve otomasyon/entegrasyon hizmeti) sunucuları yurt dışında bulunabilir. Bu durumda kişisel verileriniz, KVKK'nın 9. maddesinde öngörülen şartlara (yeterli korumanın bulunduğu ülkeler, Kurul tarafından onaylanan taahhütnameler veya diğer uygun güvenceler) uygun şekilde yurt dışına aktarılabilir.

**7. Kişisel Verilerin Saklama Süresi**

Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca, ilgili mevzuatta öngörülen zamanaşımı ve saklama süreleri saklı kalmak kaydıyla, talebinizin sonuçlanmasından itibaren en fazla 2 (iki) yıl süreyle saklanır. Bu sürenin sonunda verileriniz silinir, yok edilir veya anonim hale getirilir.

**8. Çerezler ve Benzeri Teknolojiler**

AtölyeKart web sitesi şu an itibarıyla çerez (cookie), analitik izleme veya reklam amaçlı herhangi bir üçüncü taraf takip teknolojisi kullanmamaktadır. Bu durumda bir değişiklik olması hâlinde bu metin güncellenecektir.

**9. KVKK Madde 11 Kapsamındaki Haklarınız**

KVKK'nın 11. maddesi uyarınca veri sorumlusuna başvurarak;

- Kişisel verilerinizin işlenip işlenmediğini öğrenme,
- İşlenmişse buna ilişkin bilgi talep etme,
- İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,
- Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme,
- Eksik veya yanlış işlenmişse düzeltilmesini isteme,
- KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,
- Düzeltme, silme ve yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,
- İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,
- Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme

haklarına sahipsiniz.

**10. Başvuru Yöntemi**

Yukarıdaki haklarınızı kullanmak için taleplerinizi mehmet@atolyekart.com adresine e-posta yoluyla iletebilirsiniz. Başvurunuz, KVKK'da öngörülen süre içinde (en geç 30 gün içinde) yanıtlanır.

**11. Değişiklikler**

Bu aydınlatma metni, yasal düzenlemelerdeki değişiklikler veya veri işleme faaliyetlerimizdeki güncellemeler doğrultusunda revize edilebilir. Güncel metin her zaman bu sayfada yayımlanır.

---

## Form Onayı — Metin ve Davranış

Her iki formda, submit butonundan hemen önce:

```
☐ Aydınlatma Metni'ni okudum, kişisel verilerimin bu kapsamda işlenmesini kabul ediyorum.
```

"Aydınlatma Metni" ifadesi `/gizlilik-politikasi.html`'e `target="_blank" rel="noopener"` ile linktir.

Doğrulama hatası (checkbox işaretlenmeden gönderilirse): `"Devam etmek için aydınlatma metnini okuyup onaylamalısınız."`

## Kapsam Dışı

- Otomasyon/entegrasyon hizmet sağlayıcısının gerçek kimliğinin belirlenmesi (webhook URL'i hâlâ placeholder — belirlenince aydınlatma metni Bölüm 5 elle güncellenmeli).
- Ayrı bir "açık rıza metni" sayfası — checkbox'ın kendisi ve linklediği aydınlatma metni açık rıza beyanı olarak yeterli kabul edildi.
- Veri saklama/silme sürecinin teknik olarak uygulanması (şu an backend/veritabanı yok, veriler yalnızca webhook alıcısında saklanıyor — bu metnin saklama süresi taahhüdü, alıcı tarafın süreçleriyle desteklenmeli, bu spec'in kapsamında değil).
- KVKK'ya kayıt (VERBİS) gerekliliğinin değerlendirilmesi — şahıs işletmesi ölçeğine göre muafiyet olabilir, hukuki değerlendirme kullanıcıya bırakılmıştır.
