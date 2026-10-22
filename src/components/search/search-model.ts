import type { SearchResult, SearchResultType } from "@/lib/schemas/search";

export const searchGroupOrder: readonly SearchResultType[] = [
  "goal",
  "workstream",
  "task",
  "agent",
  "directory",
  "content",
  "press_outlet",
  "press_coverage",
  "press_submission",
];

export const searchGroupLabels: Record<SearchResultType, string> = {
  goal: "Goals",
  workstream: "Workstreams",
  task: "Tasks",
  agent: "Agents",
  directory: "Directories",
  content: "Content",
  press_outlet: "Press outlets",
  press_coverage: "Press coverage",
  press_submission: "Press submissions",
};

export type SearchResultGroup = {
  type: SearchResultType;
  label: string;
  results: SearchResult[];
};

export function groupResults(results: SearchResult[]): SearchResultGroup[] {
  return searchGroupOrder.flatMap((type) => {
    const groupedResults = results.filter((result) => result.type === type);
    return groupedResults.length > 0
      ? [{ type, label: searchGroupLabels[type], results: groupedResults }]
      : [];
  });
}

export type HighlightPart = { text: string; match: boolean };

export function splitHighlight(text: string, query: string): HighlightPart[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [{ text, match: false }];

  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(escapedQuery, "i").exec(text);
  if (!match || match.index === undefined) return [{ text, match: false }];

  const before = text.slice(0, match.index);
  const matchedText = text.slice(match.index, match.index + match[0].length);
  const after = text.slice(match.index + match[0].length);

  return [
    ...(before ? [{ text: before, match: false }] : []),
    { text: matchedText, match: true },
    ...(after ? [{ text: after, match: false }] : []),
  ];
}

export function matchesQuickAction(label: string, query: string) {
  const trimmedQuery = query.trim();
  return !trimmedQuery || label.toLocaleLowerCase().includes(trimmedQuery.toLocaleLowerCase());
}
