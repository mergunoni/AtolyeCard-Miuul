# AtölyeKart Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mevcut statik AtölyeKart sitesini (Vite+React katalog + `AtolyeCard.html`) Vercel'de canlıya al; `Versiyon2` branch'ine her push otomatik production deploy tetiklesin.

**Architecture:** Kod veya build konfigürasyonu değişmiyor. Vercel, `vite.config.js`'teki mevcut iki girişli (`index.html`, `AtolyeCard.html`) Vite build'ini framework auto-detect ile derleyip statik olarak servis edecek. Tek değişiklik: proje Vercel'e bağlanıyor, GitHub reposuna otomatik deploy için bağlanıyor, ve `VITE_WEBHOOK_URL` ortam değişkeni Vercel tarafında tanımlanıyor.

**Tech Stack:** Vercel CLI 58.x (kurulu, `mergunoni` olarak authenticate edilmiş), Vite 8 static build, GitHub (`mergunoni/AtolyeCard-Miuul`).

## Global Constraints

- Uygulama kodunda (src/, index.html, AtolyeCard.html, vite.config.js) hiçbir değişiklik yapılmaz — spec'in kapsamı bu.
- Production branch: `Versiyon2` (main değil — main neredeyse boş).
- `VITE_WEBHOOK_URL` gerçek değeri henüz yok; placeholder (`https://example.com/webhook/atolyekart`, `.env.example`'daki ile aynı) Production+Preview scope'a eklenir.
- `vercel.json` veya rewrite kuralı eklenmez — framework auto-detect yeterli.
- `main` branch'ine dokunulmaz.
- `.vercel/` klasörü asla commit edilmez (proje/org ID'leri içerir).

---

### Task 1: Vercel Projesini Oluştur, GitHub'a Bağla, Production Branch'i Ayarla

**Files:**
- Modify (yalnızca gerekirse): `.gitignore` — `.vercel` girişini ekle
- Oluşacak (git'e girmez): `.vercel/project.json`

**Interfaces:**
- Üretir: Vercel'de bir proje, GitHub reposuna (`mergunoni/AtolyeCard-Miuul`) bağlı Git entegrasyonu, production branch = `Versiyon2`. Task 2 ve 3 bu projenin var olduğunu ve linkli olduğunu varsayar.

- [ ] **Step 1: Doğru dizinde ve doğru hesapta olduğunu doğrula**

Run: `cd "/Users/mehmetergun/Desktop/AtölyeKart" && vercel whoami`
Expected: `mergunoni` yazdırır (kişisel hesap, team seçimi gerekmiyor — `vercel teams ls` boş döndü).

- [ ] **Step 2: Projeyi oluştur ve linkle**

Run: `vercel link --yes`
Expected: Çıktıda `Linked to <scope>/<project-name>` satırı; `.vercel/project.json` dosyası oluşur. Proje adı dizin adından türetilir (örn. `atolyekart`).

- [ ] **Step 3: `.vercel/` klasörünün git tarafından takip edilmediğini doğrula**

Run: `git status --short`
Expected: `.vercel/` çıktıda görünmemeli. Eğer görünüyorsa `.gitignore`'a `.vercel` satırı ekle (dosyanın sonuna, `# Editor / OS` bloğundan önce fark etmez, tek satır yeterli) ve tekrar `git status --short` çalıştırıp temiz olduğunu doğrula.

- [ ] **Step 4: GitHub reposuna bağla**

Run: `vercel git connect`
Expected: CLI, `origin` remote'unu (`https://github.com/mergunoni/AtolyeCard-Miuul.git`) otomatik algılar ve bağlantıyı onaylamanı ister; onayla. Çıktı: `Connected GitHub repository mergunoni/AtolyeCard-Miuul!` benzeri bir satır.

Eğer remote otomatik algılanmazsa: `vercel git connect https://github.com/mergunoni/AtolyeCard-Miuul.git`

- [ ] **Step 5: Production branch'i `Versiyon2` yap (Dashboard — CLI'da bu ayar için komut yok)**

Vercel CLI'da `vercel project update` yalnızca build/dev/install command ve output directory ayarlarını destekliyor; production branch ayarı yalnızca Dashboard'da var.

1. `vercel open` çalıştır (veya çıktıdaki proje URL'ini tarayıcıda aç).
2. Project → **Settings → Git** sekmesine git.
3. **Production Branch** alanını `main`'den `Versiyon2`'ye değiştir, kaydet.

Expected: Settings → Git sayfasında Production Branch olarak `Versiyon2` görünüyor.

- [ ] **Step 6: Doğrula**

Run: `vercel project inspect --json | grep -i "link\|productionBranch" || vercel project ls`
Expected: Proje listede görünür; bağlı repo `mergunoni/AtolyeCard-Miuul` olarak Dashboard'da teyit edilmiş olmalı (Step 5'te zaten gözle doğrulandı).

- [ ] **Step 7: Commit (yalnızca `.gitignore` değiştiyse)**

Step 3'te `.gitignore`'a satır eklediysen:

```bash
git add .gitignore
git commit -m "$(cat <<'EOF'
.vercel klasörünü git'e ekleme

vercel link ile oluşan proje/org ID'lerini içeren .vercel/ klasörü
yerel kalmalı, repoya girmemeli.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

Değişmediyse bu adımı atla.

---

### Task 2: `VITE_WEBHOOK_URL` Ortam Değişkenini Ekle

**Files:** Yok (Vercel proje ayarı, repo dosyası değişmiyor)

**Interfaces:**
- Tüketir: Task 1'de oluşturulan linkli proje (`.vercel/project.json`).
- Üretir: Vercel Production + Preview environment'larında `VITE_WEBHOOK_URL` değişkeni. Task 3'teki build bu değişkeni kullanır (`.env.example`'daki placeholder değerle aynı: `https://example.com/webhook/atolyekart`).

- [ ] **Step 1: Production scope'a ekle**

Run: `echo "https://example.com/webhook/atolyekart" | vercel env add VITE_WEBHOOK_URL production`
Expected: `Added Environment Variable VITE_WEBHOOK_URL to Project ... [production]`

- [ ] **Step 2: Preview scope'a ekle**

Run: `echo "https://example.com/webhook/atolyekart" | vercel env add VITE_WEBHOOK_URL preview`
Expected: `Added Environment Variable VITE_WEBHOOK_URL to Project ... [preview]`

- [ ] **Step 3: Doğrula**

Run: `vercel env ls`
Expected: Listede `VITE_WEBHOOK_URL` iki satır olarak görünür — `Production` ve `Preview` scope'larıyla.

---

### Task 3: İlk Production Deploy'u Tetikle ve Canlı Ortamı Doğrula

**Files:** Yok

**Interfaces:**
- Tüketir: Task 1 (linkli proje, `Versiyon2` production branch) ve Task 2 (env var).
- Üretir: Canlı bir production URL; katalog ve kartvizit sayfalarının erişilebilir olduğu doğrulanmış olur.

- [ ] **Step 1: Production deploy'u tetikle**

Run: `URL=$(vercel --prod --yes) && echo "$URL"`
Expected: Build başarıyla tamamlanır (Vite framework otomatik algılanır, `npm run build` çalışır, `dist/` çıktısı yüklenir), stdout bir `https://....vercel.app` URL'i basar.

- [ ] **Step 2: Katalog sayfasının açıldığını doğrula**

Run: `curl -s -o /dev/null -w "%{http_code}\n" "$URL/"`
Expected: `200`

- [ ] **Step 3: Katalog içeriğinin doğru render edildiğini doğrula**

Run: `curl -s "$URL/" | grep -o "<title>[^<]*</title>"`
Expected: `index.html`'deki `<title>` içeriğiyle eşleşen bir satır döner (React SPA olduğu için gövde JS ile dolacak, ama HTML kabuğu ve title statik olarak gelmeli).

- [ ] **Step 4: Kartvizit sayfasının açıldığını doğrula**

Run: `curl -s -o /dev/null -w "%{http_code}\n" "$URL/AtolyeCard.html"`
Expected: `200`

- [ ] **Step 5: Kartvizit içeriğinin doğru geldiğini doğrula**

Run: `curl -s "$URL/AtolyeCard.html" | grep -o "Rehbere Kaydet"`
Expected: `Rehbere Kaydet` metni bulunur (buton HTML'de statik olarak var, JS'e bağlı değil).

- [ ] **Step 6: Sayfalar arası göreli linklerin doğru olduğunu doğrula**

Run: `curl -s "$URL/AtolyeCard.html" | grep -o 'href="\./index\.html"'`
Expected: `href="./index.html"` bulunur (kartvizitten kataloğa dönüş linki).

- [ ] **Step 7: Beklenen webhook hatası davranışını tarayıcıda gözle doğrula**

Bu adım otomatik değil — kullanıcıya bırak. `$URL` adresini tarayıcıda aç, bir ürüne "Sipariş Ver" bas, formu gönder: placeholder webhook URL'i gerçek olmadığı için Türkçe hata mesajı gösterip formu açık tutması *beklenen* davranış (spec'te belirtilen bilinen kısıt). Bu, gerçek webhook eklenene kadar düzeltilecek bir hata değildir.

- [ ] **Step 8: Sonucu özetle**

Kullanıcıya production URL'ini ve "Versiyon2'ye her push'un artık otomatik yeni deploy tetikleyeceğini" bildir. Ek commit gerekmiyor — bu task'ta repo'ya yazılan bir şey yok.

---

## Doğrulama Özeti (Spec Karşılaştırması)

- Production branch `Versiyon2` → Task 1 Step 5.
- `vercel.json` yok, framework auto-detect → Task 3 Step 1'in başarılı build'i bunu doğrular; ekstra dosya oluşturulmadı.
- `VITE_WEBHOOK_URL` placeholder, Production+Preview → Task 2.
- GitHub bağlantısı + otomatik deploy → Task 1 Step 4.
- Katalog + kartvizit erişilebilirliği, aralarındaki linkler, vCard butonu → Task 3 Step 2–6.
- Webhook hatasının beklenen davranış olduğunun teyidi → Task 3 Step 7.
- Kapsam dışı maddelere (main branch, domain, gerçek webhook, Next.js vizyonu) hiçbir task dokunmuyor.
