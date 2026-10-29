import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FaGithub } from "react-icons/fa";
import { AlertCircleIcon, GlobeIcon, KeyboardIcon, Loader2Icon } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useShortcutsDialog } from "@/components/shortcuts-dialog";
import { Kbd } from "@/components/ui/kbd";

import { useProjects } from "../hooks/use-projects";
import { Doc } from "../../../../convex/_generated/dataModel";

interface ProjectsCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const getProjectIcon = (project: Doc<"projects">) => {
  if (project.importStatus === "completed") {
    return <FaGithub className="size-4 text-muted-foreground" />
  }

  if (project.importStatus === "failed") {
    return <AlertCircleIcon className="size-4 text-muted-foreground" />;
  }

  if (project.importStatus === "importing") {
    return (
      <Loader2Icon className="size-4 text-muted-foreground animate-spin" />
    );
  }

  return <GlobeIcon className="size-4 text-muted-foreground" />;
}

export const ProjectsCommandDialog = ({
  open,
  onOpenChange,
}: ProjectsCommandDialogProps) => {
  const router = useRouter();
  const projects = useProjects();
  const openShortcuts = useShortcutsDialog((state) => state.setOpen);

  const handleSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`);
    onOpenChange(false);
  };

  const handleShowShortcuts = () => {
    onOpenChange(false);
    openShortcuts(true);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Projects"
      description="Search and navigate to your projects"
      showCloseButton={false}
      // The prompt box's window look: mono bar, mono group labels, brand selection.
      className="rounded-lg sm:max-w-xl [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-item][data-selected=true]]:bg-brand/[0.07]"
    >
      <div className="flex h-10 items-center justify-between border-b border-border bg-muted/40 px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-brand" />
          Find a project
        </span>
        <span>{projects ? `${projects.length} total` : null}</span>
      </div>
      <CommandInput placeholder="Search projects..." />
      <CommandList className="max-h-[360px]">
        <CommandEmpty>No projects found.</CommandEmpty>
        <CommandGroup heading="Projects">
          {projects?.map((project) => (
            <CommandItem
              key={project._id}
              value={`${project.name}-${project._id}`}
              onSelect={() => handleSelect(project._id)}
            >
              {getProjectIcon(project)}
              <span className="truncate">{project.name}</span>
              <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Help">
          <CommandItem onSelect={handleShowShortcuts}>
            <KeyboardIcon className="size-4 text-muted-foreground" />
            <span>Keyboard shortcuts</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="flex h-10 items-center gap-4 border-t border-border bg-muted/30 px-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="flex items-center gap-1.5"><Kbd>↑↓</Kbd> Move</span>
        <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> Open</span>
        <span className="ml-auto flex items-center gap-1.5"><Kbd>Esc</Kbd> Close</span>
      </div>
    </CommandDialog>
  )
};