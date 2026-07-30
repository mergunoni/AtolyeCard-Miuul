# AtolyeCard KVKK Onayı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `AtolyeCard.html`'e vCard'a özgü gömülü bir KVKK aydınlatma metni ve "Rehbere Kaydet" indirmesini kapılayan zorunlu bir onay kutusu ekle; `gizlilik-politikasi.html` §2'yi bu yeni onay adımını yansıtacak şekilde güncelle.

**Architecture:** Üç sıralı değişiklik, iki dosya. (1) Karta kapalı bir `<details>` bloğu içinde kısaltılmış aydınlatma metni gömülür — kart tek dosya olarak elden ele verildiği için metin dosyanın içinde durur, yalnızca linkin arkasında değil. (2) Metnin üstüne bir onay kutusu ve mevcut vCard handler'ının başına bir geçiş (guard) eklenir. (3) Aydınlatma metni sayfasının §2'sine, kartta artık bir onay kutusu bulunduğunu ve bu onayın hiçbir yere kaydedilmediğini söyleyen cümleler eklenir.

**Tech Stack:** Düz HTML + inline CSS + vanilla JS. Harici bağımlılık **eklenmez**; React, Vite plugin'i veya `src/` altındaki hiçbir modül bu dosyalara girmez. Projede otomatik test altyapısı yok (`package.json`'da `test` script'i yok) — doğrulama `npm run build` (derleme/kopyalama hatası yakalar) ve `npm run dev` üzerinden elle tarayıcı kontrolüyle yapılır.

## Global Constraints

- Kullanıcıya görünen tüm metinler Türkçe, kod ve yorumlar İngilizce (CLAUDE.md).
- `AtolyeCard.html` **tek parça kalır**: harici script/stylesheet/font yüklenmez, `src/lib/consent.js` veya `src/index.css` import edilmez, webhook çağrısı eklenmez (`.claude/skills/atolyecard/SKILL.md`).
- Onay `localStorage`/`sessionStorage`/çerez ile **saklanmaz**. Yalnızca DOM'da yaşar, sayfa yenilenince sıfırlanır.
- "Rehbere Kaydet" butonu hiçbir zaman `disabled` yapılmaz; onay yoksa basıldığında hata gösterilir.
- Onay kutusu etiket metni: `"Aydınlatma metnini okudum; iletişim bilgilerinin cihazıma kaydedilmesini kabul ediyorum."`
- Hata mesajı: `"Devam etmek için aydınlatma metnini okuyup onaylamalısınız."` — `src/lib/consent.js` içindeki `CONSENT_ERROR` ile **birebir aynı**, elle kopyalanır.
- Karttan aydınlatma metni sayfasına link **göreli** yol kullanır: `./gizlilik-politikasi.html`. Kök-mutlak `/` kullanılmaz — kart `file://` ile veya kök olmayan bir dağıtım yolunda açılabilir (mevcut `./index.html` linkleriyle aynı gerekçe).
- Yeni renk token'ı yalnızca `--danger: #b3261e` (`--card-bg` #fbfcfd üzerinde 6.36:1). Mevcut palet token'ları değiştirilmez.
- `vite.config.js` **değişmez** — her iki dosya zaten Rollup giriş noktası olarak tanımlı.
- vCard string'i (`N:`, `FN:`, `TEL;`, `EMAIL;`, `ADR;`) ve `a.download` dosya adı **değişmez**.

---

### Task 1: Karta gömülü aydınlatma metni

Metin önce eklenir, kutu sonra (Task 2). Bu sıra kasıtlı: kutunun etiketi "aydınlatma metnini okudum" diyor, metin kartta yokken bu etiket karşılıksız kalırdı. Task 1 tek başına da tutarlı bir kart bırakır — okunabilir bir bilgilendirme bloğu.

**Files:**
- Modify: `AtolyeCard.html` — `<style>` bloğunun sonu (`@media (prefers-reduced-motion)` bloğunun **öncesi**, ~satır 278) ve gövde (`.socials` `</div>`'inden sonra, `.save-btn` butonunun **öncesi**, ~satır 352)

**Interfaces:**
- Üretir: `<details class="notice">` bloğu ve `.notice*` CSS sınıfları. Task 2 bu bloğun **üstüne** onay kutusunu ekler ve `.notice`'a dokunmaz.
- Tüketir: mevcut `:root` token'ları — `--line`, `--mist`, `--ink`, `--muted`, `--azure-dark`, `--silver-dark`.

- [ ] **Step 1: `.notice` stillerini ekle**

`AtolyeCard.html` içinde, `.foot b { … }` kuralından sonra ve `@media (prefers-reduced-motion: reduce)` bloğundan önce ekle:

```css
    /* Embedded KVKK notice. The card is handed out as a single file, so the
       text lives inside it rather than only behind a link that may not
       resolve when the file travels alone. Collapsed by default to keep the
       card compact. */
    .notice {
      margin-top: 14px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--mist);
      text-align: left;
    }

    .notice > summary {
      padding: 10px 12px;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--azure-dark);
      cursor: pointer;
      list-style: none;
    }
    /* Hide the native disclosure triangle in both engines so ::before is the
       only marker and the two platforms look alike. */
    .notice > summary::-webkit-details-marker { display: none; }
    .notice > summary::before { content: "\25B8\00A0"; font-size: 11px; }
    .notice[open] > summary::before { content: "\25BE\00A0"; }
    .notice > summary:focus-visible {
      outline: 2px solid var(--azure-dark);
      outline-offset: 2px;
      border-radius: 12px;
    }

    .notice__body { padding: 0 12px 14px; }

    .notice__body h3 {
      margin-top: 12px;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ink);
    }

    .notice__body p {
      margin-top: 4px;
      font-size: 12.5px;
      line-height: 1.55;
      color: var(--muted);
    }

    .notice__body a {
      color: var(--azure-dark);
      font-weight: 600;
      text-decoration-color: var(--silver-dark);
      text-underline-offset: 3px;
    }
    .notice__body a:hover { text-decoration-color: currentColor; }
    .notice__body a:focus-visible {
      outline: 2px solid var(--azure-dark);
      outline-offset: 2px;
      border-radius: 2px;
    }
```

- [ ] **Step 2: `<details>` bloğunu gövdeye ekle**

`.socials` `<div>`'ini kapatan `</div>` satırından **sonra**, `<button class="save-btn" id="saveVcard">` satırından **önce** ekle:

```html
      <details class="notice">
        <summary>Aydınlatma Metnini Oku</summary>
        <div class="notice__body">
          <h3>Veri Sorumlusu</h3>
          <p>Mehmet Ergün (AtölyeKart) · Kadıköy, İstanbul ·
            <a href="mailto:mehmet@atolyekart.com">mehmet@atolyekart.com</a> ·
            <a href="tel:+905357650668">+90 535 765 06 68</a></p>

          <h3>İşlenen Veri</h3>
          <p>Bu kartvizit sizden kişisel veri toplamaz. “Rehbere Kaydet”, kart
            sahibinin ad, unvan, telefon, e-posta ve adres bilgilerini vCard
            dosyası olarak sizin cihazınıza indirir.</p>

          <h3>Nerede İşlenir</h3>
          <p>İşlem tamamen tarayıcınızda gerçekleşir. AtölyeKart'a hiçbir veri
            gönderilmez, sunucuda kayıt tutulmaz, çerez kullanılmaz.</p>

          <h3>Amaç ve Hukuki Sebep</h3>
          <p>İletişim kurulabilmesi. İşlem, işaretlediğiniz onay kutusuyla
            verdiğiniz açık rızaya (KVKK m.5/1) dayanır.</p>

          <h3>Sizden Beklenen</h3>
          <p>Cihazınıza kaydettiğiniz iletişim bilgilerini yalnızca iletişim
            amacıyla kullanmanız, üçüncü kişilerle paylaşmamanız.</p>

          <h3>Haklarınız</h3>
          <p>KVKK m.11 kapsamındaki haklarınızı kullanmak için
            <a href="mailto:mehmet@atolyekart.com">mehmet@atolyekart.com</a>
            adresine yazabilirsiniz; başvurunuz en geç 30 gün içinde
            yanıtlanır.</p>

          <p><a href="./gizlilik-politikasi.html">Aydınlatma metninin tamamını
            okuyun</a></p>
        </div>
      </details>
```

- [ ] **Step 3: Derlemeyi doğrula**

Çalıştır: `npm run build`

Beklenen: hata yok, çıktıda `dist/AtolyeCard.html` üretildi.

Sonra çalıştır: `grep -c "notice__body" dist/AtolyeCard.html`

Beklenen: `0`'dan büyük bir sayı (Rollup bu dosyayı olduğu gibi kopyalar, sınıflar korunur).

- [ ] **Step 4: Tarayıcıda elle doğrula**

Çalıştır: `npm run dev`, sonra `http://localhost:5173/AtolyeCard.html` adresini aç.

Kontrol listesi:
- Blok **kapalı** başlıyor, "▸ Aydınlatma Metnini Oku" görünüyor.
- Başlığa tıklayınca açılıyor, işaret "▾" oluyor, altı bölüm de görünüyor.
- Tab ile başlığa gidilebiliyor, odak halkası (azure outline) görünüyor, Enter/Space ile açılıp kapanıyor.
- Native üçgen işaret (Chrome/Safari) **görünmüyor** — yalnızca ▸/▾ var.
- "Aydınlatma metninin tamamını okuyun" linki `gizlilik-politikasi.html`'i açıyor.
- Kart kapalı hâlde hâlâ kompakt; blok `.socials` ile "Rehbere Kaydet" arasında duruyor.

Sonra dosyayı **tek başına** aç: `open AtolyeCard.html` (yani `file://` ile, dev sunucusu olmadan).

Beklenen: gömülü metin yine tam olarak görünür ve açılıp kapanır. Tam metin linki bu senaryoda karşılık bulmayabilir — kabul edilen sınır, çünkü metnin kendisi kartın içinde.

- [ ] **Step 5: Commit**

```bash
git add AtolyeCard.html
git commit -m "$(cat <<'MSG'
Kartvizite gömülü KVKK aydınlatma metni ekle

Kapalı bir <details> bloğunda, vCard indirmesine özgü kısaltılmış metin.
Kart tek dosya olarak taşındığında metin kaybolmasın diye link yerine
gömülü; tam metne link blok içinde duruyor.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

### Task 2: Onay kutusu ve vCard geçişi

**Files:**
- Modify: `AtolyeCard.html` — `:root` (yeni `--danger` token'ı), `<style>` (Task 1'in eklediği `.notice` kurallarının **öncesi**), gövde (`.socials` `</div>`'i ile Task 1'in `<details>` bloğu **arasına**), `<script>` (mevcut `#saveVcard` handler'ı)

**Interfaces:**
- Tüketir: Task 1'in eklediği `.notice` bloğu — kutunun etiketi bu metne atıfta bulunur.
- Üretir: `#consentCheck` (checkbox) ve `#consentError` (hata paragrafı) id'leri; `#saveVcard` handler'ının başındaki guard.

- [ ] **Step 1: `--danger` token'ını ekle**

`:root` bloğunda, `--line: #dfe6ec;` satırından sonra ekle:

```css
      --danger: #b3261e;       /* 6.36:1 on --card-bg */
```

- [ ] **Step 2: Onay kutusu stillerini ekle**

`<style>` içinde, Task 1'de eklenen `/* Embedded KVKK notice. … */` yorumundan **önce** ekle:

```css
    /* Consent gate for the vCard download. Label wraps the input, so no
       for/id pairing is needed; the error paragraph sits outside the label
       and is wired up with aria-describedby only while it is visible. */
    .consent {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 22px;
      text-align: left;
      cursor: pointer;
    }

    .consent input[type="checkbox"] {
      flex: none;
      width: 18px;
      height: 18px;
      margin-top: 1px;
      accent-color: var(--azure-deep);
      cursor: pointer;
    }
    .consent input[type="checkbox"]:focus-visible {
      outline: 2px solid var(--azure-dark);
      outline-offset: 2px;
    }

    .consent__text {
      font-size: 12.5px;
      line-height: 1.5;
      color: var(--muted);
    }

    .consent__error {
      margin-top: 8px;
      font-size: 12.5px;
      line-height: 1.5;
      font-weight: 600;
      color: var(--danger);
      text-align: left;
    }
```

- [ ] **Step 3: Kutuyu ve hata paragrafını gövdeye ekle**

`.socials` `<div>`'ini kapatan `</div>` satırından **sonra**, Task 1'de eklenen `<details class="notice">` satırından **önce** ekle:

```html
      <label class="consent">
        <input type="checkbox" id="consentCheck" />
        <span class="consent__text">Aydınlatma metnini okudum; iletişim
          bilgilerinin cihazıma kaydedilmesini kabul ediyorum.</span>
      </label>

      <p class="consent__error" id="consentError" role="alert" hidden>Devam
        etmek için aydınlatma metnini okuyup onaylamalısınız.</p>
```

- [ ] **Step 4: Guard'ı ve temizleme mantığını script'e ekle**

`<script>` içinde, mevcut yorumun (`// vCard download — …`) **öncesine** ekle:

```js
    // KVKK consent gate. The vCard download is this card's only action, so
    // the checkbox guards it directly. Consent lives in the DOM only —
    // nothing is persisted, which is exactly what the embedded notice
    // promises. Error copy is kept identical to CONSENT_ERROR in
    // src/lib/consent.js; this file stays dependency-free, so the string is
    // duplicated by hand and must be updated in both places.
    const consentCheck = document.getElementById('consentCheck');
    const consentError = document.getElementById('consentError');

    function clearConsentError() {
      consentError.hidden = true;
      consentCheck.removeAttribute('aria-invalid');
      consentCheck.removeAttribute('aria-describedby');
    }

    consentCheck.addEventListener('change', function () {
      if (consentCheck.checked) clearConsentError();
    });
```

Sonra mevcut handler'ın gövdesinin **ilk satırı** olarak, `const vcard = [` satırından önce ekle:

```js
      if (!consentCheck.checked) {
        consentError.hidden = false;
        consentCheck.setAttribute('aria-invalid', 'true');
        consentCheck.setAttribute('aria-describedby', 'consentError');
        consentCheck.focus();
        return;
      }

```

- [ ] **Step 5: Derlemeyi doğrula**

Çalıştır: `npm run build`

Beklenen: hata yok.

Sonra çalıştır: `grep -c "consentCheck" dist/AtolyeCard.html`

Beklenen: `4`'ten büyük bir sayı (id + handler içindeki referanslar).

Sonra çalıştır: `grep -c -- "--danger" dist/AtolyeCard.html`

Beklenen: `2` (token tanımı + `.consent__error` kullanımı).

- [ ] **Step 6: Tarayıcıda elle doğrula — kapı çalışıyor**

`npm run dev` ile `http://localhost:5173/AtolyeCard.html` adresini aç.

Kontrol listesi:
- Kutu işaretsizken "Rehbere Kaydet"e bas → **hiçbir dosya inmez**, kutunun altında kırmızı hata metni görünür, odak kutuya geçer.
- Butonun görünümü değişmez, `disabled` olmaz (DevTools'ta niteliği yok).
- Kutuyu işaretle → hata metni kaybolur.
- Butona bas → `MehmetErgun.vcf` iner. Dosyayı aç, `TEL`/`EMAIL`/`FN` satırları eskisiyle aynı.
- Sayfayı yenile → kutu **işaretsiz** döner (onay saklanmıyor).
- DevTools → Application → Local Storage / Cookies: bu sayfaya ait **hiçbir kayıt yok**.
- Yalnızca klavye: Tab ile kutuya, Space ile işaretle, Tab ile butona, Enter ile indir — akış tamamlanır, tüm odak halkaları görünür.
- Hata görünürken DevTools'ta checkbox üzerinde `aria-invalid="true"` ve `aria-describedby="consentError"` var; kutu işaretlenince ikisi de kalkıyor.

- [ ] **Step 7: Commit**

```bash
git add AtolyeCard.html
git commit -m "$(cat <<'MSG'
vCard indirmesini KVKK onay kutusuyla kapıla

Kutu işaretlenmeden "Rehbere Kaydet" indirmiyor; Türkçe hata gösteriyor
ve odağı kutuya taşıyor. Buton disabled olmuyor — katalogdaki gönder
butonu deseniyle aynı. Onay yalnızca DOM'da, hiçbir yere kaydedilmiyor.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

### Task 3: Aydınlatma metni sayfasını güncelle

**Files:**
- Modify: `gizlilik-politikasi.html:145` (`.doc__updated` tarihi) ve `gizlilik-politikasi.html:166` (§2'nin son paragrafı)

**Interfaces:**
- Tüketir: Task 2'nin eklediği onay kutusu davranışı — bu paragraf onu tarif eder.
- Üretir: yok (son task).

- [ ] **Step 1: Son güncelleme tarihini değiştir**

`<p class="doc__updated">Son güncelleme: 29 Temmuz 2026</p>` satırını şununla değiştir:

```html
    <p class="doc__updated">Son güncelleme: 30 Temmuz 2026</p>
```

- [ ] **Step 2: §2'nin son paragrafına onay kutusu cümlelerini ekle**

§2 içindeki mevcut paragrafı bul:

```html
      <p>Sitedeki dijital kartvizit sayfası (AtölyeKart Dijital Kartvizit) sizden herhangi bir kişisel veri toplamaz; tam tersine, kartvizit sahibinin iletişim bilgilerini "Rehbere Kaydet" butonuyla sizin cihazınıza (vCard olarak) aktarır. Bu işlem tamamen tarayıcınızda gerçekleşir, AtölyeKart'a herhangi bir veri gönderilmez.</p>
```

Şununla değiştir (mevcut cümleler **kelimesi kelimesine korunur**, sonuna iki cümle eklenir):

```html
      <p>Sitedeki dijital kartvizit sayfası (AtölyeKart Dijital Kartvizit) sizden herhangi bir kişisel veri toplamaz; tam tersine, kartvizit sahibinin iletişim bilgilerini "Rehbere Kaydet" butonuyla sizin cihazınıza (vCard olarak) aktarır. Bu işlem tamamen tarayıcınızda gerçekleşir, AtölyeKart'a herhangi bir veri gönderilmez. Kartvizit üzerinde, indirmeden önce işaretlemeniz gereken bir onay kutusu ve bu işleme özgü kısa bir aydınlatma metni bulunur. Verdiğiniz onay yalnızca açık olduğunuz tarayıcı sekmesinde tutulur; hiçbir yere kaydedilmez, AtölyeKart'a iletilmez ve sayfayı yenilediğinizde sıfırlanır.</p>
```

- [ ] **Step 3: Derlemeyi ve metni doğrula**

Çalıştır: `npm run build`

Beklenen: hata yok.

Sonra çalıştır: `grep -c "onay kutusu ve bu işleme özgü" dist/gizlilik-politikasi.html`

Beklenen: `1`

- [ ] **Step 4: Tarayıcıda elle doğrula**

`http://localhost:5173/gizlilik-politikasi.html` adresini aç.

Kontrol listesi:
- Başlık altında "Son güncelleme: 30 Temmuz 2026" yazıyor.
- §2'nin son paragrafı yeni iki cümleyi içeriyor; önceki cümleler değişmemiş.
- Karttaki gömülü metinle bu paragraf birbiriyle çelişmiyor (ikisi de "hiçbir veri gönderilmez, hiçbir şey kaydedilmez" diyor).
- Sayfanın altındaki "El yapımı ürün kataloğuna dön" linki hâlâ çalışıyor.

- [ ] **Step 5: Commit**

```bash
git add gizlilik-politikasi.html
git commit -m "$(cat <<'MSG'
Aydınlatma metnine kartvizit onay kutusunu ekle

§2'deki "kartvizit veri toplamaz" ifadesi korunuyor; sonuna onay
kutusunun varlığı ve onayın hiçbir yere kaydedilmediği eklendi.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Kapsam Dışı

- Karta form veya webhook olayı (`card_saved` dahil) eklenmesi.
- Katalog formlarının onay metinleri — 2026-07-29 planıyla tamamlandı.
- Çerez banner'ı — site çerez kullanmıyor.
- `src/lib/consent.js`'in kartla paylaşılması — tek parça kuralını bozar.
- `src/components/ProductGrid.jsx` ölü kodunun silinmesi — ayrı iş.
