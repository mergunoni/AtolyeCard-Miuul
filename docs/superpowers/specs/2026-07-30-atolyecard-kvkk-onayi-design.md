# AtolyeCard KVKK Aydınlatma Metni ve Onay Kutusu

**Tarih:** 2026-07-30
**Durum:** Onaylandı

## Amaç

`AtolyeCard.html` (dijital kartvizit) şu an KVKK'ya dair hiçbir metin veya onay içermiyor. Katalogdaki iki forma (Sipariş Ver, Stok Bildirimi İste) onay kutusu 2026-07-29 tarihli spec ile eklendi, kartvizit kapsam dışında kaldı. Bu spec, kartvizite gömülü bir aydınlatma metni ve "Rehbere Kaydet" aksiyonunu kapılayan bir onay kutusu ekliyor.

**Not:** Buradaki metin standart KVKK aydınlatma metni yapısına dayanan bir taslaktır, hukuki danışmanlık yerine geçmez.

## Çıkış Noktası: kartvizit katalogdan farklı

Kartta form yok, webhook çağrısı yok. Tek aksiyonu vCard indirmesi ve bu tamamen tarayıcıda çalışıyor. Mevcut `gizlilik-politikasi.html` §2 bunu açıkça yazıyor: *"dijital kartvizit sayfası sizden herhangi bir kişisel veri toplamaz; tam tersine, kartvizit sahibinin iletişim bilgilerini … sizin cihazınıza aktarır."*

Bu cümle **doğru ve değişmiyor.** Dolayısıyla karta eklenen onay kutusu ziyaretçinin verisinin işlenmesine değil, **kart sahibinin iletişim bilgilerinin ziyaretçinin cihazına kaydedilmesine** dair bir onaydır. Metin ve kutu etiketi bu çerçeveyi yansıtacak şekilde yazılır; katalogdaki form onayının metni buraya kopyalanmaz.

## Kapsam Netleştirmesi (kullanıcı onayı)

- Onay kutusu vCard indirmesini kapılar; karta yeni form veya webhook eklenmez.
- Aydınlatma metni **kartın içine gömülür** — kapalı bir `<details>` bloğunda, vCard'a özgü kısaltılmış biçimde. Tam metne link de bulunur.
- Kutu işaretlenmeden buton `disabled` olmaz; basıldığında Türkçe hata gösterilir.

## Mimari

İki dosya değişiyor. `AtolyeCard.html` **tek parça kalır**: harici bağımlılık eklenmez, `src/lib/consent.js` import edilmez, tüm eklemeler dosyanın kendi `<style>`, gövde ve `<script>` bloklarına girer. Gerekçe kartın kendi başında taşınabilir olması; bedeli metnin elle senkron tutulması (palet için de aynı bedel geçerli, dosyanın başındaki not bunu söylüyor).

### 1. `AtolyeCard.html` — onay kutusu

`#saveVcard` butonunun **üstüne** eklenir, `.socials` bloğundan sonra:

```
.consent            label — checkbox + etiket metni
.consent__error     hata mesajı, role="alert", varsayılan olarak gizli
.notice             <details> — "Aydınlatma Metnini Oku"
```

Etiket metni:

> Aydınlatma metnini okudum; iletişim bilgilerinin cihazıma kaydedilmesini kabul ediyorum.

Davranış tablosu:

| Durum | Sonuç |
|---|---|
| Kutu işaretsiz, butona basılır | vCard indirilmez. `.consent__error` görünür: *"Devam etmek için aydınlatma metnini okuyup onaylamalısınız."* Odak kutuya taşınır. |
| Kutu işaretlenir | Hata mesajı temizlenir, `aria-invalid` kaldırılır. |
| Kutu işaretli, butona basılır | Mevcut vCard kodu değişmeden çalışır. |
| Sayfa yenilenir | Onay sıfırlanır. |

`localStorage` **kullanılmaz.** Onayı saklamak başlı başına bir veri işleme sorusu açar ve kartın "hiçbir şey kaydedilmiyor" iddiasını bozar. Bu, katalogdaki "Bildirim kaydedildi" durumunun da yenilemede sıfırlanmasıyla tutarlı.

Buton hiçbir zaman `disabled` olmaz — katalogdaki gönder butonu deseniyle aynı gerekçe: baştan pasif buton kullanıcıya sebebini söylemez.

Hata metni `src/lib/consent.js` içindeki `CONSENT_ERROR` ile **birebir aynı** olacak ama import edilemeyeceği için elle kopyalanır; yanına o dosyaya işaret eden bir yorum yazılır.

### 2. `AtolyeCard.html` — gömülü aydınlatma metni

`<details>` içinde, `<summary>` başlığı "Aydınlatma Metnini Oku". İçerik `<dl>` değil, `<h3>` + `<p>` çiftleriyle yazılır (kart dar, tanım listesi hizalaması sıkışır). Altı madde:

1. **Veri sorumlusu** — Mehmet Ergün (AtölyeKart), Kadıköy/İstanbul, `mehmet@atolyekart.com`, `+90 535 765 06 68`.
2. **İşlenen veri** — Bu kartvizit sizden veri toplamaz. "Rehbere Kaydet", kart *sahibinin* ad, unvan, telefon, e-posta ve adres bilgilerini vCard dosyası olarak sizin cihazınıza indirir.
3. **Nerede işlenir** — Tamamen tarayıcınızda. AtölyeKart'a hiçbir veri gönderilmez, sunucuda kayıt tutulmaz, çerez kullanılmaz.
4. **Amaç ve hukuki sebep** — İletişim kurulabilmesi; işaretlediğiniz onay kutusuyla verdiğiniz açık rıza (KVKK m.5/1).
5. **Sizden beklenen** — Kaydettiğiniz bilgileri yalnızca iletişim amacıyla kullanmanız, üçüncü kişilerle paylaşmamanız.
6. **Haklarınız** — KVKK m.11 kapsamındaki haklar; başvuru `mehmet@atolyekart.com`, en geç 30 gün içinde yanıt.

Sonda tam metne link: `./gizlilik-politikasi.html`. **Göreli yol, kök-mutlak `/` değil** — kart `file://` ile veya kök olmayan bir dağıtım yolunda açılabilir; mevcut `./index.html` linkleri aynı gerekçeyle göreli.

### 3. `gizlilik-politikasi.html` — §2 eklemesi

§2'nin son paragrafı korunur, sonuna tek cümle eklenir: vCard indirmesi öncesinde kartta bir onay kutusu bulunduğu, bu onayın yalnızca tarayıcıda tutulduğu ve hiçbir yere kaydedilmediği. `.doc__updated` tarihi **30 Temmuz 2026** olur.

`vite.config.js` değişmez — her iki dosya zaten giriş noktası olarak tanımlı.

## Erişilebilirlik

Kart WCAG AA hedefliyor; eklenenler bunu korur.

- Checkbox `<label>` içinde sarılı, ayrı `for` gerekmez. Hata varken `aria-invalid="true"` ve `aria-describedby="consent-error"` ile hata metnine bağlanır; hata yokken iki nitelik de kaldırılır.
- `.consent__error` `role="alert"` taşır ve gizliyken `hidden` niteliğiyle DOM'dan okunmaz olur (`display:none` yerine `hidden`, ekran okuyucular için daha güvenilir).
- `<details>`/`<summary>` yerel olarak klavyeyle çalışır; `summary`'ye kartın diğer öğeleriyle aynı `:focus-visible` outline'ı (`2px solid var(--azure-dark)`) eklenir. `summary { cursor: pointer }` ve `list-style` düzeltmesi yapılır.
- Renkler kartın mevcut token'larından: kutu `accent-color: var(--azure-deep)`, gövde metni `var(--muted)` (6.1:1), başlıklar `var(--ink)` (12.9:1).
- Yeni token `--danger: #b3261e` — `--card-bg` (#fbfcfd) üzerinde **6.36:1**, AA gövde metni eşiğini (4.5:1) geçer.
- `prefers-reduced-motion` bloğu değişmez; `<details>` animasyon içermez.

## Doğrulama

Repoda otomatik test altyapısı yok, elle doğrulanır:

1. `npm run build` hatasız geçer; `dist/AtolyeCard.html` onay kutusunu, gömülü metni ve `--danger` token'ını içerir.
2. Kutu işaretsiz "Rehbere Kaydet" → indirme **olmaz**, hata görünür, odak kutuda.
3. Kutuyu işaretle → hata kaybolur; butona bas → `MehmetErgun.vcf` iner.
4. `<details>` açılıp kapanır, içindeki tam metin linki `gizlilik-politikasi.html`'i açar.
5. Yalnızca klavyeyle tüm akış yürür (Tab ile kutuya, Space ile işaretle, Tab ile butona, Enter ile indir); tüm odak halkaları görünür.
6. Dosya `file://` ile tek başına açıldığında gömülü metin yine görünür (tam metin linki bu senaryoda karşılık bulmayabilir — kabul edilen sınır, metnin kendisi kartta olduğu için bilgi kaybı yok).
7. `gizlilik-politikasi.html` §2 yeni cümleyi ve güncel tarihi gösterir.

## Kapsam Dışı

- Kartta yeni form veya webhook olayı (`card_saved` dahil) — kartın webhook çağırmama kuralı korunur.
- Katalog formlarının onay metinleri — 2026-07-29 spec'i ile tamamlandı.
- Çerez banner'ı — site çerez kullanmıyor.
- `src/lib/consent.js`'in karta paylaşılabilir hale getirilmesi — tek parça kuralını bozar.
