import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { runs: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Each project maps to a repo URL and optional prod/UAT URLs.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Repo</th>
              <th className="px-4 py-3">Runs</th>
              <th className="px-4 py-3">Prod</th>
              <th className="px-4 py-3">UAT</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                  No projects yet. The ingest API will create projects
                  automatically when it receives runs.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="border-t border-zinc-200">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.repoUrl}
                    </Link>
                    {p.name ? (
                      <div className="text-xs text-zinc-500">{p.name}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{p._count.runs}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {p.prodUrl ? (
                      <a
                        className="hover:underline"
                        href={p.prodUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {p.prodUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {p.uatUrl ? (
                      <a
                        className="hover:underline"
                        href={p.uatUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {p.uatUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {p.updatedAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

