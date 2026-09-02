import { useCallback, useEffect, useRef, useState } from "react";
import { postEvent, WebhookError } from "./webhook.js";

/**
 * Submit lifecycle shared by every webhook-backed form: idle → sending →
 * success | error. Extracted so a second form does not re-derive the retry
 * rules, the abort handling or the Turkish phrasing of transport failures.
 */

/** Every failure the transport can report, phrased for a shopper. */
export const DEFAULT_ERROR_MESSAGES = {
  missing_url:
    "Servis henüz yapılandırılmamış. Lütfen atölyeyle doğrudan iletişime geçin.",
  network:
    "İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edip tekrar deneyin.",
  timeout:
    "Sunucu zamanında yanıt vermedi. Lütfen birkaç saniye sonra tekrar deneyin.",
  bad_status: "İsteğiniz şu anda alınamadı. Lütfen birazdan tekrar deneyin.",
};

/**
 * @param buildPayload  (values) => webhook payload. Called only after validate.
 * @param validate      (values) => { field: "Türkçe hata" }. Empty means valid.
 * @param onSuccess     Fired once, after a 2xx. Side effects belong here.
 * @param messages      Per-flow overrides for DEFAULT_ERROR_MESSAGES.
 * @param transport     (payload) => Promise<boolean>. Defaults to the JSON
 *                      postEvent; pass postForm for a multipart endpoint.
 */
export function useWebhookForm({
  initialValues,
  validate,
  buildPayload,
  onSuccess,
  messages,
  transport = postEvent,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState("");

  /* A resolved request must not setState after the form has unmounted. */
  const aliveRef = useRef(true);
  useEffect(() => () => { aliveRef.current = false; }, []);

  const handleChange = useCallback(
    (field) => (event) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    []
  );

  const handleCheckboxChange = useCallback(
    (field) => (event) => {
      const { checked } = event.target;
      setValues((current) => ({ ...current, [field]: checked }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const found = validate(values);
      if (Object.keys(found).length > 0) {
        setErrors(found);
        return;
      }

      setStatus("sending");
      setErrorMessage("");

      try {
        await transport(buildPayload(values));
        if (!aliveRef.current) return;
        setStatus("success");
        onSuccess?.(values);
      } catch (error) {
        if (!aliveRef.current) return;
        const code = error instanceof WebhookError ? error.code : "network";
        const table = { ...DEFAULT_ERROR_MESSAGES, ...messages };
        setErrorMessage(table[code] ?? table.network);
        setStatus("error");
      }
    },
    [values, validate, buildPayload, onSuccess, messages, transport]
  );

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
}
