# Yardım Merkezi Chat'i n8n'siz, Vercel-native Yapmak

**Tarih:** 2026-08-26
**Durum:** Onaylandı

## Amaç

Kataloğa daha önce eklenen "Yardım Merkezi" chat widget'ı `@n8n/chat` CDN paketi
üzerinden bir n8n workflow'una (chat trigger + AI Agent) bağlıydı. Bu workflow'un
gerçek production karşılığı yok: `index.html`'deki webhook URL şu an **geçici
olarak yerel n8n'e** (`http://localhost:5678/...`) işaret ediyor ve daha önce
kullanılan cloud n8n workspace'i (`mehmetergun.app.n8n.cloud`) artık mevcut değil
("No workspace here"). Bu spec, chat özelliğini n8n'e hiç bağımlı olmayan,
tamamen bu Vercel projesinin içinde yaşayan bir uca taşıyor.

## Çıkış Noktası: proje ilk kez bir backend endpoint'i kazanıyor

AtölyeKart bugüne kadar tamamen statik bir Vite derlemesiydi (bkz. CLAUDE.md,
"Veri: Yok"). Bu değişiklik `api/chat.js` ile projeye ilk **Vercel Function**'ı
ekliyor. Vercel bunu framework'ten bağımsız olarak otomatik algılar; `vite.config.js`
ve statik derleme hiç değişmez, sadece `/api` klasörü Vercel'in fonksiyon
konvansiyonuna girer.

Sipariş (`VITE_ORDER_WEBHOOK_URL`) ve stok bildirimi (`VITE_WEBHOOK_URL`)
webhook'ları **dokunulmadan kalır** — bunlar n8n'in ayrı, çalışan workflow'larına
(Sipariş Ver, stok bildirimi) gitmeye devam ediyor. Bu spec yalnızca yardım
merkezi sohbetini ilgilendiriyor.

## Kapsam Netleştirmesi (kullanıcı onayı)

- LLM çağrısı **Vercel AI Gateway** üzerinden yapılır (OIDC ile prod'da otomatik
  auth; yerelde `vercel dev` için `AI_GATEWAY_API_KEY`).
- Model: hızlı/ucuz bir "mini" katman (ör. `openai/gpt-5-mini`) — implementasyon
  sırasında `curl https://ai-gateway.vercel.sh/v1/models` ile güncel model
  kimliği teyit edilecek, spec bunu sabitlemiyor.
- Yanıtlar **streaming** (kelime kelime) gelir.
- Sohbet **KVKK onay kutusu** ile kapılanır — sipariş/stok formlarındaki desenin
  aynısı: `src/lib/consent.js`'teki `CONSENT_ERROR` ve `PRIVACY_NOTICE_URL`
  yeniden kullanılır, onay yalnızca istemcide tutulur, sunucuya gitmez.
- Konuşma geçmişi yalnızca istemci belleğinde (React state) tutulur; sunucu
  oturum saklamaz — mevcut webhook'ların stateless felsefesiyle tutarlı.
- Yerel n8n workflow'u ("My workflow", OpenRouter'a bağlı AI Agent + temizleme
  Code node'u) **silinmiyor**, sadece bu özellik için kullanılmıyor.

## Mimari

### 1. `api/chat.js` — yeni Vercel Function

```js
import { streamText, convertToModelMessages } from 'ai';

export const config = { runtime: 'nodejs' };

const SYSTEM_PROMPT = `Sen AtölyeKart adlı el yapımı seramik, mum ve takı
atölyesinin yardım merkezi asistanısın. Her zaman Türkçe, kısa ve samimi yanıt
ver. Yalnızca son cevabını yaz; düşünme sürecini veya iç muhakemeni gösterme.`;

export default async function handler(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: 'openai/gpt-5-mini', // implementasyonda güncel id ile teyit edilecek
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

Gerçek kod, implementasyon sırasında `node_modules/ai/docs/` içindeki güncel
Vercel Functions + AI SDK entegrasyon örneğine göre teyit edilip yazılacak
(fonksiyon imzası, `runtime` ayarı, `toUIMessageStreamResponse` gibi API'ler AI
SDK sürümüne göre değişebilir — bu blok bir taslak, birebir kopyalanacak kod
değil).

Hata durumları (Gateway kotası, model hatası vb.) AI SDK'nın kendi hata
formatında istemciye döner; istemci tarafında Türkçe'ye çevrilir (bkz. §2).

### 2. `src/components/HelpCenterChat.jsx` + `.css` — yeni bileşen

- `@ai-sdk/react`'ın `useChat` hook'u ile `/api/chat`'e bağlanır.
- Kapalı durumda sağ altta yuvarlak bir buton (mevcut n8n widget'ının
  konumuyla aynı); tıklanınca koyu başlıklı "Yardım Merkezi" penceresi açılır.
- Görsel dil `src/index.css` token'larından: başlık şeridi `var(--azure-deep)`
  gradyanı, gövde `var(--card-bg)`, kullanıcı balonu `var(--azure)`, asistan
  balonu `var(--silver-light)`, metin `var(--ink)`/`var(--muted)`.
- **KVKK kapısı**: pencere ilk açıldığında, herhangi bir mesaj alanı yerine
  `consent.js`'teki linkle bir onay kutusu gösterilir. Kutu işaretlenmeden
  mesaj input'u görünmez/devre dışıdır. İşaretlenince sohbet alanı açılır —
  onay durumu yalnızca component state'inde tutulur, sayfa yenilenince sıfırlanır
  (diğer formlarla ve `AtolyeCard.html`'deki KVKK deseniyle tutarlı: onay hiçbir
  yerde kalıcı saklanmaz).
- Hata durumları (`useChat`'in `error` state'i) Türkçe mesaja çevrilir; aynı
  tondaki metinler `useWebhookForm.js`'teki `DEFAULT_ERROR_MESSAGES`'tan esinlenir
  ama kendi küçük bir sabitler nesnesinde tutulur (bu bileşen webhook.js'i
  kullanmıyor, farklı bir transport).
- `App.jsx`'e `<HelpCenterChat />` olarak eklenir (sabit konumlu, sayfa akışının
  dışında — `PageQrCode` gibi bağımsız bir kardeş bileşen).

### 3. `index.html` — n8n widget'ının kaldırılması

Şu an `<head>`'deki `@n8n/chat` stylesheet linki ve `<body>` sonundaki
`createChat(...)` script bloğu (satır 7, 13–34) tamamen silinir. Sayfa yalnızca
`<div id="root">` ve `main.jsx` script'ini içerir hale döner.

### 4. `package.json` — yeni bağımlılıklar

`ai` (zaten yüklendi, dokümantasyon incelemesi için) ve `@ai-sdk/react`
`dependencies`'e eklenir. Devtools/ekstra provider paketi eklenmez.

### 5. `.env.example` / `.env.local` — yeni değişken

```
# Yardım merkezi chat'i i̇çin, yalnızca yerel `vercel dev` testinde gerekir.
# Prod'da Vercel OIDC otomatik kimlik doğrular.
AI_GATEWAY_API_KEY=your_api_key_here
```

### 6. `CLAUDE.md` — geliştirme komutu notu

"Bilinen Durum / Açık Noktalar" ve "Geliştirme Komutları" bölümlerine tek
cümlelik not: `npm run dev` (salt Vite) artık `/api/chat`'i çalıştırmaz;
yardım merkezini yerelde test etmek için `vercel dev` kullanılmalı.

## Erişilebilirlik

- Chat penceresi `role="dialog"` `aria-modal="false"` (sayfayı bloklamıyor,
  `FormModal.jsx`'teki gibi tam ekran kilitleme değil).
- Onay kutusu `OrderModal.jsx`'teki `order-field--checkbox` deseniyle aynı:
  `<label>` içine sarılı checkbox, hata `role="alert"`, `aria-invalid` +
  `aria-describedby`.
- Streaming mesajlar `aria-live="polite"` bir bölgeye yazılır ki ekran okuyucu
  her token'da değil, mesaj tamamlandığında (veya makul aralıklarla) okusun.
- Kapatma butonu `aria-label="Kapat"`; `Escape` tuşu pencereyi kapatır
  (`FormModal.jsx`'teki davranışla tutarlı).

## Doğrulama

Repoda otomatik test altyapısı yok, elle doğrulanır:

1. `vercel dev` ile yerelde çalıştır; katalog sayfası açılır, sağ altta yardım
   merkezi butonu görünür.
2. Butona tıkla → KVKK onay kutusu görünür, mesaj alanı yok/devre dışı.
3. Kutuyu işaretlemeden mesaj göndermeye çalış → engellenir, hata görünür.
4. Kutuyu işaretle → sohbet alanı açılır; bir soru yaz (ör. "Kargo süreniz ne
   kadar?") → yanıt kelime kelime akarak gelir, Türkçe ve temiz (muhakeme
   sızıntısı yok).
5. İkinci bir soru sor (ör. "Peki iade?") → önceki bağlamı hatırladığını
   doğrula (multi-turn, istemci tarafı geçmiş).
6. Sayfayı yenile → onay ve geçmiş sıfırlanır, buton yeniden kapalı state'te.
7. `npm run build` hâlâ hatasız geçer (statik derleme etkilenmemeli);
   `vercel deploy` (preview) ile gerçek Vercel ortamında da test edilir.
8. `index.html`'de n8n script/stylesheet referansı kalmadığını doğrula.

## Kapsam Dışı

- Sipariş ve stok bildirimi webhook akışları — değişmiyor.
- Yerel/cloud n8n workflow'larının silinmesi — sadece bağlantı kesiliyor,
  workflow'lar yerinde kalıyor.
- Sohbet geçmişinin sunucuda/veritabanında saklanması — bilinçli olarak yok,
  stateless kalıyor.
- Farklı bir dil desteği (yalnızca Türkçe UI ve sistem promptu).
- Chat widget'ının `AtolyeCard.html`'e eklenmesi — kartvizit hâlâ hiçbir
  webhook/API çağrısı yapmama kuralını koruyor (CLAUDE.md).
