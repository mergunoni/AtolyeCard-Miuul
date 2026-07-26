import ProductCard from "./ProductCard.jsx";

/** Renders the whole catalog. Owns no data — the array arrives as a prop. */
export default function ProductList({ products = [], onAddToCart, onNotify }) {
  if (products.length === 0) {
    return <p className="page__lead">Bu kategoride henüz ürün yok.</p>;
  }

  return (
    <ul className="grid">
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
  );
}
