// « Cinq temps, un livrable à chaque étape » — ligne qui se remplit au scroll.
export interface FiveStepsData { label: string; title: string; red: string; steps: { n: string; title: string; text: string }[] }

export default function FiveSteps({ data }: { data: FiveStepsData }) {
  return (
    <section className="five">
      <div className="wrap">
        <div className="rv">
          <p className="label">{data.label}</p>
          <h2 className="h2">{data.title} <em className="red">{data.red}</em></h2>
        </div>
        <ol className="five-list">
          <span className="rs-line" aria-hidden="true"><i /></span>
          {data.steps.map((s) => (
            <li key={s.n}><span className="five-n">{s.n}</span><b>{s.title}</b><p>{s.text}</p></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
