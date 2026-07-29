# KVKK Aydınlatma Metni Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AtölyeKart'a KVKK madde 10 uyarınca bir aydınlatma metni sayfası ekle, kataloğun footer'ından bu sayfaya link ver, ve kişisel veri toplayan iki formu (Sipariş Ver, Stok Bildirimi İste) gönderim öncesi zorunlu onay kutusuyla bu metne bağla.

**Architecture:** Üç bağımsız değişiklik grubu. (1) `AtolyeCard.html` deseninde bağımsız, inline-style'lı yeni bir statik sayfa (`gizlilik-politikasi.html`), `vite.config.js`'e üçüncü Rollup giriş noktası olarak eklenir. (2) `App.jsx`'e bu sayfaya link veren bir footer eklenir. (3) `OrderModal.jsx` ve `StockAlertModal.jsx`'in mevcut `validate()` → `errors` desenine bir `consent` alanı eklenir; işaretlenmeden gönderim engellenir.

**Tech Stack:** Vite 8 + React 19 (mevcut proje), harici bağımlılık eklenmez. Projede otomatik test altyapısı yok (package.json'da test script'i yok) — doğrulama `npm run build` (derleme hatası yakalar) ve `npm run dev` üzerinden elle tarayıcı kontrolüyle yapılır.

## Global Constraints

- Kullanıcıya görünen tüm metinler Türkçe, kod/yorumlar İngilizce (CLAUDE.md).
- `gizlilik-politikasi.html` bağımsız bir dosya olmalı: harici script/stylesheet/font yok, inline `<style>` (AtolyeCard.html deseni — `.claude/skills/atolyecard/SKILL.md`).
- Aydınlatma metninin nihai içeriği `docs/superpowers/specs/2026-07-29-kvkk-aydinlatma-metni-design.md`'de tam olarak yazılı — kelimesi kelimesine oradan kopyalanır, yeniden yazılmaz veya yorumlanmaz.
- Onay kutusu metni: `"Aydınlatma Metni'ni okudum, kişisel verilerimin bu kapsamda işlenmesini kabul ediyorum."` — "Aydınlatma Metni" ifadesi linktir.
- Doğrulama hata mesajı (checkbox işaretlenmeden gönderilirse): `"Devam etmek için aydınlatma metnini okuyup onaylamalısınız."`
- Webhook payload sözleşmesi değişmez — `consent` alanı hiçbir POST gövdesine eklenmez, sadece istemci tarafı bir geçiştir (`.claude/skills/atolyecard/SKILL.md`: "Zarfa yeni üst seviye anahtar eklemek" yasak).
- `gizlilik-politikasi.html`'den kataloğa dönüş linki göreli yol kullanır (`./index.html`) — bu dosya `AtolyeCard.html` gibi bağımsız açılabilir bir dosya. React app'in (`App.jsx`) bu yeni sayfaya linki ise mutlak yol kullanır (`/gizlilik-politikasi.html`) — App.jsx her zaman bir sunucudan servis edilir, `file://` riski yok (mevcut `/AtolyeCard.html` linkiyle aynı konvansiyon).

---

### Task 1: Aydınlatma Metni Sayfası

**Files:**
- Create: `gizlilik-politikasi.html`
- Modify: `vite.config.js`

**Interfaces:**
- Üretir: `/gizlilik-politikasi.html` URL'i (build sonrası `dist/gizlilik-politikasi.html`). Task 2, 3, 4 bu path'e link verir.

- [ ] **Step 1: `gizlilik-politikasi.html` dosyasını oluştur**

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gizlilik Politikası ve KVKK Aydınlatma Metni · AtölyeKart</title>
  <style>
    /* Self-contained by design, same reasoning as AtolyeCard.html: this page
       must be shareable/openable on its own, so it carries its own copy of
       the design tokens rather than importing src/index.css. */
    :root {
      --azure: #3f83ab;
      --azure-dark: #2f6b8f;   /* accent text — 5.6:1 on --card-bg */
      --azure-deep: #245876;

      --mist: #eef2f6;
      --line: #dfe6ec;

      --ink: #25313d;          /* 12.9:1 on --card-bg */
      --muted: #54626f;        /* 6.1:1 on --card-bg */
      --card-bg: #fbfcfd;

      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
      --font-brand: "Avenir Next", Avenir, "Century Gothic", Futura, "Segoe UI", system-ui, sans-serif;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      font-family: var(--font-sans);
      background: var(--mist);
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .doc {
      max-width: 720px;
      margin: 0 auto;
      padding: 56px 28px 72px;
      background: var(--card-bg);
    }

    .doc__eyebrow {
      font-family: var(--font-brand);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--azure-dark);
    }

    .doc__title {
      margin-top: 10px;
      font-family: var(--font-display);
      font-size: 30px;
      font-weight: 600;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }

    .doc__updated {
      margin-top: 8px;
      font-size: 13px;
      color: var(--muted);
    }

    .doc section {
      margin-top: 36px;
      padding-top: 28px;
      border-top: 1px solid var(--line);
    }

    .doc h2 {
      font-family: var(--font-display);
      font-size: 19px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .doc p { margin-top: 12px; line-height: 1.7; font-size: 15px; }

    .doc ul {
      margin-top: 12px;
      padding-left: 22px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .doc li { line-height: 1.65; font-size: 15px; }

    .doc a {
      color: var(--azure-dark);
      text-decoration-color: var(--line);
      text-underline-offset: 3px;
    }
    .doc a:hover { color: var(--azure-deep); text-decoration-color: currentColor; }
    .doc a:focus-visible {
      outline: 2px solid var(--azure-dark);
      outline-offset: 2px;
      border-radius: 2px;
    }

    .doc .note {
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      background: var(--mist);
      color: var(--muted);
      font-size: 13.5px;
      font-style: italic;
      line-height: 1.6;
    }

    .doc__back {
      display: inline-block;
      margin-top: 44px;
      font-size: 14px;
      font-weight: 600;
      color: var(--azure-dark);
      text-decoration: underline;
      text-decoration-color: var(--line);
      text-underline-offset: 4px;
    }
    .doc__back:hover { color: var(--azure-deep); text-decoration-color: currentColor; }
    .doc__back:focus-visible {
      outline: 2px solid var(--azure-dark);
      outline-offset: 3px;
      border-radius: 3px;
    }

    @media (max-width: 480px) {
      .doc { padding: 40px 20px 56px; }
      .doc__title { font-size: 25px; }
    }
  </style>
</head>
<body>
  <main class="doc">
    <p class="doc__eyebrow">AtölyeKart</p>
    <h1 class="doc__title">Kişisel Verilerin Korunması Hakkında Aydınlatma Metni</h1>
    <p class="doc__updated">Son güncelleme: 29 Temmuz 2026</p>

    <section>
      <h2>1. Veri Sorumlusunun Kimliği</h2>
      <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, aşağıda belirtilen kişisel verileriniz veri sorumlusu sıfatıyla Mehmet Ergün (AtölyeKart) tarafından bu aydınlatma metninde açıklanan kapsamda işlenmektedir.</p>
      <ul>
        <li><strong>Veri Sorumlusu:</strong> Mehmet Ergün (AtölyeKart) — gerçek kişi / şahıs işletmesi</li>
        <li><strong>Adres:</strong> Kadıköy, İstanbul</li>
        <li><strong>E-posta:</strong> <a href="mailto:mehmet@atolyekart.com">mehmet@atolyekart.com</a></li>
        <li><strong>Telefon:</strong> <a href="tel:+905357650668">+90 535 765 06 68</a></li>
      </ul>
    </section>

    <section>
      <h2>2. İşlenen Kişisel Veri Kategorileri</h2>
      <p>AtölyeKart web sitesindeki "Sipariş Ver" ve "Stok Bildirimi İste" formlarını doldurduğunuzda aşağıdaki kişisel verileriniz işlenir:</p>
      <ul>
        <li><strong>Kimlik:</strong> Ad, soyad</li>
        <li><strong>İletişim:</strong> Telefon numarası (sipariş formu) ve/veya e-posta adresi (stok bildirimi formu)</li>
        <li><strong>İşlem Güvenliği:</strong> Talebin gönderildiği tarih ve saat, kullandığınız tarayıcı/cihaz bilgisi (user agent), varsa siteye yönlendiren sayfa adresi (referrer)</li>
      </ul>
      <p>Sitedeki dijital kartvizit sayfası (AtölyeKart Dijital Kartvizit) sizden herhangi bir kişisel veri toplamaz; tam tersine, kartvizit sahibinin iletişim bilgilerini "Rehbere Kaydet" butonuyla sizin cihazınıza (vCard olarak) aktarır. Bu işlem tamamen tarayıcınızda gerçekleşir, AtölyeKart'a herhangi bir veri gönderilmez.</p>
    </section>

    <section>
      <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
      <p>Kişisel verileriniz;</p>
      <ul>
        <li>İlettiğiniz sipariş taleplerinin alınması, değerlendirilmesi ve sizinle iletişime geçilerek sonuçlandırılması,</li>
        <li>Stok bildirimi taleplerinin kaydedilmesi ve ürün stoğa girdiğinde sizinle iletişime geçilmesi,</li>
        <li>Talebinizle ilgili sizinle iletişim kurulması</li>
      </ul>
      <p>amaçlarıyla işlenmektedir.</p>
    </section>

    <section>
      <h2>4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
      <p>Kişisel verileriniz, web sitesindeki ilgili formu doldurup göndermeniz yoluyla, doğrudan sizden, elektronik ortamda toplanmaktadır.</p>
      <p>Verileriniz;</p>
      <ul>
        <li>Form gönderimi öncesinde işaretlediğiniz onay kutusuyla verdiğiniz açık rızanıza (KVKK m.5/1) dayanılarak,</li>
        <li>Sipariş talepleri bakımından ayrıca bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (KVKK m.5/2-c) hukuki sebebine dayanılarak</li>
      </ul>
      <p>işlenmektedir.</p>
    </section>

    <section>
      <h2>5. Kişisel Verilerin Aktarılması</h2>
      <p>Kişisel verileriniz;</p>
      <ul>
        <li>Sipariş ve stok bildirimi taleplerinizin yürütülmesi amacıyla kullandığımız otomasyon/entegrasyon hizmet sağlayıcısına (veri işleyen sıfatıyla),</li>
        <li>Web sitesinin barındırılmasını sağlayan Vercel Inc.'e (barındırma hizmeti kapsamında, teknik erişim kayıtları bağlamında),</li>
        <li>Yasal bir yükümlülüğün yerine getirilmesi gerektiği hallerde yetkili kamu kurum ve kuruluşlarına</li>
      </ul>
      <p>KVKK'nın 8. ve 9. maddelerinde öngörülen şartlara uygun olarak aktarılabilir.</p>
      <p class="note">Not: Sipariş ve stok bildirimi taleplerinin işlenmesinde kullanılan otomasyon/entegrasyon hizmet sağlayıcısı şu an netleşmemiştir; sağlayıcı belirlendiğinde bu metin güncellenecektir.</p>
    </section>

    <section>
      <h2>6. Yurt Dışına Aktarım</h2>
      <p>Yukarıda belirtilen hizmet sağlayıcılarının (barındırma ve otomasyon/entegrasyon hizmeti) sunucuları yurt dışında bulunabilir. Bu durumda kişisel verileriniz, KVKK'nın 9. maddesinde öngörülen şartlara (yeterli korumanın bulunduğu ülkeler, Kurul tarafından onaylanan taahhütnameler veya diğer uygun güvenceler) uygun şekilde yurt dışına aktarılabilir.</p>
    </section>

    <section>
      <h2>7. Kişisel Verilerin Saklama Süresi</h2>
      <p>Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca, ilgili mevzuatta öngörülen zamanaşımı ve saklama süreleri saklı kalmak kaydıyla, talebinizin sonuçlanmasından itibaren en fazla 2 (iki) yıl süreyle saklanır. Bu sürenin sonunda verileriniz silinir, yok edilir veya anonim hale getirilir.</p>
    </section>

    <section>
      <h2>8. Çerezler ve Benzeri Teknolojiler</h2>
      <p>AtölyeKart web sitesi şu an itibarıyla çerez (cookie), analitik izleme veya reklam amaçlı herhangi bir üçüncü taraf takip teknolojisi kullanmamaktadır. Bu durumda bir değişiklik olması hâlinde bu metin güncellenecektir.</p>
    </section>

    <section>
      <h2>9. KVKK Madde 11 Kapsamındaki Haklarınız</h2>
      <p>KVKK'nın 11. maddesi uyarınca veri sorumlusuna başvurarak;</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
        <li>Düzeltme, silme ve yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
        <li>İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
        <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
      </ul>
      <p>haklarına sahipsiniz.</p>
    </section>

    <section>
      <h2>10. Başvuru Yöntemi</h2>
      <p>Yukarıdaki haklarınızı kullanmak için taleplerinizi <a href="mailto:mehmet@atolyekart.com">mehmet@atolyekart.com</a> adresine e-posta yoluyla iletebilirsiniz. Başvurunuz, KVKK'da öngörülen süre içinde (en geç 30 gün içinde) yanıtlanır.</p>
    </section>

    <section>
      <h2>11. Değişiklikler</h2>
      <p>Bu aydınlatma metni, yasal düzenlemelerdeki değişiklikler veya veri işleme faaliyetlerimizdeki güncellemeler doğrultusunda revize edilebilir. Güncel metin her zaman bu sayfada yayımlanır.</p>
    </section>

    <!-- Relative path, not "/" — like AtolyeCard.html, this file can be
         opened standalone (file:// or a non-root deployment path). -->
    <a class="doc__back" href="./index.html">El yapımı ürün kataloğuna dön</a>
  </main>
</body>
</html>
```

- [ ] **Step 2: `vite.config.js`'e üçüncü giriş noktasını ekle**

`vite.config.js` içinde `rollupOptions.input` bloğunu güncelle:

```js
      /* Three entry points. AtolyeCard.html and gizlilik-politikasi.html are
         self-contained — no module script, styles inline — so Rollup only
         copies them through; they're listed here purely so `npm run build`
         emits them into dist/. */
      input: {
        main: entry("./index.html"),
        card: entry("./AtolyeCard.html"),
        policy: entry("./gizlilik-politikasi.html"),
      },
```

(Yalnızca yorum metni ve `policy` satırı değişiyor; `main`/`card` satırları aynı kalıyor.)

- [ ] **Step 3: Build ile doğrula**

Run: `cd "/Users/mehmetergun/Desktop/AtölyeKart" && npm run build`
Expected: Hatasız tamamlanır, çıktıda `dist/gizlilik-politikasi.html` satırı görünür (`dist/AtolyeCard.html` ve `dist/index.html` satırlarıyla birlikte).

Run: `test -f "/Users/mehmetergun/Desktop/AtölyeKart/dist/gizlilik-politikasi.html" && echo FOUND`
Expected: `FOUND`

- [ ] **Step 4: Commit**

```bash
cd "/Users/mehmetergun/Desktop/AtölyeKart"
git add gizlilik-politikasi.html vite.config.js
git commit -m "$(cat <<'EOF'
KVKK aydınlatma metni sayfasını ekle

Sipariş ve stok bildirimi formlarının topladığı kişisel verileri
KVKK m.10 kapsamında açıklayan bağımsız statik sayfa. AtolyeCard.html
deseninde: harici bağımlılık yok, inline stil.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Katalog Footer'ı

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Tüketir: Task 1'in ürettiği `/gizlilik-politikasi.html` path'i.

- [ ] **Step 1: `App.jsx`'e footer ekle**

`src/App.jsx` içinde `</main>` kapanışından hemen sonra, `{notice && ...}` bloğundan önce:

```jsx
      <footer className="page__foot">
        <a className="page__foot-link" href="/gizlilik-politikasi.html">
          Gizlilik Politikası ve KVKK Aydınlatma Metni
        </a>
      </footer>
```

Tam bağlam (değişmeyen satırlar context için gösterildi):

```jsx
      <main>
        <ProductList
          products={products}
          onAddToCart={handleAddToCart}
          onNotify={handleNotify}
        />
      </main>

      <footer className="page__foot">
        <a className="page__foot-link" href="/gizlilik-politikasi.html">
          Gizlilik Politikası ve KVKK Aydınlatma Metni
        </a>
      </footer>

      {notice && (
        <div className="toast" role="status" onClick={() => setNotice("")}>
          {notice}
        </div>
      )}
```

- [ ] **Step 2: `src/index.css`'in sonuna footer stillerini ekle**

```css
.page__foot {
  margin-top: var(--space-7, 56px);
  padding-top: var(--space-5, 24px);
  border-top: 1px solid var(--line);
  text-align: center;
}

.page__foot-link {
  font-size: var(--text-sm, 13px);
  font-weight: 600;
  color: var(--muted);
  text-decoration: underline;
  text-decoration-color: var(--line);
  text-underline-offset: 3px;
}
.page__foot-link:hover {
  color: var(--azure-dark);
  text-decoration-color: currentColor;
}
.page__foot-link:focus-visible {
  outline: 2px solid var(--azure-dark);
  outline-offset: 2px;
  border-radius: 2px;
}
```

- [ ] **Step 3: Build ile doğrula**

Run: `cd "/Users/mehmetergun/Desktop/AtölyeKart" && npm run build`
Expected: Hatasız tamamlanır.

- [ ] **Step 4: Dev server'da elle doğrula**

Run: `cd "/Users/mehmetergun/Desktop/AtölyeKart" && npm run dev` (arka planda bırak)

Tarayıcıda yazdırılan Local URL'i aç:
- Ürün listesinin altında "Gizlilik Politikası ve KVKK Aydınlatma Metni" linkinin göründüğünü doğrula.
- Linke tıkla, `/gizlilik-politikasi.html`'in açıldığını ve Task 1'de yazılan başlığın ("Kişisel Verilerin Korunması Hakkında Aydınlatma Metni") göründüğünü doğrula.
- O sayfadaki "El yapımı ürün kataloğuna dön" linkine tıkla, kataloğa geri döndüğünü doğrula.

Dev server'ı durdur.

- [ ] **Step 5: Commit**

```bash
cd "/Users/mehmetergun/Desktop/AtölyeKart"
git add src/App.jsx src/index.css
git commit -m "$(cat <<'EOF'
Kataloğa gizlilik politikası footer linki ekle

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Stok Bildirimi Formuna Onay Kutusu

**Files:**
- Modify: `src/lib/useWebhookForm.js`
- Modify: `src/components/StockAlertModal.jsx`
- Modify: `src/components/FormModal.css`

**Interfaces:**
- Tüketir: Task 1'in `/gizlilik-politikasi.html` path'i.
- Üretir: `useWebhookForm` hook'unun döndürdüğü nesneye yeni bir `handleCheckboxChange(field)` fonksiyonu eklenir — imza: `(field: string) => (event: ChangeEvent<HTMLInputElement>) => void`, `event.target.checked`'i `values[field]`'a yazar. Mevcut `handleChange` davranışı değişmez.

- [ ] **Step 1: `useWebhookForm.js`'e `handleCheckboxChange` ekle**

`src/lib/useWebhookForm.js` içinde `handleChange`'in tanımlandığı yerin hemen altına ekle:

```js
  const handleCheckboxChange = useCallback(
    (field) => (event) => {
      const { checked } = event.target;
      setValues((current) => ({ ...current, [field]: checked }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    []
  );
```

Ve dosyanın sonundaki `return` bloğuna ekle (mevcut alanlar aynı kalır, sadece yeni alan eklenir):

```js
  return {
    values,
    errors,
    status,
    errorMessage,
    sending: status === "sending",
    handleChange,
    handleCheckboxChange,
    handleSubmit,
  };
```

- [ ] **Step 2: `StockAlertModal.jsx`'te `validate` fonksiyonuna consent kontrolü ekle**

Mevcut:

```js
function validate({ name, email }) {
  const errors = {};
  const trimmedName = name.trim();

  if (!trimmedName) errors.name = "Adınızı ve soyadınızı yazın.";
  else if (trimmedName.length < 2) errors.name = "Ad en az 2 karakter olmalı.";
  else if (trimmedName.length > 80) errors.name = "Ad en fazla 80 karakter olabilir.";

  const trimmedEmail = email.trim();
  if (!trimmedEmail) errors.email = "E-posta adresinizi yazın.";
  else if (!EMAIL_PATTERN.test(trimmedEmail))
    errors.email = "Geçerli bir e-posta yazın, örneğin ayse@ornek.com.";

  return errors;
}
```

Yeni:

```js
function validate({ name, email, consent }) {
  const errors = {};
  const trimmedName = name.trim();

  if (!trimmedName) errors.name = "Adınızı ve soyadınızı yazın.";
  else if (trimmedName.length < 2) errors.name = "Ad en az 2 karakter olmalı.";
  else if (trimmedName.length > 80) errors.name = "Ad en fazla 80 karakter olabilir.";

  const trimmedEmail = email.trim();
  if (!trimmedEmail) errors.email = "E-posta adresinizi yazın.";
  else if (!EMAIL_PATTERN.test(trimmedEmail))
    errors.email = "Geçerli bir e-posta yazın, örneğin ayse@ornek.com.";

  if (!consent)
    errors.consent = "Devam etmek için aydınlatma metnini okuyup onaylamalısınız.";

  return errors;
}
```

- [ ] **Step 3: `useWebhookForm` çağrısına `consent` başlangıç değeri ve `handleCheckboxChange`'i ekle**

Mevcut:

```js
  const {
    values,
    errors,
    status,
    errorMessage,
    sending,
    handleChange,
    handleSubmit,
  } = useWebhookForm({
    initialValues: { name: "", email: "" },
    validate,
    buildPayload,
    onSuccess: handleSuccess,
    messages: ERROR_MESSAGES,
  });
```

Yeni:

```js
  const {
    values,
    errors,
    status,
    errorMessage,
    sending,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
  } = useWebhookForm({
    initialValues: { name: "", email: "", consent: false },
    validate,
    buildPayload,
    onSuccess: handleSuccess,
    messages: ERROR_MESSAGES,
  });
```

`buildPayload` değişmez — zaten sadece `{ name, email }`'i destructure ediyor, `consent` payload'a sızmaz.

- [ ] **Step 4: Formun JSX'ine checkbox'ı ekle**

E-posta alanından sonra, `status === "error"` bloğundan önce ekle:

```jsx
            <label className="fmodal-field fmodal-field--checkbox">
              <input
                type="checkbox"
                checked={values.consent}
                onChange={handleCheckboxChange("consent")}
                disabled={sending}
                aria-invalid={Boolean(errors.consent)}
              />
              <span>
                <a href="/gizlilik-politikasi.html" target="_blank" rel="noopener">
                  Aydınlatma Metni
                </a>
                'ni okudum, kişisel verilerimin bu kapsamda işlenmesini kabul
                ediyorum.
              </span>
            </label>
            {errors.consent && (
              <span className="fmodal-field__error">{errors.consent}</span>
            )}
```

- [ ] **Step 5: `FormModal.css`'e checkbox stillerini ekle**

Dosyanın sonuna (`@media (prefers-reduced-motion: reduce)` bloğundan önce):

```css
.fmodal-field--checkbox {
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
}

.fmodal-field--checkbox input[type="checkbox"] {
  flex: none;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--azure-deep, #245876);
}

.fmodal-field--checkbox span {
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted, #6b5a4c);
}

.fmodal-field--checkbox a {
  color: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: var(--line-strong, #ddcdb8);
}
.fmodal-field--checkbox a:hover { text-decoration-color: currentColor; }
```

- [ ] **Step 6: Build ile doğrula**

Run: `cd "/Users/mehmetergun/Desktop/AtölyeKart" && npm run build`
Expected: Hatasız tamamlanır.

- [ ] **Step 7: Dev server'da elle doğrula**

Run: `cd "/Users/mehmetergun/Desktop/AtölyeKart" && npm run dev` (arka planda bırak)

Tarayıcıda:
- Tükendi durumundaki bir üründe "Stok Bildirimi İste" butonuna tıkla, formu aç.
- Ad ve e-posta alanlarını doldur, checkbox'ı **işaretlemeden** "Bildirim İste" butonuna bas.
- Checkbox'ın altında `"Devam etmek için aydınlatma metnini okuyup onaylamalısınız."` hatasının göründüğünü ve formun gönderilmediğini doğrula.
- Checkbox'ı işaretle, tekrar gönder — bu sefer hatanın kaybolduğunu ve gönderimin devam ettiğini (webhook URL'i geçerli değilse ağ hatası mesajı görünmesi beklenir, bu KVKK akışının başarısıyla ilgisizdir) doğrula.
- Checkbox etiketindeki "Aydınlatma Metni" linkine tıkla, yeni sekmede `/gizlilik-politikasi.html`'in açıldığını doğrula.

Dev server'ı durdur.

- [ ] **Step 8: Commit**

```bash
cd "/Users/mehmetergun/Desktop/AtölyeKart"
git add src/lib/useWebhookForm.js src/components/StockAlertModal.jsx src/components/FormModal.css
git commit -m "$(cat <<'EOF'
Stok bildirimi formuna KVKK onay kutusu ekle

useWebhookForm'a checkbox alanları için handleCheckboxChange eklendi
(handleChange checkbox'larda event.target.value okur, checked değil).
Onay verilmeden gönderim engellenir.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Sipariş Formuna Onay Kutusu

**Files:**
- Modify: `src/components/OrderModal.jsx`
- Modify: `src/components/OrderModal.css`

**Interfaces:**
- Tüketir: Task 1'in `/gizlilik-politikasi.html` path'i. `OrderModal` kendi lokal state'ini tutar (Task 3'teki hook'a bağımlı değil).

- [ ] **Step 1: `validate` fonksiyonuna consent kontrolü ekle**

Mevcut:

```js
function validate({ name, phone }) {
  const errors = {};
  const trimmedName = name.trim();

  if (!trimmedName) errors.name = "Adınızı ve soyadınızı yazın.";
  else if (trimmedName.length < 2) errors.name = "Ad en az 2 karakter olmalı.";
  else if (trimmedName.length > 80) errors.name = "Ad en fazla 80 karakter olabilir.";

  if (!phone.trim()) errors.phone = "Telefon numaranızı yazın.";
  else if (!normalizePhone(phone))
    errors.phone = "Numarayı 10 haneli girin, örneğin 555 123 45 67.";

  return errors;
}
```

Yeni:

```js
function validate({ name, phone, consent }) {
  const errors = {};
  const trimmedName = name.trim();

  if (!trimmedName) errors.name = "Adınızı ve soyadınızı yazın.";
  else if (trimmedName.length < 2) errors.name = "Ad en az 2 karakter olmalı.";
  else if (trimmedName.length > 80) errors.name = "Ad en fazla 80 karakter olabilir.";

  if (!phone.trim()) errors.phone = "Telefon numaranızı yazın.";
  else if (!normalizePhone(phone))
    errors.phone = "Numarayı 10 haneli girin, örneğin 555 123 45 67.";

  if (!consent)
    errors.consent = "Devam etmek için aydınlatma metnini okuyup onaylamalısınız.";

  return errors;
}
```

- [ ] **Step 2: Bileşen state'ine `consent` ekle ve checkbox handler'ı yaz**

Mevcut:

```js
  const [values, setValues] = useState({ name: "", phone: "" });
```

Yeni:

```js
  const [values, setValues] = useState({ name: "", phone: "", consent: false });
```

`handleChange` tanımının hemen altına ekle:

```js
  const handleConsentChange = (event) => {
    setValues((current) => ({ ...current, consent: event.target.checked }));
    setErrors((current) => ({ ...current, consent: undefined }));
  };
```

- [ ] **Step 3: Formun JSX'ine checkbox'ı ekle**

Telefon alanından sonra, `status === "error"` bloğundan önce ekle:

```jsx
              <label className="order-field order-field--checkbox">
                <input
                  type="checkbox"
                  checked={values.consent}
                  onChange={handleConsentChange}
                  disabled={sending}
                  aria-invalid={Boolean(errors.consent)}
                />
                <span>
                  <a href="/gizlilik-politikasi.html" target="_blank" rel="noopener">
                    Aydınlatma Metni
                  </a>
                  'ni okudum, kişisel verilerimin bu kapsamda işlenmesini
                  kabul ediyorum.
                </span>
              </label>
              {errors.consent && (
                <span className="order-field__error">{errors.consent}</span>
              )}
```

- [ ] **Step 4: `OrderModal.css`'e checkbox stillerini ekle**

Dosyanın sonuna (`@media (prefers-reduced-motion: reduce)` bloğundan önce):

```css
.order-field--checkbox {
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
}

.order-field--checkbox input[type="checkbox"] {
  flex: none;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--terracotta, #c1613c);
}

.order-field--checkbox span {
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted, #6b5a4c);
}

.order-field--checkbox a {
  color: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: var(--line-strong, #ddcdb8);
}
.order-field--checkbox a:hover { text-decoration-color: currentColor; }
```

- [ ] **Step 5: Build ile doğrula**

Run: `cd "/Users/mehmetergun/Desktop/AtölyeKart" && npm run build`
Expected: Hatasız tamamlanır.

- [ ] **Step 6: Dev server'da elle doğrula**

Run: `cd "/Users/mehmetergun/Desktop/AtölyeKart" && npm run dev` (arka planda bırak)

Tarayıcıda:
- Stokta olan bir üründe "Sipariş Ver" butonuna tıkla, formu aç.
- Ad ve telefon alanlarını doldur, checkbox'ı **işaretlemeden** "Siparişi Gönder" butonuna bas.
- Checkbox'ın altında `"Devam etmek için aydınlatma metnini okuyup onaylamalısınız."` hatasının göründüğünü ve formun gönderilmediğini doğrula.
- Checkbox'ı işaretle, tekrar gönder — hatanın kaybolduğunu doğrula.
- "Aydınlatma Metni" linkine tıkla, yeni sekmede `/gizlilik-politikasi.html`'in açıldığını doğrula.

Dev server'ı durdur.

- [ ] **Step 7: Commit**

```bash
cd "/Users/mehmetergun/Desktop/AtölyeKart"
git add src/components/OrderModal.jsx src/components/OrderModal.css
git commit -m "$(cat <<'EOF'
Sipariş formuna KVKK onay kutusu ekle

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Doğrulama Özeti (Spec Karşılaştırması)

- Aydınlatma metninin tam ve değiştirilmemiş içeriği (Bölüm 1-11) → Task 1 Step 1.
- Statik, bağımsız sayfa deseni (AtolyeCard.html gibi) → Task 1 Step 1 (inline style, harici bağımlılık yok).
- Üçüncü Rollup giriş noktası → Task 1 Step 2.
- Footer linki → Task 2.
- Sipariş formunda onay kutusu → Task 4.
- Stok bildirimi formunda onay kutusu → Task 3.
- Onay verilmeden gönderim engellenir, Türkçe hata mesajı → Task 3 Step 2, Task 4 Step 1 (+ elle doğrulama adımları).
- `consent`'in webhook payload'ına sızmaması → Task 3 Step 3 notu (buildPayload zaten sadece name/email destructure ediyor).
- Göreli/mutlak yol konvansiyonu (sayfa içi geri dönüş göreli, uygulamadan giden linkler mutlak) → Task 1 Step 1 yorum satırı, Global Constraints.
- Kapsam dışı maddeler (gerçek webhook sağlayıcısının belirlenmesi, VERBİS değerlendirmesi, ayrı açık rıza sayfası) hiçbir task'ta ele alınmıyor.
