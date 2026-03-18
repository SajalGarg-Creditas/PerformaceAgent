export function MetricCard(props: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {props.label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{props.value}</div>
      {props.hint ? (
        <div className="mt-1 text-sm text-zinc-500">{props.hint}</div>
      ) : null}
    </div>
  );
}

