import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * QR code for the page's own URL. Read after mount so the component stays
 * safe if this ever renders on a server.
 */
export default function PageQrCode() {
  const [url, setUrl] = useState("");

  useEffect(() => setUrl(window.location.href), []);

  if (!url) return null;

  return (
    <aside className="page__qr">
      <QRCodeSVG
        value={url}
        size={64}
        level="M"
        bgColor="transparent"
        fgColor="#3a2e26"
        title={`Bu sayfanın adresi: ${url}`}
      />
      <span>Telefonda aç</span>
    </aside>
  );
}
