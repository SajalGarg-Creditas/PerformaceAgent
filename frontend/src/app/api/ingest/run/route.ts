import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IngestRunSchema } from "@/lib/ingestSchema";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: Request) {
  const expected = process.env.PORTAL_INGEST_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "server_not_configured" },
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice("bearer ".length).trim()
    : null;
  if (!token || token !== expected) return unauthorized();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return badRequest("invalid_json");
  }

  const parsed = IngestRunSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  // Idempotent upsert on (runId). If already ingested, we return the existing run.
  const project = await prisma.project.upsert({
    where: { repoUrl: payload.project.repo_url },
    create: {
      repoUrl: payload.project.repo_url,
      prodUrl: payload.project.prod_url,
      uatUrl: payload.project.uat_url,
      name: payload.project.name,
      isActive: true,
    },
    update: {
      prodUrl: payload.project.prod_url ?? undefined,
      uatUrl: payload.project.uat_url ?? undefined,
      name: payload.project.name ?? undefined,
    },
  });

  const run = await prisma.run.upsert({
    where: { runId: payload.run_id },
    create: {
      runId: payload.run_id,
      status: payload.status,
      beforeMetrics: payload.before_metrics ?? undefined,
      afterMetrics: payload.after_metrics ?? undefined,
      startedAt: payload.started_at ? new Date(payload.started_at) : undefined,
      finishedAt: payload.finished_at ? new Date(payload.finished_at) : undefined,
      projectId: project.id,
      issues: {
        create: payload.issues.map((i) => ({
          type: i.type,
          severity: i.severity,
          filePath: i.file_path,
          ruleId: i.rule_id,
          message: i.message,
        })),
      },
      prs: {
        create: payload.prs.map((p) => ({
          prUrl: p.pr_url,
          status: p.status,
          repo: p.repo,
        })),
      },
    },
    update: {
      status: payload.status,
      beforeMetrics: payload.before_metrics ?? undefined,
      afterMetrics: payload.after_metrics ?? undefined,
      startedAt: payload.started_at ? new Date(payload.started_at) : undefined,
      finishedAt: payload.finished_at ? new Date(payload.finished_at) : undefined,
      projectId: project.id,
    },
    include: { issues: true, prs: true },
  });

  // If this was a retry for the same run_id, we want issues/prs to reflect latest payload.
  // Simple approach for MVP: replace children on update.
  if (run.issues.length > 0 || run.prs.length > 0) {
    await prisma.issue.deleteMany({ where: { runId: run.id } });
    await prisma.pullRequest.deleteMany({ where: { runId: run.id } });
  }
  await prisma.issue.createMany({
    data: payload.issues.map((i) => ({
      runId: run.id,
      type: i.type,
      severity: i.severity,
      filePath: i.file_path,
      ruleId: i.rule_id,
      message: i.message,
    })),
  });
  await prisma.pullRequest.createMany({
    data: payload.prs.map((p) => ({
      runId: run.id,
      prUrl: p.pr_url,
      status: p.status,
      repo: p.repo,
    })),
  });

  return NextResponse.json({ ok: true, project_id: project.id, run_id: run.id });
}

