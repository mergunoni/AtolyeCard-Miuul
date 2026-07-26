import { useState } from "react";

/**
 * Product image with a placeholder fallback. Presentational only — it knows
 * nothing about the product model beyond a source and its alt text.
 */
export default function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <ImagePlaceholder />;
  }

  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
}

/** Styles stay inline: index.css is off-limits and owns no placeholder class. */
function ImagePlaceholder() {
  return (
    <div style={placeholderStyle} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 34, height: 34 }}
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="9" r="1.6" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}

const placeholderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  color: "var(--terracotta)",
  opacity: 0.35,
};
