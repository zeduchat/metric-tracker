import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SearchResult } from "@/lib/schemas/search";
import {
  groupResults,
  matchesQuickAction,
  searchGroupOrder,
  splitHighlight,
} from "./search-model";

const result = (type: SearchResult["type"], id: string): SearchResult => ({
  type,
  id,
  title: id,
  subtitle: null,
  status: null,
  matchedField: "title",
  href: "/",
});

describe("search model", () => {
  it("groups results in the fixed order while preserving order within groups", () => {
    const results = [
      result("task", "task-1"),
      result("goal", "goal-1"),
      result("task", "task-2"),
      result("agent", "agent-1"),
    ];

    const groups = groupResults(results);

    assert.deepEqual(
      groups.map(({ type }) => type),
      ["goal", "task", "agent"]
    );
    assert.deepEqual(
      groups.find(({ type }) => type === "task")?.results.map(({ id }) => id),
      ["task-1", "task-2"]
    );
    assert.deepEqual(searchGroupOrder.slice(0, 3), ["goal", "workstream", "task"]);
  });

  it("highlights a case-insensitive literal match without interpreting regex characters", () => {
    assert.deepEqual(splitHighlight("SEO [audit] plan", "[AUDIT]"), [
      { text: "SEO ", match: false },
      { text: "[audit]", match: true },
      { text: " plan", match: false },
    ]);
  });

  it("returns an unmatched part when there is no match or the query is empty", () => {
    assert.deepEqual(splitHighlight("Growth plan", "seo"), [
      { text: "Growth plan", match: false },
    ]);
    assert.deepEqual(splitHighlight("Growth plan", "  "), [
      { text: "Growth plan", match: false },
    ]);
  });

  it("matches quick actions case-insensitively and shows all for an empty query", () => {
    assert.equal(matchesQuickAction("New goal", "NEW"), true);
    assert.equal(matchesQuickAction("Create agent", "goal"), false);
    assert.equal(matchesQuickAction("Create agent", "  "), true);
  });
});
