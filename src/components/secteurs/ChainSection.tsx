import { S_CHAIN } from '../../data/secteurs';
import { cssVars } from '../../lib/css';

/*
  « Trois métiers connectés » (catalogue). Un signal parcourt la chaîne au scroll,
  les pôles s'allument, puis la citation se révèle mot à mot
  (scroll-driven animations avec timeline nommée, repli : texte visible).
*/
export default function ChainSection() {
  const words = S_CHAIN.quote.split(' ');
  return (
    <section className="chain2">
      <div className="wrap">
        <div className="rv">
          <p className="label light">{S_CHAIN.label}</p>
          <h2 className="h2">{S_CHAIN.title}<br /><em className="red">{S_CHAIN.red}</em></h2>
          <p className="ch2-p">{S_CHAIN.text}</p>
        </div>
        <ol className="ch2-poles">
          <span className="ch2-line" aria-hidden="true"><i /><b /></span>
          {S_CHAIN.poles.map((p, i) => (
            <li key={p.n} style={cssVars({ '--i': i })}><span className="ch2-n">{p.n}</span><b>{p.title}</b><span>{p.sub}</span></li>
          ))}
        </ol>
        <blockquote className="ch2-q">
          <p>« {words.map((w, i) => <span key={i} className="qw" style={cssVars({ '--i': i })}>{w} </span>)}»</p>
        </blockquote>
      </div>
    </section>
  );
}
