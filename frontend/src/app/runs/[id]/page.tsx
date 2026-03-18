import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readNumber, formatSeconds, formatBytes, delta } from "@/lib/metrics";

export const dynamic = "force-dynamic";

function MetricRow(props: {
  label: string;
  before: number | null;
  after: number | null;
  format: (n: number | null) => string;
  goodDirection?: "down" | "up";
}) {
  const d = delta(props.before, props.after);
  const dLabel =
    d === null ? "—" : `${d > 0 ? "+" : ""}${props.format(d as number)}`;
  const isImprovement =
    d === null
      ? null
      : props.goodDirection === "up"
        ? d > 0
        : d < 0;

  return (
    <tr className="border-t border-zinc-200">
      <td className="px-4 py-3 font-medium">{props.label}</td>
      <td className="px-4 py-3">{props.format(props.before)}</td>
      <td className="px-4 py-3">{props.format(props.after)}</td>
      <td className="px-4 py-3">
        <span
          className={
            isImprovement === null
              ? "text-zinc-500"
              : isImprovement
                ? "text-emerald-700"
                : "text-rose-700"
          }
        >
          {dLabel}
        </span>
      </td>
    </tr>
  );
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await prisma.run.findUnique({
    where: { id },
    include: { project: true, issues: true, prs: true },
  });
  if (!run) return notFound();

  const before = run.beforeMetrics ?? null;
  const after = run.afterMetrics ?? null;

  const beforeLcp = readNumber(before, "lcp");
  const afterLcp = readNumber(after, "lcp");
  const beforeBundle = readNumber(before, "bundleSizeBytes");
  const afterBundle = readNumber(after, "bundleSizeBytes");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Run
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{run.runId}</h1>
        <div className="text-sm text-zinc-600">
          <Link href={`/projects/${run.projectId}`} className="hover:underline">
            {run.project.repoUrl}
          </Link>
          <span className="mx-2 text-zinc-300">•</span>
          <span className="font-medium">{run.status}</span>
        </div>
        <div className="text-xs text-zinc-500">
          Created {run.createdAt.toISOString()}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Metrics (before → after)
        </h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Before</th>
                <th className="px-4 py-3">After</th>
                <th className="px-4 py-3">Delta</th>
              </tr>
            </thead>
            <tbody>
              <MetricRow
                label="LCP"
                before={beforeLcp}
                after={afterLcp}
                format={formatSeconds}
                goodDirection="down"
              />
              <MetricRow
                label="Bundle size"
                before={beforeBundle}
                after={afterBundle}
                format={formatBytes}
                goodDirection="down"
              />
            </tbody>
          </table>
        </div>
        <div className="text-xs text-zinc-500">
          Tip: include keys like <code>lcp</code> (seconds) and{" "}
          <code>bundleSizeBytes</code> in the posted JSON for richer UI.
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Issues
        </h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Rule</th>
                <th className="px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {run.issues.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                    No issues recorded for this run.
                  </td>
                </tr>
              ) : (
                run.issues.map((i) => (
                  <tr key={i.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3 font-medium">{i.type}</td>
                    <td className="px-4 py-3">{i.severity}</td>
                    <td className="px-4 py-3 text-zinc-700">
                      {i.filePath ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{i.ruleId ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600">{i.message ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Pull requests
        </h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">PR</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Repo</th>
              </tr>
            </thead>
            <tbody>
              {run.prs.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-zinc-500" colSpan={3}>
                    No PRs recorded for this run.
                  </td>
                </tr>
              ) : (
                run.prs.map((p) => (
                  <tr key={p.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3">
                      <a
                        href={p.prUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                      >
                        {p.prUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3">{p.status}</td>
                    <td className="px-4 py-3 text-zinc-700">{p.repo ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

