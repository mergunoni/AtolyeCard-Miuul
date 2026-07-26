/**
 * Webhook transport. One endpoint for every event; the `event` field in the
 * payload discriminates. Contract: .claude/skills/atolyecard/SKILL.md
 */

const TIMEOUT_MS = 10_000;

/** Failure reasons the UI turns into Turkish messages. */
export class WebhookError extends Error {
  constructor(code) {
    super(code);
    this.name = "WebhookError";
    this.code = code;
  }
}

/** Envelope fields shared by every event. `referrer` is omitted when empty. */
export function buildMeta() {
  const meta = {
    source: "web",
    locale: "tr-TR",
    userAgent: navigator.userAgent,
  };
  if (document.referrer) meta.referrer = document.referrer;
  return meta;
}

/**
 * POSTs a payload and resolves on 2xx. The response body is never read, so a
 * change of webhook provider needs no code change here.
 */
export async function postEvent(payload) {
  const url = import.meta.env.VITE_WEBHOOK_URL;
  if (!url) throw new WebhookError("missing_url");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new WebhookError("bad_status");
    return true;
  } catch (error) {
    if (error instanceof WebhookError) throw error;
    throw new WebhookError(error.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timeout);
  }
}
