/**
 * Product catalog grid. Single file by convention: markup, styles and the
 * card sub-view all live here.
 *
 * Data is never imported — the caller passes it in:
 *   <ProductGrid products={products} onAddToCart={…} onNotify={…} />
 */

const priceFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
});

const stockLabels = {
  in_stock: "Stokta",
  low_stock: "Son birkaç adet",
  out_of_stock: "Tükendi",
};

export default function ProductGrid({ products = [], onAddToCart, onNotify }) {
  if (products.length === 0) {
    return (
      <div className="pg-empty">
        <style>{styles}</style>
        <p>Bu kategoride henüz ürün yok.</p>
      </div>
    );
  }

  return (
    <section className="pg-wrap" aria-label="Ürün kataloğu">
      <style>{styles}</style>
      <ul className="pg-grid">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onNotify={onNotify}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductCard({ product, onAddToCart, onNotify }) {
  const { status, quantity, restockAt } = product.stock;
  const soldOut = status === "out_of_stock";

  return (
    <article className={`pg-card${soldOut ? " is-sold-out" : ""}`}>
      <div className="pg-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className={`pg-badge pg-badge--${status}`}>
          {status === "low_stock"
            ? `${stockLabels.low_stock} (${quantity})`
            : stockLabels[status]}
        </span>
      </div>

      <div className="pg-body">
        <h3 className="pg-name">{product.name}</h3>
        <p className="pg-desc">{product.description}</p>

        <ul className="pg-features">
          {product.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <div className="pg-foot">
          <span className="pg-price">{priceFormatter.format(product.price)}</span>

          {soldOut ? (
            <button
              type="button"
              className="pg-btn pg-btn--ghost"
              onClick={() => onNotify?.(product)}
            >
              Gelince Haber Ver
            </button>
          ) : (
            <button
              type="button"
              className="pg-btn"
              onClick={() => onAddToCart?.(product)}
            >
              Sepete Ekle
            </button>
          )}
        </div>

        {soldOut && restockAt && (
          <p className="pg-restock">
            {dateFormatter.format(new Date(restockAt))} tarihinde tekrar stokta
          </p>
        )}
      </div>
    </article>
  );
}

const styles = `
  .pg-wrap { --terracotta: #c1613c; --terracotta-dark: #9e4a2c; --cream: #f6efe6;
    --clay: #e8d8c4; --ink: #3a2e26; --muted: #7b6a5c; --card-bg: #fffdf9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--ink); }

  .pg-grid { display: grid; gap: 22px; padding: 0; margin: 0; list-style: none;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }

  .pg-card { display: flex; flex-direction: column; height: 100%; overflow: hidden;
    background: var(--card-bg); border-radius: 20px;
    box-shadow: 0 14px 34px -20px rgba(58, 46, 38, 0.5);
    transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .pg-card:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -20px rgba(58, 46, 38, 0.6); }
  .pg-card.is-sold-out .pg-media img { filter: grayscale(0.7); opacity: 0.65; }

  .pg-media { position: relative; aspect-ratio: 4 / 3; background: var(--clay); }
  .pg-media img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .pg-badge { position: absolute; top: 12px; left: 12px; padding: 5px 11px;
    border-radius: 999px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.3px;
    background: var(--card-bg); color: var(--ink); }
  .pg-badge--in_stock { background: #e6f0e4; color: #3f6b38; }
  .pg-badge--low_stock { background: #fbecd8; color: #8a5a15; }
  .pg-badge--out_of_stock { background: #ecdedd; color: #8c3f36; }

  .pg-body { display: flex; flex-direction: column; flex: 1; gap: 9px; padding: 18px 18px 20px; }

  .pg-name { margin: 0; font-size: 16.5px; font-weight: 700; letter-spacing: -0.2px; }
  .pg-desc { margin: 0; font-size: 13.5px; line-height: 1.5; color: var(--muted); }

  .pg-features { margin: 2px 0 0; padding: 0; list-style: none;
    display: flex; flex-wrap: wrap; gap: 6px; }
  .pg-features li { padding: 4px 9px; border-radius: 8px; background: var(--cream);
    font-size: 11.5px; color: var(--muted); }

  .pg-foot { display: flex; align-items: center; justify-content: space-between;
    gap: 12px; margin-top: auto; padding-top: 14px; }
  .pg-price { font-size: 18px; font-weight: 700; }

  .pg-btn { padding: 10px 15px; border: none; border-radius: 11px; cursor: pointer;
    font-family: inherit; font-size: 13.5px; font-weight: 700; color: #fff;
    background: linear-gradient(135deg, var(--terracotta), var(--terracotta-dark));
    transition: transform 0.15s ease, box-shadow 0.15s ease; }
  .pg-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 20px -12px rgba(158, 74, 44, 0.9); }
  .pg-btn--ghost { color: var(--terracotta-dark); background: var(--cream);
    box-shadow: inset 0 0 0 1.5px var(--clay); }
  .pg-btn--ghost:hover { background: var(--clay); box-shadow: inset 0 0 0 1.5px var(--terracotta); }

  .pg-restock { margin: 0; font-size: 12px; color: var(--muted); }

  .pg-empty { padding: 40px; text-align: center; color: #7b6a5c;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
`;
