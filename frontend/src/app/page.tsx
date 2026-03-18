import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/MetricCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projectCount, runCount, recentRuns] = await Promise.all([
    prisma.project.count(),
    prisma.run.count(),
    prisma.run.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { project: true, prs: true, issues: true },
    }),
  ]);

  const lastRun = recentRuns[0] ?? null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Performance Agent Portal
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            View performance runs, issues detected, and PRs opened by the agent.
            Runs are ingested via a secure endpoint from GitHub Actions.
          </p>
        </div>
        <Link
          href="/projects"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Browse projects
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Projects" value={String(projectCount)} />
        <MetricCard label="Runs" value={String(runCount)} />
        <MetricCard
          label="Latest status"
          value={lastRun?.status ?? "—"}
          hint={lastRun ? lastRun.project.repoUrl : undefined}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Recent runs
          </h2>
        </div>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Run</th>
                <th className="px-4 py-3">Repo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Issues</th>
                <th className="px-4 py-3">PRs</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-zinc-500" colSpan={6}>
                    No runs yet. Once GitHub Actions posts to the ingest API,
                    they’ll show up here.
                  </td>
                </tr>
              ) : (
                recentRuns.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3">
                      <Link
                        href={`/runs/${r.id}`}
                        className="font-medium text-zinc-950 hover:underline"
                      >
                        {r.runId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      <Link
                        href={`/projects/${r.projectId}`}
                        className="hover:underline"
                      >
                        {r.project.repoUrl}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{r.status}</td>
                    <td className="px-4 py-3">{r.issues.length}</td>
                    <td className="px-4 py-3">{r.prs.length}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {r.createdAt.toISOString().slice(0, 10)}
                    </td>
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
