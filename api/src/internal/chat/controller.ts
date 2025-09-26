import { Hono } from "hono";
import { streamText, type UIMessage, convertToModelMessages, tool, stepCountIs } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ingestContractsForOwnerToDb } from "./rag";
import { z } from "zod";
import { createResource } from "../../lib/actions/resources";
import { findRelevantContent } from "../../lib/embedding";

const app = new Hono();

// export const maxDuration = 30;

// POST / -> streams UIMessage protocol for DefaultChatTransport
app.post("/", async (c: any) => {
	try {
		const { messages } = (await c.req.json()) as { messages: UIMessage[] };

		const user = (c.var?.user as { id: string } | null) ?? null;
		const ownerId = user?.id ?? "test-user"; // fallback owner for unauthenticated testing

		const apiKey = Bun.env.GEMINI_API_KEY as string | undefined;
		if (!apiKey) {
			return c.json(
				{ error: "Missing GEMINI_API_KEY in environment" },
				500,
			);
		}

			const gemini = createGoogleGenerativeAI({ apiKey });
				const uiMessages = normalizeToUiMessages(messages as any[]);
					const result = streamText({
				model: gemini("gemini-2.5-flash"),
					messages: convertToModelMessages(uiMessages),
				stopWhen: stepCountIs(5),
						system: [
							"You are a helpful, precise assistant.",
							"Rules:",
							"- Always call tools to retrieve context before answering.",
							"- You may elaborate or summarize only using retrieved context. Do not invent new facts.",
							"- If information is partially available, answer with what is known and clearly state what is unknown.",
							"- Provide brief citations like (source: <contract name or 'resource'>) when you use specific facts.",
							"- If no relevant information is found in tool calls, respond exactly: Sorry, I don't know.",
						].join("\n"),
				tools: {
					addResource: tool({
						description:
							"add a resource to your knowledge base. If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.",
						inputSchema: z.object({ content: z.string().describe("the content or resource to add to the knowledge base") }),
						execute: async ({ content }) => createResource(ownerId, { content }),
					}),
							getInformation: tool({
						description: "get information from your knowledge base to answer questions.",
						inputSchema: z.object({ question: z.string().describe("the users question") }),
						execute: async ({ question }) => {
									const rows = await findRelevantContent(ownerId, question, { topK: 8, minSim: 0.6 });
									return rows.map((r) => ({
										content: r.content,
										similarity: r.similarity,
										contractId: r.contractId,
										contractName: r.contractName ?? undefined,
									}));
						},
					}),
				},
			});

		// Return as UIMessage stream so @ai-sdk/react DefaultChatTransport understands it
		return result.toUIMessageStreamResponse();
	} catch (err) {
		console.error("/api/chat error", err);
		return c.json({ error: "Failed to process chat request" }, 400);
	}
});

// removed custom extractor; tool calls handle retrieval

// POST /ingest -> build/update in-memory vector store from user's contracts
app.post("/ingest", async (c: any) => {
	try {
		const user = (c.var?.user as { id: string } | null) ?? null;
		const ownerId = user?.id ?? "test-user";
			const stats = await ingestContractsForOwnerToDb(ownerId);
			return c.json({ ok: true, mode: "db", ownerId, ...stats });
	} catch (err) {
		console.error("/api/chat/ingest error", err);
		return c.json({ error: "Failed to ingest" }, 400);
	}
});

// POST /resources -> add arbitrary content to knowledge base (pgvector) for current user
app.post("/resources", async (c: any) => {
	try {
		const user = (c.var?.user as { id: string } | null) ?? null;
		const ownerId = user?.id ?? "test-user";
		const body = await c.req.json();
		const schema = z.object({ content: z.string().min(1) });
		const { content } = schema.parse(body);
		const res = await createResource(ownerId, { content });
		return c.json({ ok: true, ownerId, message: res });
	} catch (err: any) {
		console.error("/api/chat/resources error", err);
		return c.json({ error: err?.message ?? "Failed to add resource" }, 400);
	}
});

export default app;

function normalizeToUiMessages(input: any[]): UIMessage[] {
	return (input ?? []).map((m: any, i: number) => {
		if (m && Array.isArray(m.parts)) return m as UIMessage;
		const content = m?.content ?? m?.text ?? "";
		const parts = Array.isArray(content)
			? content
			: typeof content === "string"
				? [{ type: "text", text: content }]
				: [];
		return {
			id: m?.id ?? String(i),
			role: m?.role ?? "user",
			parts,
		} as unknown as UIMessage;
	});
}
