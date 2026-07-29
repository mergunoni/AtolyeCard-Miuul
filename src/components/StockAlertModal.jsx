import { useCallback, useEffect, useRef } from "react";
import FormModal from "./FormModal.jsx";
import { buildMeta } from "../lib/webhook.js";
import { useWebhookForm } from "../lib/useWebhookForm.js";
import { formatPrice } from "../lib/format.js";
import { CONSENT_ERROR, PRIVACY_NOTICE_URL } from "../lib/consent.js";

const CLOSE_DELAY_MS = 3000;

/** Flow-specific wording; transport codes fall back to the shared table. */
const ERROR_MESSAGES = {
  missing_url:
    "Bildirim servisi henüz yapılandırılmamış. Lütfen atölyeyle doğrudan iletişime geçin.",
  bad_status:
    "Bildirim talebiniz şu anda alınamadı. Lütfen birazdan tekrar deneyin.",
};

/** Pragmatic check — the address is confirmed by the mail that follows. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  if (!consent) errors.consent = CONSENT_ERROR;

  return errors;
}

/**
 * Restock notification signup for a sold-out product. Shares the modal shell
 * and submit lifecycle with the order flow; only fields, payload and copy
 * differ.
 */
export default function StockAlertModal({ product, onSaved, onClose }) {
  const firstFieldRef = useRef(null);
  const closeTimerRef = useRef(null);

  /** The auto-close timer must not fire after the modal is gone. */
  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const buildPayload = useCallback(
    // consent is a client-side gate only — never goes on the wire
    ({ name, email }) => ({
      event: "stock_alert",
      sentAt: new Date().toISOString(),
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
      },
      alert: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
      meta: buildMeta(),
    }),
    [product]
  );

  const handleSuccess = useCallback(() => {
    onSaved?.(product);
    closeTimerRef.current = setTimeout(onClose, CLOSE_DELAY_MS);
  }, [onSaved, onClose, product]);

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

  return (
    <FormModal
      labelledBy="stock-alert-title"
      initialFocusRef={firstFieldRef}
      onClose={onClose}
    >
      {status === "success" ? (
        <div className="fmodal__done" role="status">
          <span className="fmodal__tick" aria-hidden="true">
            ✓
          </span>
          <h2 id="stock-alert-title">Bildirim kaydedildi</h2>
          <p>
            {product.name} yeniden stoğa girdiğinde ilk siz haberdar
            olacaksınız.
          </p>
        </div>
      ) : (
        <>
          <h2 id="stock-alert-title" className="fmodal__title">
            Stok Bildirimi İste
          </h2>
          <p className="fmodal__lead">
            Adınızı ve e-postanızı bırakın, ürün geri geldiğinde size yazalım.
          </p>

          <form className="fmodal__form" onSubmit={handleSubmit} noValidate>
            <label className="fmodal-field">
              <span className="fmodal-field__label">Ürün</span>
              <input
                type="text"
                className="fmodal-field__input fmodal-field__input--locked"
                value={`${product.name} · ${formatPrice(product.price, product.currency)}`}
                readOnly
                aria-readonly="true"
                tabIndex={-1}
              />
            </label>

            <label className="fmodal-field">
              <span className="fmodal-field__label">Ad Soyad</span>
              <input
                ref={firstFieldRef}
                type="text"
                className="fmodal-field__input"
                value={values.name}
                onChange={handleChange("name")}
                placeholder="Ayşe Demir"
                autoComplete="name"
                disabled={sending}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <span className="fmodal-field__error">{errors.name}</span>
              )}
            </label>

            <label className="fmodal-field">
              <span className="fmodal-field__label">E-posta</span>
              <input
                type="email"
                className="fmodal-field__input"
                value={values.email}
                onChange={handleChange("email")}
                placeholder="ayse@ornek.com"
                autoComplete="email"
                inputMode="email"
                disabled={sending}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <span className="fmodal-field__error">{errors.email}</span>
              )}
            </label>

            <label className="fmodal-field fmodal-field--checkbox">
              <input
                type="checkbox"
                checked={values.consent}
                onChange={handleCheckboxChange("consent")}
                disabled={sending}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "stock-consent-error" : undefined}
              />
              <span>
                <a href={PRIVACY_NOTICE_URL} target="_blank" rel="noopener">
                  Aydınlatma Metni
                </a>
                'ni okudum, kişisel verilerimin bu kapsamda işlenmesini kabul
                ediyorum.
              </span>
            </label>
            {errors.consent && (
              <span className="fmodal-field__error" id="stock-consent-error">
                {errors.consent}
              </span>
            )}

            {status === "error" && (
              <p className="fmodal__alert" role="alert">
                {errorMessage}
              </p>
            )}

            <button type="submit" className="fmodal__submit" disabled={sending}>
              {sending ? "Gönderiliyor…" : "Bildirim İste"}
            </button>
          </form>
        </>
      )}
    </FormModal>
  );
}
