import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export type AuthContext =
  | { kind: "user"; userId: string }
  | { kind: "agent"; agentId: string };

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function getAuthContext(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return {
        context: null,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }
    return { context: { kind: "user", userId }, error: null };
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const xAgentKey = req.headers.get("x-agent-key") ?? null;
  const agentKey = bearer ?? xAgentKey;

  if (agentKey) {
    const agent = await prisma.agent.findUnique({
      where: { apiKey: agentKey },
      select: { id: true },
    });
    if (agent) {
      await prisma.agent.update({
        where: { id: agent.id },
        data: { lastActiveAt: new Date() },
      });
      return { context: { kind: "agent", agentId: agent.id }, error: null };
    }
  }

  return {
    context: null,
    error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}
