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

/** Shared POST/timeout/error handling for every transport below. */
async function postRequest(url, init) {
  if (!url) throw new WebhookError("missing_url");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new WebhookError("bad_status");
    return true;
  } catch (error) {
    if (error instanceof WebhookError) throw error;
    throw new WebhookError(error.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * POSTs a JSON payload and resolves on 2xx. The response body is never read,
 * so a change of webhook provider needs no code change here.
 *
 * @param url  Target endpoint. Defaults to VITE_WEBHOOK_URL; order_request
 *             passes VITE_ORDER_WEBHOOK_URL explicitly since it POSTs to a
 *             dedicated workflow with its own payload shape.
 */
export async function postEvent(payload, url = import.meta.env.VITE_WEBHOOK_URL) {
  return postRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * POSTs flat fields as multipart/form-data — required by n8n Form Trigger
 * endpoints, which reject application/json bodies. Used by stock_alert,
 * whose n8n workflow is a Form Trigger (VITE_WEBHOOK_URL).
 */
export async function postForm(fields, url = import.meta.env.VITE_WEBHOOK_URL) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.append(key, value);
  return postRequest(url, { method: "POST", body: formData });
}
