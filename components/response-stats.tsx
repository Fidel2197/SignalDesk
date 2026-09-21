export type ResponseStat = { label: string; value: string; detail: string };

export function ResponseStats({ stats }: { stats: ResponseStat[] }) {
  return <section className="stat-strip" aria-label="Practice queue and public source counts">
    {stats.map((stat) => <article key={stat.label}>
      <span>{stat.label}</span><strong>{stat.value}</strong><p>{stat.detail}</p>
    </article>)}
  </section>;
}
