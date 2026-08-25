# Yardım Merkezi Chat — n8n'siz Vercel-native Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "Yardım Merkezi" chat widget'ını n8n'e bağımlı olmaktan çıkarıp, tamamen bu Vercel projesinin içinde yaşayan bir Vercel Function + özel React bileşeni ile çalışır hale getirmek.

**Architecture:** Yeni bir Vercel Function (`api/chat.js`) AI SDK'nın `streamText`'i ile Vercel AI Gateway üzerinden bir modeli çağırıp yanıtı stream eder. Yeni bir React bileşeni (`HelpCenterChat.jsx`) `@ai-sdk/react`'ın `useChat` hook'uyla bu uca bağlanır, KVKK onay kutusuyla kapılanır ve mevcut n8n `@n8n/chat` widget'ının yerini alır.

**Tech Stack:** `ai` (7.0.79) + `@ai-sdk/react` (4.0.82), Vercel AI Gateway, Vercel Functions (Node.js runtime, zero-config), React 19, Vite 8.

**Spec:** `docs/superpowers/specs/2026-08-26-vercel-help-center-chat-design.md`

## Global Constraints

- Kullanıcıya görünen tüm metinler Türkçe; kod/değişken/fonksiyon isimleri İngilizce (CLAUDE.md).
- KVKK onayı yalnızca istemci state'inde tutulur, hiçbir zaman sunucuya/ağa gönderilmez.
- Sohbet geçmişi sunucuda saklanmaz — her istek stateless, geçmiş yalnızca `useChat`'in istemci belleğinde.
- Sipariş (`VITE_ORDER_WEBHOOK_URL`) ve stok bildirimi (`VITE_WEBHOOK_URL`) webhook akışları bu plan kapsamında **değişmez**.
- Model: `openai/gpt-5-mini` (hızlı/ucuz katman), Vercel AI Gateway üzerinden. `instructions` parametresi kullanılır — `system` bu AI SDK sürümünde **deprecated**.
- Yanıtlar streaming (`toUIMessageStreamResponse()`).
- Repoda otomatik test altyapısı yok (`package.json`'da yalnızca `dev`/`build`/`preview`); her görev `vercel dev` + tarayıcı/`curl` ile elle doğrulanır — bu, projenin diğer spec'lerindeki ("Doğrulama" bölümleri) yerleşik deseniyle tutarlıdır.

---

### Task 1: `api/chat.js` — streaming chat endpoint

**Files:**
- Create: `api/chat.js`

**Interfaces:**
- Produces: `/api/chat` rotası, `POST` ile `{ messages: UIMessage[] }` gövdesi alır, AI SDK UI-message-stream formatında (`Content-Type: text/event-stream` benzeri) bir `Response` döner. Task 2'deki `HelpCenterChat` bu uca `DefaultChatTransport({ api: "/api/chat" })` ile bağlanacak.

- [ ] **Step 0: Bağımlılıkları doğrula**

`ai` ve `@ai-sdk/react` spec hazırlığı sırasında zaten yüklendi. Teyit et:

```bash
grep -E '"(ai|@ai-sdk/react)"' package.json
```

Beklenen: ikisi de `dependencies` altında görünür (`devDependencies` değil). Görünmüyorsa: `npm install ai @ai-sdk/react`.

- [ ] **Step 1: Güncel model id'yi teyit et**

Model isimleri zamanla değişebilir; kod yazmadan hemen önce teyit et:

```bash
curl -s https://ai-gateway.vercel.sh/v1/models | jq -r '[.data[] | select(.id == "openai/gpt-5-mini")] | length'
```

Beklenen: `1` (model hâlâ listede). `0` dönerse `curl -s https://ai-gateway.vercel.sh/v1/models | jq -r '[.data[] | select(.id | startswith("openai/gpt-5"))|.id]|reverse|.[]'` çalıştırıp yerine en yakın "mini" katman modelini seç ve Step 2'deki `model:` değerini buna göre güncelle.

- [ ] **Step 2: Dosyayı yaz**

```js
import { streamText, convertToModelMessages } from "ai";

const SYSTEM_PROMPT =
  "Sen AtölyeKart adlı el yapımı seramik, mum ve takı atölyesinin yardım " +
  "merkezi asistanısın. Her zaman Türkçe, kısa ve samimi yanıt ver. " +
  "Yalnızca son cevabını yaz; düşünme sürecini, analiz adımlarını veya iç " +
  "muhakemeni asla gösterme.";

export default async function handler(request) {
  const { messages } = await request.json();

  const result = streamText({
    model: "openai/gpt-5-mini",
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

- [ ] **Step 3: `vercel dev` ile başlat**

```bash
vercel dev
```

Terminalde verdiği portu not al (genelde `http://localhost:3000`). `Ctrl+C` ile durdurana kadar arka planda bırak.

- [ ] **Step 4: Endpoint'i curl ile test et**

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"Merhaba"}]}]}'
```

Beklenen: terminalde parça parça (streaming) JSON satırları akar, içinde Türkçe bir selamlama metni geçer. Hata (401/403) alırsan Step 5'e geç; başka bir hata alırsan `model` değerini Step 1'de teyit ettiğin id ile karşılaştır.

- [ ] **Step 5 (yalnızca 401/403 alırsan): AI Gateway API key ekle**

`.env.local` zaten bir `VERCEL_OIDC_TOKEN` içeriyor — `vercel dev` bunu kullanarak genelde ekstra key gerektirmeden AI Gateway'e kimlik doğrular. Yine de reddedilirse:

1. https://vercel.com/d/[team]/~/ai-gateway/api-keys adresinden bir key oluştur.
2. `.env.local`'e ekle: `AI_GATEWAY_API_KEY=...`
3. `vercel dev`'i yeniden başlat, Step 4'ü tekrarla.

- [ ] **Step 6: Commit**

```bash
git add api/chat.js
git commit -m "Yardım merkezi için AI Gateway'e bağlı streaming chat endpoint'i ekle"
```

---

### Task 2: `HelpCenterChat` React bileşeni

**Files:**
- Create: `src/components/HelpCenterChat.jsx`
- Create: `src/components/HelpCenterChat.css`

**Interfaces:**
- Consumes: `api/chat.js`'in `/api/chat` rotası (Task 1). `src/lib/consent.js`'ten `CONSENT_ERROR`, `PRIVACY_NOTICE_URL` (mevcut, değişmez).
- Produces: `export default function HelpCenterChat()` — prop almaz, kendi state'ini yönetir. Task 3'te `App.jsx` içine `<HelpCenterChat />` olarak eklenecek.

- [ ] **Step 1: Bileşeni yaz**

```jsx
import { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { CONSENT_ERROR, PRIVACY_NOTICE_URL } from "../lib/consent.js";
import "./HelpCenterChat.css";

const ERROR_MESSAGE =
  "Sunucuya bağlanılamadı. Lütfen birkaç saniye sonra tekrar deneyin.";

export default function HelpCenterChat() {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const sending = status === "submitted" || status === "streaming";

  /* Consistent with FormModal.jsx: Escape closes the panel. Not a full
     modal (aria-modal="false") — the page behind stays interactive. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleConsentChange = (event) => {
    setConsent(event.target.checked);
    if (event.target.checked) setConsentError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!consent) {
      setConsentError(CONSENT_ERROR);
      return;
    }
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="help-chat">
      {open && (
        <div
          className="help-chat__panel"
          role="dialog"
          aria-modal="false"
          aria-label="Yardım Merkezi"
        >
          <div className="help-chat__header">
            <div>
              <p className="help-chat__title">Yardım Merkezi</p>
              <p className="help-chat__subtitle">
                Sorularınızı yanıtlamak için buradayız.
              </p>
            </div>
            <button
              type="button"
              className="help-chat__close"
              onClick={() => setOpen(false)}
              aria-label="Kapat"
            >
              ×
            </button>
          </div>

          {!consent ? (
            <div className="help-chat__consent">
              <label className="help-chat__consent-label">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={handleConsentChange}
                  aria-invalid={Boolean(consentError)}
                  aria-describedby={
                    consentError ? "help-chat-consent-error" : undefined
                  }
                />
                <span>
                  <a href={PRIVACY_NOTICE_URL} target="_blank" rel="noopener">
                    Aydınlatma Metni
                  </a>
                  'ni okudum, kişisel verilerimin bu kapsamda işlenmesini
                  kabul ediyorum.
                </span>
              </label>
              {consentError && (
                <span
                  className="help-chat__consent-error"
                  id="help-chat-consent-error"
                  role="alert"
                >
                  {consentError}
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="help-chat__messages" aria-live="polite">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`help-chat__bubble help-chat__bubble--${message.role}`}
                  >
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <span key={index}>{part.text}</span>
                      ) : null
                    )}
                  </div>
                ))}
                {error && (
                  <p className="help-chat__error" role="alert">
                    {ERROR_MESSAGE}
                  </p>
                )}
              </div>

              <form className="help-chat__form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="help-chat__input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Sorunuzu yazın..."
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="help-chat__send"
                  disabled={sending || !input.trim()}
                  aria-label="Gönder"
                >
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        className="help-chat__toggle"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Yardım merkezini kapat" : "Yardım merkezini aç"}
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: CSS'i yaz**

```css
.help-chat {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 60;
  font-family: var(--font-sans);
}

.help-chat__toggle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--azure-deep);
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(36, 88, 118, 0.35);
}

.help-chat__panel {
  position: absolute;
  right: 0;
  bottom: 72px;
  width: 320px;
  max-height: 420px;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(37, 49, 61, 0.2);
}

.help-chat__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  padding: 16px;
  background: var(--azure-deep);
  color: #fff;
}

.help-chat__title {
  font-weight: 600;
  margin: 0;
}

.help-chat__subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  opacity: 0.85;
}

.help-chat__close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
}

.help-chat__consent {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-chat__consent-label {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.85rem;
  color: var(--muted);
}

.help-chat__consent-label a {
  color: var(--azure-dark);
}

.help-chat__consent-error {
  color: var(--gone-ink);
  font-size: 0.8rem;
}

.help-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-chat__bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-wrap;
}

.help-chat__bubble--user {
  align-self: flex-end;
  background: var(--azure);
  color: #fff;
}

.help-chat__bubble--assistant {
  align-self: flex-start;
  background: var(--silver-light);
  color: var(--ink);
}

.help-chat__error {
  color: var(--gone-ink);
  font-size: 0.8rem;
  padding: 0 4px;
}

.help-chat__form {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--line);
}

.help-chat__input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  font-size: 0.9rem;
}

.help-chat__send {
  border: none;
  border-radius: 8px;
  background: var(--azure-deep);
  color: #fff;
  padding: 0 14px;
  cursor: pointer;
}

.help-chat__send:disabled,
.help-chat__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/HelpCenterChat.jsx src/components/HelpCenterChat.css
git commit -m "Yardım merkezi için özel chat bileşenini ekle"
```

---

### Task 3: n8n widget'ını kaldır, yeni bileşeni bağla

**Files:**
- Modify: `index.html`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `HelpCenterChat` (Task 2, `src/components/HelpCenterChat.jsx`).

- [ ] **Step 1: `index.html`'den n8n script/stylesheet'ini sil**

Şu anki tam içerik:

```html
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AtölyeKart · El Yapımı Ürün Kataloğu</title>
    <link href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>

    <script type="module">
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

      createChat({
        // TEMPORARY: local n8n workflow for testing only — do not deploy to production.
        // Reachable only while n8n runs on this machine (localhost:5678).
        webhookUrl: 'http://localhost:5678/webhook/cdb35dcd-560a-40f0-9ecc-02024018b9b0/chat',
        initialMessages: [
          'Merhaba, Benim Adım Mehmet. Size nasıl yardımcı olabilirim?'
        ],
        i18n: {
          en: {
            title: 'Yardım Merkezi',
            subtitle: 'Sorularınızı yanıtlamak için buradayız.',
            footer: '',
            getStarted: 'Yeni Görüşme',
            inputPlaceholder: 'Sorunuzu yazın...',
            closeButtonTooltip: 'Kapat',
          },
        },
      });
    </script>
  </body>
</html>
```

Yeni tam içerik:

```html
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AtölyeKart · El Yapımı Ürün Kataloğu</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 2: `App.jsx`'e bileşeni ekle**

`src/App.jsx` içinde import bloğuna ekle:

```js
import HelpCenterChat from "./components/HelpCenterChat.jsx";
```

`</footer>` kapanışından hemen sonra, `{notice && (...)}` bloğundan önce ekle:

```jsx
      <HelpCenterChat />

      {notice && (
```

- [ ] **Step 3: Derlemeyi doğrula**

```bash
npm run build
```

Beklenen: hatasız biter, `dist/index.html` artık `@n8n/chat` referansı içermez.

```bash
grep -c "n8n" dist/index.html
```

Beklenen: `0`.

- [ ] **Step 4: Commit**

```bash
git add index.html src/App.jsx
git commit -m "n8n chat widget'ını kaldır, HelpCenterChat'i bağla"
```

---

### Task 4: Env değişkeni dokümantasyonu ve CLAUDE.md notu

**Files:**
- Modify: `.env.example`
- Modify: `CLAUDE.md`

- [ ] **Step 1: `.env.example`'a AI Gateway notu ekle**

Dosyanın sonuna ekle:

```
# Yardım merkezi chat'i (api/chat.js) için AI Gateway kimlik doğrulaması.
# `vercel dev` .env.local'e zaten bir VERCEL_OIDC_TOKEN yazdığı için genelde
# ayrıca gerekmez; Gateway 401/403 dönerse buraya bir key ekleyin:
# https://vercel.com/d/[team]/~/ai-gateway/api-keys
AI_GATEWAY_API_KEY=your_api_key_here
```

- [ ] **Step 2: `CLAUDE.md` — Geliştirme Komutları bölümüne not ekle**

`npm run preview` satırından sonraki açıklama bloğuna (`> Lint/test script'i yok...` satırının hemen üstüne) tek satır ekle:

```
> `npm run dev` yalnızca Vite'ı çalıştırır, `/api/chat`'i çalıştırmaz. Yardım
> merkezi chat'ini yerelde test etmek için `vercel dev` kullanın.
```

- [ ] **Step 3: `CLAUDE.md` — Bilinen Durum bölümüne madde ekle**

"Bilinen Durum / Açık Noktalar" listesinin sonuna:

```
- Yardım merkezi chat'i artık n8n'e değil, `api/chat.js` (Vercel Function,
  AI SDK + AI Gateway) üzerinden çalışıyor. n8n'deki eski "My workflow"
  (yerel) ve cloud'daki chat workflow'u artık kullanılmıyor, silinmedi.
```

- [ ] **Step 4: Commit**

```bash
git add .env.example CLAUDE.md
git commit -m "Yardım merkezi chat'inin env değişkenini ve geliştirme notunu dokümante et"
```

---

### Task 5: Uçtan uca doğrulama

**Files:** (yok — yalnızca doğrulama)

- [ ] **Step 1: `vercel dev` ile tam akışı test et**

```bash
vercel dev
```

Tarayıcıda verilen adresi aç (genelde `http://localhost:3000`).

- [ ] **Step 2: Widget'ı aç, KVKK kapısını doğrula**

Sağ alttaki butona tıkla → pencere açılır → mesaj alanı **görünmez**, yalnızca onay kutusu var. Kutuyu işaretlemeden herhangi bir şey göndermeye çalışmak mümkün değil (input yok).

- [ ] **Step 3: Onayla ve bir soru sor**

Kutuyu işaretle → mesaj alanı belirir. "Kargo süreniz ne kadar?" yaz, gönder. Beklenen: yanıt kelime kelime akarak gelir, Türkçe, düşünme süreci sızıntısı yok.

- [ ] **Step 4: Çok turlu bağlamı doğrula**

Aynı pencerede "Peki iade?" yaz. Beklenen: yanıt önceki mesajın bağlamını (kargo/teslimat konusu) dikkate alır.

- [ ] **Step 5: Sayfa yenilemesinde sıfırlanmayı doğrula**

Sayfayı yenile → widget kapalı state'te başlar, önceki onay ve mesaj geçmişi kaybolur (stateless tasarım gereği).

- [ ] **Step 6: Statik derlemeyi ve n8n referanslarının yokluğunu doğrula**

```bash
npm run build
grep -rn "n8n" index.html dist/index.html || echo "n8n referansı yok"
```

- [ ] **Step 7: Vercel preview deploy ile gerçek ortamda doğrula**

Kullanıcıdan onay alarak:

```bash
vercel deploy
```

Verilen preview URL'sinde Step 2–5'i tekrarla (bu ortamda OIDC/Gateway auth'unun prod'daki gibi çalıştığını teyit eder).

- [ ] **Step 8: Sonuçları özetle**

Bu görev bir dosya değişikliği üretmez; sonucu kullanıcıya raporla (hangi adımlar geçti, hangi sorunlarla karşılaşıldıysa nasıl çözüldü).
