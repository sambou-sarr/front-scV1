import { B_PRODUCTS } from '../../data/branding';

// Les trois tenues du catalogue. Survol (ou toucher) : zoom sur le QR du visuel.
export default function WearProducts() {
  return (
    <section className="wp">
      <div className="wrap">
        <div className="sec-head split rv">
          <div><p className="label">{B_PRODUCTS.label}</p><h2 className="h2">{B_PRODUCTS.title}<br /><em className="red">{B_PRODUCTS.red}</em></h2></div>
          <p className="side-note">{B_PRODUCTS.zoom}</p>
        </div>
        <div className="wp-grid">
          {B_PRODUCTS.items.map((it) => (
            <article key={it.id} className="wp-card rv" tabIndex={0}>
              <div className="wp-img"><img src={it.img} alt={`${it.name} personnalisé avec logo et QR code`} loading="lazy" style={{ transformOrigin: `${it.qr[0]}% ${it.qr[1]}%` }} /></div>
              <p className="wp-name">{it.name}</p>
              <p className="wp-text">{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
