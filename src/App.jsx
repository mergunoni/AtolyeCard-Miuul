import { useState } from "react";
import { products } from "./data/products.js";
import ProductList from "./components/ProductList.jsx";
import PageQrCode from "./components/PageQrCode.jsx";

export default function App() {
  const [notice, setNotice] = useState("");

  const handleAddToCart = (product) =>
    setNotice(`${product.name} sepete eklendi.`);

  const handleNotify = (product) =>
    setNotice(`${product.name} stoğa girdiğinde size haber vereceğiz.`);

  return (
    <div className="page">
      <PageQrCode />

      <header className="page__head">
        <p className="page__eyebrow">AtölyeKart</p>
        <h1 className="page__title">El Yapımı Ürünler</h1>
        <p className="page__lead">
          Seramik, mum ve takı — hepsi atölyede tek tek üretiliyor. Her parça
          kendi el izini taşıdığı için hiçbiri diğerinin aynısı değil.
        </p>
      </header>

      <main>
        <ProductList
          products={products}
          onAddToCart={handleAddToCart}
          onNotify={handleNotify}
        />
      </main>

      {notice && (
        <div className="toast" role="status" onClick={() => setNotice("")}>
          {notice}
        </div>
      )}
    </div>
  );
}
