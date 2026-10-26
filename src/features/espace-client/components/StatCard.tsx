export function StatCard({
  label,
  caption,
  icon,
  stat,
}: {
  label: string;
  caption: string;
  icon: string;
  stat: number;
}) {
  return (
    <article className="rounded-2xl border border-[#e3dfd8] bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] shadow-black/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#6d665d]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#08090A]">
            {stat}
          </p>
          <p className="mt-1 text-xs text-[#8d8a85]">{caption}</p>
        </div>
        <span
          className="grid h-11 w-11 place-items-center rounded-xl bg-[#f4f1eb] text-xl text-[#4a443c]"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
    </article>
  );
}