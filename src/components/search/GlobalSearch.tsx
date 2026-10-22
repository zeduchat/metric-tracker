"use client";

import {
  Bot,
  FileText,
  FolderOpen,
  GitBranch,
  ListTodo,
  Newspaper,
  Radio,
  Search,
  Send,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProject } from "@/components/projects/ProjectProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchResult, SearchResultType } from "@/lib/schemas/search";
import { groupResults, splitHighlight } from "./search-model";
import { useGlobalSearch } from "./useGlobalSearch";

const resultIcons: Record<SearchResultType, LucideIcon> = {
  goal: Target,
  workstream: GitBranch,
  task: ListTodo,
  agent: Bot,
  directory: FolderOpen,
  content: FileText,
  press_outlet: Newspaper,
  press_coverage: Radio,
  press_submission: Send,
};

function HighlightedTitle({ title, query }: { title: string; query: string }) {
  return (
    <>
      {splitHighlight(title, query).map((part, index) =>
        part.match ? (
          <span key={index} className="font-semibold text-foreground">
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
}

function ResultItem({
  result,
  query,
  onSelect,
}: {
  result: SearchResult;
  query: string;
  onSelect: (result: SearchResult) => void;
}) {
  const Icon = resultIcons[result.type];

  return (
    <CommandItem
      value={`${result.type}-${result.id}`}
      onSelect={() => onSelect(result)}
      className="min-h-11 gap-3 px-3 py-2"
    >
      <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate">
          <HighlightedTitle title={result.title} query={query} />
        </span>
        {result.subtitle && (
          <span className="truncate text-xs text-muted-foreground">{result.subtitle}</span>
        )}
      </span>
      {result.status && (
        <span className="shrink-0 text-xs text-muted-foreground">{result.status}</span>
      )}
    </CommandItem>
  );
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-2 p-3" aria-label="Loading search results">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex min-h-11 items-center gap-3">
          <Skeleton className="size-4 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { href } = useProject();
  const search = useGlobalSearch(query, open);
  const trimmedQuery = query.trim();
  const groups = useMemo(
    () => groupResults(search.results),
    [search.results]
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((isOpen) => !isOpen);
        setQuery("");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function selectResult(result: SearchResult) {
    close();
    router.push(href(result.href));
  }

  const resultCount =
    search.status === "success"
      ? `${search.results.length} ${search.results.length === 1 ? "result" : "results"}`
      : "";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        className="sm:hidden"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden="true" data-icon="inline-start" />
        Search
        <kbd aria-hidden="true" className="ml-2 rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) close();
          else setOpen(true);
        }}
        title="Search Amp"
        description="Search goals, workstreams, tasks, agents, directories, content, and press."
      >
        <Command shouldFilter={false}>
          <CommandInput
            autoFocus
            aria-label="Search your project"
            placeholder="Search your project..."
            value={query}
            maxLength={100}
            onValueChange={setQuery}
          />
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {resultCount}
          </div>
          <CommandList>
            {trimmedQuery.length < 2 && (
              <p className="px-4 py-5 text-sm text-muted-foreground">
                Type at least 2 characters to search.
              </p>
            )}
            {trimmedQuery.length >= 2 && search.status === "loading" && <LoadingRows />}
            {trimmedQuery.length >= 2 && search.status === "error" && (
              <Alert variant="destructive" className="m-3">
                <AlertDescription className="flex items-center justify-between gap-3">
                  <span>Search couldn’t be completed. Try again.</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    onClick={search.retry}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {trimmedQuery.length >= 2 && search.status === "success" && groups.length === 0 && (
              <Empty className="min-h-40 border-0">
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>Try a different search term.</EmptyDescription>
              </Empty>
            )}
            {trimmedQuery.length >= 2 && search.status === "success" && groups.length > 0 &&
              groups.map((group) => (
                <CommandGroup key={group.type} heading={group.label}>
                  {group.results.map((result) => (
                    <ResultItem
                      key={`${result.type}-${result.id}`}
                      result={result}
                      query={search.query}
                      onSelect={selectResult}
                    />
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
