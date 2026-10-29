"use client";

import { useEffect, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { GitBranch, Search } from "lucide-react";

import { useIsMac } from "@/lib/hooks/use-is-mac";
import { Kbd } from "@/components/ui/kbd";
import { CommunityRail } from "@/features/showcase/components/community-rail";
import { StarterTemplates } from "@/features/templates/components/starter-templates";
import { takePendingTemplate } from "@/features/templates/utils/pending-template";
import { PromoBanner } from "@/features/promotions/components/promo-banner";
import { GridPattern } from "@/components/landing/grid-pattern";
import { CountUp, Reveal } from "@/components/landing/reveal";
import { LabelBar, SectionHeader } from "@/components/landing/section-header";

import { useProjects } from "../hooks/use-projects";
import { useCreateProjectFromPrompt } from "../hooks/use-create-project-from-prompt";
import { takePendingPrompt } from "../utils/pending-prompt";
import { takePendingImport } from "../utils/pending-import";
import { githubRepoUrl, parseGithubRepo } from "../utils/github-repo";
import { ProjectsCommandDialog } from "./projects-command-dialog";
import { FirstRunChecklist } from "./first-run-checklist";
import { ImportGithubDialog } from "./import-github-dialog";
import { NewProjectDialog } from "./new-project-dialog";
import { PromptComposer } from "./prompt-composer";
import { ProjectsGrid } from "./projects-grid";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ProjectsViewProps {
  /** A validated `owner/repo` from an "Open in Codenaya" link (`/?import=`). */
  linkedRepo?: string | null;
}

export const ProjectsView = ({ linkedRepo = null }: ProjectsViewProps) => {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(linkedRepo !== null);
  const [importRepo, setImportRepo] = useState(linkedRepo);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const isMac = useIsMac();
  const { user } = useUser();

  const allProjects = useProjects();
  const hasNoProjects = allProjects?.length === 0;
  const { createProject, isSubmitting } = useCreateProjectFromPrompt();
  const reduceMotion = useReducedMotion();
  const enter = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  // From the user's own projects; a dash while they load.
  const onGithub = allProjects?.filter(
    (p) => p.importStatus === "completed" || p.exportStatus === "completed",
  ).length;
  const lastEdited = allProjects?.length
    ? formatDistanceToNow(Math.max(...allProjects.map((p) => p.updatedAt)), { addSuffix: true })
    : null;
  const stats = [
    { value: allProjects ? <CountUp to={allProjects.length} /> : "—", caption: "Projects" },
    { value: onGithub !== undefined ? <CountUp to={onGithub} /> : "—", caption: "Linked to GitHub" },
    { value: lastEdited ?? "—", caption: "Last edited" },
  ];

  // A template picked on /showcase or a prompt typed on the landing page
  // before signing up: create its project now. Taking them clears them, so
  // this runs at most once.
  useEffect(() => {
    const pendingTemplate = takePendingTemplate();
    const pendingPrompt = takePendingPrompt();
    if (pendingTemplate) void createProject(pendingTemplate.prompt, pendingTemplate.id);
    else if (pendingPrompt) void createProject(pendingPrompt);
  }, [createProject]);

  // A repo from an "Open in Codenaya" link kept across sign-up, when the
  // visitor didn't come back through /import. Always taken, so it can't
  // resurface later. The user still confirms; nothing is imported here.
  useEffect(() => {
    const repo = parseGithubRepo(takePendingImport() ?? "");
    if (linkedRepo || !repo) return;
    // Take-once localStorage state can only be read after mount; a lazy
    // initialiser would run twice in Strict Mode.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImportRepo(repo);
    setImportDialogOpen(true);
  }, [linkedRepo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setCommandDialogOpen(true);
        }
        if (e.key === "i") {
          e.preventDefault();
          setImportDialogOpen(true);
        }
        if (e.key === "j") {
          e.preventDefault();
          setNewProjectDialogOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ProjectsCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <ImportGithubDialog
        // Remount on a new repo so the form takes it as its default value.
        key={importRepo}
        open={importDialogOpen}
        onOpenChange={(open) => {
          setImportDialogOpen(open);
          if (!open) setImportRepo(null);
        }}
        defaultUrl={importRepo ? githubRepoUrl(importRepo) : undefined}
      />
      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
      />

      <main className="flex flex-1 flex-col bg-background">
        {/* The landing page's grid: one framed column, sections on shared borders. */}
        <div className="mx-auto w-full max-w-[1200px] flex-1 border-x border-border">
          {/* ─── Hero: the prompt composer ─── */}
          <section className="border-b border-border">
            <div className="relative isolate overflow-hidden px-6 pt-16 pb-14 md:px-12 md:pt-20 md:pb-16">
              {/* The landing hero's backdrop: a grid fading out from the top centre, and a soft glow. */}
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]">
                  <GridPattern />
                </div>
                <div className="absolute left-1/2 top-[-14rem] h-[26rem] w-[44rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-brand/15 blur-[110px] dark:bg-brand/10" />
              </div>

              <div className="mx-auto max-w-3xl">
                <PromoBanner />
                <div className="text-center">
                  <motion.p
                    {...enter(0.05)}
                    className="h-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {user?.firstName ? `[ Welcome back, ${user.firstName} ]` : null}
                  </motion.p>
                  <motion.h2
                    {...enter(0.12)}
                    className="mt-5 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.045em] text-foreground sm:text-6xl"
                  >
                    What will you <span className="text-brand">build?</span>
                  </motion.h2>
                  <motion.p {...enter(0.2)} className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    {hasNoProjects
                      ? "Describe your first app, or start from one of these ideas."
                      : "Describe an app and Codenaya builds it, with a live preview."}
                  </motion.p>
                </div>

                <motion.div {...enter(0.28)} className="mt-9">
                  <PromptComposer
                    onSubmit={createProject}
                    isSubmitting={isSubmitting}
                  />
                  <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <button
                      onClick={() => setImportDialogOpen(true)}
                      className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                    >
                      <GitBranch className="size-3.5" />
                      Import from GitHub
                      <Kbd className="hidden text-[10px] sm:inline-flex">{isMac ? "⌘I" : "Ctrl+I"}</Kbd>
                    </button>
                    <span aria-hidden className="h-3 w-px bg-border" />
                    <button
                      onClick={() => setCommandDialogOpen(true)}
                      className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                    >
                      <Search className="size-3.5" />
                      Find a project
                      <Kbd className="hidden text-[10px] sm:inline-flex">{isMac ? "⌘K" : "Ctrl+K"}</Kbd>
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

          </section>

          {/* ─── Your work ─── */}
          <section className="border-b border-border">
            <LabelBar label="Workspace" />
            <FirstRunChecklist
              projects={allProjects}
              onNewProject={() => setNewProjectDialogOpen(true)}
            />
            <Reveal>
              <ProjectsGrid
                projects={allProjects}
                onNewProject={() => setNewProjectDialogOpen(true)}
                onImport={() => setImportDialogOpen(true)}
              />
            </Reveal>
          </section>

          {/* ─── At a glance: after the projects, which are what a returning user came for ─── */}
          <section className="border-b border-border">
            <LabelBar label="Overview" />
            <Reveal>
              <dl className="grid md:grid-cols-3">
                {stats.map((stat) => (
                  // A label over its value; nothing truncates.
                  <div
                    key={stat.caption}
                    className="flex flex-col gap-1 border-border px-6 py-4 max-md:not-last:border-b md:px-8 md:not-last:border-r"
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {stat.caption}
                    </dt>
                    <dd className="text-lg font-semibold tracking-tight text-foreground">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </section>

          {/* ─── Templates, as cells on the grid (`templates-grid` in globals.css) ─── */}
          <section className="templates-grid max-sm:border-b max-sm:border-border">
            <SectionHeader
              label="Templates"
              title="Start from"
              accent="a template."
              description="Official starters that boot in the preview, then the agent builds them out."
            />
            <Reveal>
              <StarterTemplates
                title="Start from a template"
                description="Official starters that boot in the preview, then the agent builds them out"
              />
            </Reveal>
          </section>

          {/* ─── The community; the whole block hides while the rail has nothing to show ─── */}
          <div className="hidden border-b border-border has-[section]:block">
            <LabelBar label="Community" />
            <Reveal>
              <CommunityRail />
            </Reveal>
          </div>
        </div>
      </main>
    </MotionConfig>
  );
};
