import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod";
import {
  contentCreateSchema,
  contentErrorSchema,
  contentItemSchema,
  contentUpdateSchema,
} from "@/lib/schemas/content";
import {
  checklistItemCreateSchema,
  checklistItemSchema,
  checklistItemUpdateSchema,
  directoryActivitySchema,
  directoryCreateSchema,
  directoryErrorSchema,
  directorySchema,
  directoryUpdateSchema,
  savedCopyCreateSchema,
  savedCopySchema,
  savedCopyUpdateSchema,
} from "@/lib/schemas/directories";
import {
  mediaFeatureResponseSchema,
  mediaFeatureSchema,
  mediaInputSchema,
  mediaListResponseSchema,
  mediaRecordSchema,
  outletSchema,
  outletUpdateSchema,
} from "@/lib/schemas/media";
import { overviewErrorSchema, overviewSummarySchema } from "@/lib/schemas/overview";
import {
  offerAcceptSchema,
  offerCreateSchema,
  taskCreateSchema,
  taskErrorSchema,
  taskItemSchema,
  taskOfferedSchema,
  taskUpdateSchema,
} from "@/lib/schemas/tasks";

// Register request/response schemas and paths here; they appear at /docs.
export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "sessionCookie", {
  type: "apiKey",
  in: "cookie",
  name: "next-auth.session-token",
  description: "NextAuth session cookie — obtained after Google OAuth sign-in at `/api/auth/signin`.",
});

registry.registerComponent("securitySchemes", "agentKey", {
  type: "apiKey",
  in: "header",
  name: "authorization",
  description: "Agent API key as `Bearer <agent-key>`. Alternatively send `X-Agent-Key` header.",
});

registry.registerPath({
  method: "get",
  path: "/api/content",
  operationId: "listContent",
  tags: ["Content"],
  security: [{ sessionCookie: [] }],
  responses: {
    200: {
      description: "Content shared across the workspace",
      content: { "application/json": { schema: contentItemSchema.array() } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/content",
  operationId: "createContent",
  tags: ["Content"],
  security: [{ sessionCookie: [] }],
  request: { body: { content: { "application/json": { schema: contentCreateSchema } } } },
  responses: {
    201: {
      description: "Content created",
      content: { "application/json": { schema: contentItemSchema } },
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: contentErrorSchema } },
    },
    401: { description: "Unauthorized" },
  },
});

const contentIdParams = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path" } }),
});

registry.registerPath({
  method: "get",
  path: "/api/content/{id}",
  operationId: "getContent",
  tags: ["Content"],
  security: [{ sessionCookie: [] }],
  request: { params: contentIdParams },
  responses: {
    200: {
      description: "Content item",
      content: { "application/json": { schema: contentItemSchema } },
    },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/content/{id}",
  operationId: "updateContent",
  tags: ["Content"],
  security: [{ sessionCookie: [] }],
  request: {
    params: contentIdParams,
    body: { content: { "application/json": { schema: contentUpdateSchema } } },
  },
  responses: {
    200: {
      description: "Content updated",
      content: { "application/json": { schema: contentItemSchema } },
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: contentErrorSchema } },
    },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/content/{id}",
  operationId: "deleteContent",
  tags: ["Content"],
  security: [{ sessionCookie: [] }],
  request: { params: contentIdParams },
  responses: {
    204: { description: "Content deleted" },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

// ── Media ──
registry.registerPath({
  method: "get",
  path: "/api/media",
  summary: "List media records",
  security: [{ sessionCookie: [] }],
  responses: {
    200: {
      description: "A list of coverage and submission records.",
      content: {
        "application/json": {
          schema: mediaListResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/media",
  summary: "Create a press media record",
  security: [{ sessionCookie: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: mediaInputSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "The created media record.",
      content: {
        "application/json": {
          schema: mediaInputSchema,
        },
      },
    },
  },
});

const mediaIdParams = z.object({ id: z.string().openapi({ description: "Coverage or submission id" }) });

registry.registerPath({
  method: "put",
  path: "/api/media/{id}",
  summary: "Update a coverage or submission record (its record type can't change)",
  security: [{ sessionCookie: [] }],
  request: { params: mediaIdParams, body: { content: { "application/json": { schema: mediaInputSchema } } } },
  responses: {
    200: { description: "The updated record", content: { "application/json": { schema: mediaRecordSchema } } },
    400: { description: "Validation failed, or the record type doesn't match" },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/media/{id}",
  summary: "Delete a coverage or submission record",
  security: [{ sessionCookie: [] }],
  request: { params: mediaIdParams },
  responses: {
    204: { description: "Deleted" },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/media/{id}/feature",
  summary: "Mark a pitch as featured: creates the coverage and links the pitch in one transaction",
  security: [{ sessionCookie: [] }],
  request: { params: mediaIdParams, body: { content: { "application/json": { schema: mediaFeatureSchema } } } },
  responses: {
    201: { description: "Coverage created and pitch linked", content: { "application/json": { schema: mediaFeatureResponseSchema } } },
    400: { description: "Validation failed, or the pitch is already featured" },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/media/outlets",
  summary: "List press outlets with their details",
  security: [{ sessionCookie: [] }],
  responses: {
    200: { description: "Outlets by name", content: { "application/json": { schema: outletSchema.array() } } },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/media/outlets/{id}",
  summary: "Update an outlet's details; renaming also renames it on its coverage and pitches",
  security: [{ sessionCookie: [] }],
  request: { params: mediaIdParams, body: { content: { "application/json": { schema: outletUpdateSchema } } } },
  responses: {
    200: { description: "The updated outlet", content: { "application/json": { schema: outletSchema } } },
    400: { description: "Validation failed, or another outlet already uses that name" },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

// ── Directories ──
const directoryIdParams = z.object({ id: z.string().openapi({ description: "Directory id" }) });
const checklistItemParams = directoryIdParams.extend({ itemId: z.string().openapi({ description: "Checklist item id" }) });
const directoryError = { content: { "application/json": { schema: directoryErrorSchema } } };

registry.registerPath({
  method: "get",
  path: "/api/directories",
  operationId: "listDirectories",
  tags: ["Directories"],
  summary: "List directories with their checklists",
  security: [{ sessionCookie: [] }],
  responses: {
    200: { description: "Every directory, newest first", content: { "application/json": { schema: directorySchema.array() } } },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/directories",
  operationId: "createDirectory",
  tags: ["Directories"],
  summary: "Add a directory (gets the standard checklist and an activity entry)",
  security: [{ sessionCookie: [] }],
  request: { body: { content: { "application/json": { schema: directoryCreateSchema } } } },
  responses: {
    201: { description: "Directory created", content: { "application/json": { schema: directorySchema } } },
    400: { description: "Validation failed", ...directoryError },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/directories/{id}",
  operationId: "getDirectory",
  tags: ["Directories"],
  security: [{ sessionCookie: [] }],
  request: { params: directoryIdParams },
  responses: {
    200: { description: "The directory", content: { "application/json": { schema: directorySchema } } },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/directories/{id}",
  operationId: "updateDirectory",
  tags: ["Directories"],
  summary: "Update a directory. Status changes and new listing links are logged to activity.",
  security: [{ sessionCookie: [] }],
  request: { params: directoryIdParams, body: { content: { "application/json": { schema: directoryUpdateSchema } } } },
  responses: {
    200: { description: "Directory updated", content: { "application/json": { schema: directorySchema } } },
    400: { description: "Validation failed", ...directoryError },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/directories/{id}",
  operationId: "deleteDirectory",
  tags: ["Directories"],
  summary: "Delete a directory and its checklist; the removal is logged to activity",
  security: [{ sessionCookie: [] }],
  request: { params: directoryIdParams },
  responses: {
    204: { description: "Directory deleted" },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/directories/activity",
  operationId: "listDirectoryActivity",
  tags: ["Directories"],
  summary: "Recent directory activity, newest first",
  security: [{ sessionCookie: [] }],
  request: { query: z.object({ limit: z.number().int().min(1).max(100).optional().openapi({ description: "Default 20" }) }) },
  responses: {
    200: { description: "Activity entries", content: { "application/json": { schema: directoryActivitySchema.array() } } },
    400: { description: "Validation failed", ...directoryError },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/directories/{id}/checklist",
  operationId: "addDirectoryChecklistItem",
  tags: ["Directories"],
  summary: "Add a custom checklist requirement",
  security: [{ sessionCookie: [] }],
  request: { params: directoryIdParams, body: { content: { "application/json": { schema: checklistItemCreateSchema } } } },
  responses: {
    201: { description: "Item added", content: { "application/json": { schema: checklistItemSchema } } },
    400: { description: "Validation failed", ...directoryError },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/directories/{id}/checklist/{itemId}",
  operationId: "updateDirectoryChecklistItem",
  tags: ["Directories"],
  summary: "Tick, untick or rename a checklist item",
  security: [{ sessionCookie: [] }],
  request: { params: checklistItemParams, body: { content: { "application/json": { schema: checklistItemUpdateSchema } } } },
  responses: {
    200: { description: "Item updated", content: { "application/json": { schema: checklistItemSchema } } },
    400: { description: "Validation failed", ...directoryError },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/directories/{id}/checklist/{itemId}",
  operationId: "deleteDirectoryChecklistItem",
  tags: ["Directories"],
  security: [{ sessionCookie: [] }],
  request: { params: checklistItemParams },
  responses: {
    204: { description: "Item deleted" },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

const savedCopyParams = z.object({ id: z.string().openapi({ description: "Saved copy id" }) });

registry.registerPath({
  method: "get",
  path: "/api/directories/copy",
  operationId: "listSavedCopy",
  tags: ["Directories"],
  summary: "Team-wide saved submission copy",
  security: [{ sessionCookie: [] }],
  responses: {
    200: { description: "Saved copy in display order", content: { "application/json": { schema: savedCopySchema.array() } } },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/directories/copy",
  operationId: "createSavedCopy",
  tags: ["Directories"],
  security: [{ sessionCookie: [] }],
  request: { body: { content: { "application/json": { schema: savedCopyCreateSchema } } } },
  responses: {
    201: { description: "Copy saved", content: { "application/json": { schema: savedCopySchema } } },
    400: { description: "Validation failed", ...directoryError },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/directories/copy/{id}",
  operationId: "updateSavedCopy",
  tags: ["Directories"],
  security: [{ sessionCookie: [] }],
  request: { params: savedCopyParams, body: { content: { "application/json": { schema: savedCopyUpdateSchema } } } },
  responses: {
    200: { description: "Copy updated", content: { "application/json": { schema: savedCopySchema } } },
    400: { description: "Validation failed", ...directoryError },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/directories/copy/{id}",
  operationId: "deleteSavedCopy",
  tags: ["Directories"],
  security: [{ sessionCookie: [] }],
  request: { params: savedCopyParams },
  responses: {
    204: { description: "Copy deleted" },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

// ── Overview ──
const overviewError = { content: { "application/json": { schema: overviewErrorSchema } } };

registry.registerPath({
  method: "post",
  path: "/api/overview/summary",
  operationId: "generateOverviewSummary",
  tags: ["Overview"],
  summary: "Generate an AI summary of the overview (content, SEO, directories and press)",
  description: "Sends counts and item titles to the configured AI model (no notes or contact details). Nothing is stored.",
  security: [{ sessionCookie: [] }],
  responses: {
    200: { description: "The summary", content: { "application/json": { schema: overviewSummarySchema } } },
    401: { description: "Unauthorized" },
    502: { description: "The AI service failed or returned an unusable reply", ...overviewError },
    503: { description: "AI_PROVIDER_API_KEY or AI_MODEL is not configured (AI_BASE_URL picks the provider)", ...overviewError },
  },
});

// ── Tasks ──
const taskIdParams = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path" } }),
});

const taskListQuery = z.object({
  status: z.enum(["open", "completed", "all"]).optional().openapi({ param: { name: "status", in: "query" } }),
  type: z.enum(["Call", "Email", "FollowUp", "Meeting", "Other"]).optional().openapi({ param: { name: "type", in: "query" } }),
  assignedToMe: z.enum(["true", "false"]).optional().openapi({ param: { name: "assignedToMe", in: "query" } }),
});

registry.registerPath({
  method: "get",
  path: "/api/tasks",
  operationId: "listTasks",
  tags: ["Tasks"],
  summary: "List tasks",
  description: "Retrieve tasks with optional status, type, and assignment filters.",
  security: [{ sessionCookie: [] }],
  request: { query: taskListQuery },
  responses: {
    200: {
      description: "List of tasks",
      content: { "application/json": { schema: taskItemSchema.array() } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tasks",
  operationId: "createTask",
  tags: ["Tasks"],
  summary: "Create a new task",
  description: "Create a task. If assignToMe is true, assigns the task to the current user.",
  security: [{ sessionCookie: [] }],
  request: { body: { content: { "application/json": { schema: taskCreateSchema } } } },
  responses: {
    201: {
      description: "Task created",
      content: { "application/json": { schema: taskItemSchema } },
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: taskErrorSchema } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tasks/{id}",
  operationId: "getTask",
  tags: ["Tasks"],
  summary: "Get a task by ID",
  security: [{ sessionCookie: [] }],
  request: { params: taskIdParams },
  responses: {
    200: {
      description: "Task details",
      content: { "application/json": { schema: taskItemSchema } },
    },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/tasks/{id}",
  operationId: "updateTask",
  tags: ["Tasks"],
  summary: "Update a task",
  description: "Update task fields or toggle done status.",
  security: [{ sessionCookie: [] }],
  request: {
    params: taskIdParams,
    body: { content: { "application/json": { schema: taskUpdateSchema } } },
  },
  responses: {
    200: {
      description: "Task updated",
      content: { "application/json": { schema: taskItemSchema } },
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: taskErrorSchema } },
    },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/tasks/{id}",
  operationId: "deleteTask",
  tags: ["Tasks"],
  summary: "Delete a task",
  security: [{ sessionCookie: [] }],
  request: { params: taskIdParams },
  responses: {
    204: { description: "Task deleted" },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

const offerError = { content: { "application/json": { schema: taskErrorSchema } } };

registry.registerPath({
  method: "post",
  path: "/api/tasks/{id}/offer",
  operationId: "offerTask",
  tags: ["Tasks"],
  summary: "Offer an open or bidding task to an agent (human / Review Coordinator)",
  description: "Sets offeredToAgentId, offeredAt and offerExpiresAt (now + 24h), and moves the task to bidding status.",
  security: [{ sessionCookie: [] }],
  request: {
    params: taskIdParams,
    body: { content: { "application/json": { schema: offerCreateSchema } } },
  },
  responses: {
    200: {
      description: "Task offered",
      content: { "application/json": { schema: taskOfferedSchema } },
    },
    400: { description: "Validation failed, or task is not open for offers", ...offerError },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tasks/{id}/accept-offer",
  operationId: "acceptTaskOffer",
  tags: ["Tasks"],
  summary: "Accept an offered task (offered agent, authenticated via agent key)",
  description: "Verifies the offer is unexpired and addressed to the calling agent, enforces the 2 active in-progress task limit, then assigns the agent and moves the task to in_progress.",
  security: [{ agentKey: [] }],
  request: {
    params: taskIdParams,
    body: { content: { "application/json": { schema: offerAcceptSchema } } },
  },
  responses: {
    200: {
      description: "Offer accepted, task assigned",
      content: { "application/json": { schema: taskOfferedSchema } },
    },
    400: { description: "Validation failed, no offer, expired, or at task limit", ...offerError },
    401: { description: "Unauthorized / agent authentication required" },
    404: { description: "Not found" },
  },
});

export function getOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Zedu Amp API",
      version: "1.0.0",
      description: "REST API for Zedu Amp. Endpoints require an active NextAuth session unless noted.",
    },
    servers: [{ url: process.env.NEXTAUTH_URL ?? "http://localhost:3000", description: "Current environment" }],
  });
}
