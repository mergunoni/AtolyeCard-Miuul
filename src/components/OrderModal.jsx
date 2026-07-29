import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buildMeta, postEvent, WebhookError } from "../lib/webhook.js";
import { formatPrice } from "../lib/format.js";
import { CONSENT_ERROR, PRIVACY_NOTICE_URL } from "../lib/consent.js";
import "./OrderModal.css";

const CLOSE_DELAY_MS = 3000;

/** Every failure the transport can report, phrased for a shopper. */
const ERROR_MESSAGES = {
  missing_url:
    "Sipariş servisi henüz yapılandırılmamış. Lütfen atölyeyle doğrudan iletişime geçin.",
  network:
    "İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edip tekrar deneyin.",
  timeout:
    "Sunucu zamanında yanıt vermedi. Lütfen birkaç saniye sonra tekrar deneyin.",
  bad_status:
    "Siparişiniz şu anda alınamadı. Lütfen birazdan tekrar deneyin.",
};

/** Turkish numbers are 10 digits after the country code. Returns E.164 or null. */
function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+90${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+90${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("90")) return `+${digits}`;
  return null;
}

function validate({ name, phone, consent }) {
  const errors = {};
  const trimmedName = name.trim();

  if (!trimmedName) errors.name = "Adınızı ve soyadınızı yazın.";
  else if (trimmedName.length < 2) errors.name = "Ad en az 2 karakter olmalı.";
  else if (trimmedName.length > 80) errors.name = "Ad en fazla 80 karakter olabilir.";

  if (!phone.trim()) errors.phone = "Telefon numaranızı yazın.";
  else if (!normalizePhone(phone))
    errors.phone = "Numarayı 10 haneli girin, örneğin 555 123 45 67.";

  if (!consent) errors.consent = CONSENT_ERROR;

  return errors;
}

export default function OrderModal({ product, onClose }) {
  const [values, setValues] = useState({ name: "", phone: "", consent: false });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const firstFieldRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  /** The auto-close timer must not fire after the modal is gone. */
  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleConsentChange = (event) => {
    setValues((current) => ({ ...current, consent: event.target.checked }));
    setErrors((current) => ({ ...current, consent: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      await postEvent({
        event: "order_request",
        sentAt: new Date().toISOString(),
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          currency: product.currency,
        },
        // consent is a client-side gate only — never goes on the wire
        order: {
          name: values.name.trim(),
          phone: normalizePhone(values.phone),
        },
        meta: buildMeta(),
      });

      setStatus("success");
      closeTimerRef.current = setTimeout(onClose, CLOSE_DELAY_MS);
    } catch (error) {
      const code = error instanceof WebhookError ? error.code : "network";
      setErrorMessage(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.network);
      setStatus("error");
    }
  };

  const sending = status === "sending";

  /* Portalled to <body>: .card applies a transform on hover, which would make
     it the containing block for position:fixed, and its overflow:hidden would
     clip the dialog. */
  return createPortal(
    <div
      className="order-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <button
          type="button"
          className="order-modal__close"
          onClick={onClose}
          aria-label="Kapat"
        >
          ×
        </button>

        {status === "success" ? (
          <div className="order-modal__done" role="status">
            <span className="order-modal__tick" aria-hidden="true">
              ✓
            </span>
            <h2 id="order-modal-title">Siparişiniz alındı</h2>
            <p>
              {product.name} için talebiniz bize ulaştı. En kısa sürede
              telefonla size dönüş yapacağız.
            </p>
          </div>
        ) : (
          <>
            <h2 id="order-modal-title" className="order-modal__title">
              Sipariş Ver
            </h2>
            <p className="order-modal__lead">
              Adınızı ve telefonunuzu bırakın, siparişi birlikte netleştirelim.
            </p>

            <form className="order-modal__form" onSubmit={handleSubmit} noValidate>
              <label className="order-field">
                <span className="order-field__label">Ürün</span>
                <input
                  type="text"
                  className="order-field__input order-field__input--locked"
                  value={`${product.name} · ${formatPrice(product.price, product.currency)}`}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                />
              </label>

              <label className="order-field">
                <span className="order-field__label">Ad Soyad</span>
                <input
                  ref={firstFieldRef}
                  type="text"
                  className="order-field__input"
                  value={values.name}
                  onChange={handleChange("name")}
                  placeholder="Ayşe Demir"
                  autoComplete="name"
                  disabled={sending}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <span className="order-field__error">{errors.name}</span>
                )}
              </label>

              <label className="order-field">
                <span className="order-field__label">Telefon</span>
                <input
                  type="tel"
                  className="order-field__input"
                  value={values.phone}
                  onChange={handleChange("phone")}
                  placeholder="555 123 45 67"
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={sending}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && (
                  <span className="order-field__error">{errors.phone}</span>
                )}
              </label>

              <label className="order-field order-field--checkbox">
                <input
                  type="checkbox"
                  checked={values.consent}
                  onChange={handleConsentChange}
                  disabled={sending}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? "order-consent-error" : undefined}
                />
                <span>
                  <a href={PRIVACY_NOTICE_URL} target="_blank" rel="noopener">
                    Aydınlatma Metni
                  </a>
                  'ni okudum, kişisel verilerimin bu kapsamda işlenmesini
                  kabul ediyorum.
                </span>
              </label>
              {errors.consent && (
                <span className="order-field__error" id="order-consent-error">
                  {errors.consent}
                </span>
              )}

              {status === "error" && (
                <p className="order-modal__alert" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="order-modal__submit"
                disabled={sending}
              >
                {sending ? "Gönderiliyor…" : "Siparişi Gönder"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
