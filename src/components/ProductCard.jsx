import { useState } from "react";
import ProductImage from "./ProductImage.jsx";
import OrderModal from "./OrderModal.jsx";
import StockAlertModal from "./StockAlertModal.jsx";
import { formatPrice } from "../lib/format.js";

const STOCK_LABELS = {
  in_stock: "Stokta",
  low_stock: "Son birkaç adet",
  out_of_stock: "Tükendi",
};

const SPEC_LABELS = {
  material: "Malzeme",
  dimensions: "Ölçü",
  capacity: "Hacim",
  weight: "Ağırlık",
  color: "Renk",
  pieces: "Adet",
  burnTime: "Yanma süresi",
  wick: "Fitil",
  finish: "Yüzey",
  clasp: "Kilit",
  beads: "Boncuk",
  drainage: "Drenaj",
  care: "Bakım",
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
});

/** One product from the catalog. Actions are passed in, never fired here. */
export default function ProductCard({ product, onAddToCart, onNotify }) {
  const [ordering, setOrdering] = useState(false);
  const [alerting, setAlerting] = useState(false);
  const [alertSaved, setAlertSaved] = useState(false);
  const { status, quantity, restockAt } = product.stock;
  const soldOut = status === "out_of_stock";

  return (
    <article className={`card${soldOut ? " card--sold-out" : ""}`}>
      <div className="card__media">
        <ProductImage src={product.image} alt={product.name} />
        <span className={`badge badge--${status}`}>
          {status === "low_stock"
            ? `${STOCK_LABELS.low_stock} (${quantity})`
            : STOCK_LABELS[status]}
        </span>
      </div>

      <div className="card__body">
        <h2 className="card__name">{product.name}</h2>
        <p className="card__desc">{product.description}</p>

        <ul className="tags">
          {product.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <dl className="specs">
          {Object.entries(product.specs).map(([key, value]) => (
            <div className="specs__row" key={key}>
              <dt>{SPEC_LABELS[key] ?? key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="card__foot">
          <span className="price">
            {formatPrice(product.price, product.currency)}
          </span>
          {soldOut ? (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setAlerting(true)}
              disabled={alertSaved}
            >
              {alertSaved ? "Bildirim kaydedildi" : "Stok Bildirimi İste"}
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={() => onAddToCart?.(product)}
            >
              Sepete Ekle
            </button>
          )}
        </div>

        {/* Ordering something that is out of stock would be a dead end — those
            cards keep the notify action instead. */}
        {!soldOut && (
          <button
            type="button"
            className="card__order"
            onClick={() => setOrdering(true)}
          >
            Sipariş Ver
          </button>
        )}

        {soldOut && restockAt && (
          <p className="card__restock">
            {dateFormatter.format(new Date(restockAt))} tarihinde tekrar stokta
          </p>
        )}
      </div>

      {ordering && (
        <OrderModal product={product} onClose={() => setOrdering(false)} />
      )}

      {alerting && (
        <StockAlertModal
          product={product}
          onSaved={(saved) => {
            setAlertSaved(true);
            onNotify?.(saved);
          }}
          onClose={() => setAlerting(false)}
        />
      )}
    </article>
  );
}
