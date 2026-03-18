import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
  });
  if (!project) return notFound();

  const runs = await prisma.run.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { issues: true, prs: true },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Project
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {project.name ?? project.repoUrl}
        </h1>
        <div className="text-sm text-zinc-600">{project.repoUrl}</div>
        <div className="flex flex-wrap gap-3 text-sm">
          {project.prodUrl ? (
            <a
              href={project.prodUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-zinc-200 bg-white px-3 py-1 hover:bg-zinc-50"
            >
              Prod URL
            </a>
          ) : null}
          {project.uatUrl ? (
            <a
              href={project.uatUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-zinc-200 bg-white px-3 py-1 hover:bg-zinc-50"
            >
              UAT URL
            </a>
          ) : null}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Runs
        </h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Run</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Issues</th>
                <th className="px-4 py-3">PRs</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                    No runs yet.
                  </td>
                </tr>
              ) : (
                runs.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3">
                      <Link
                        href={`/runs/${r.id}`}
                        className="font-medium hover:underline"
                      >
                        {r.runId}
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

