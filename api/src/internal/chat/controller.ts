import { Hono } from "hono";
import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const app = new Hono();

export const maxDuration = 30;

// POST / -> streams UIMessage protocol for DefaultChatTransport
app.post("/", async (c: any) => {
	try {
		const { messages } = (await c.req.json()) as { messages: UIMessage[] };

		const apiKey = Bun.env.GEMINI_API_KEY as string | undefined;
		if (!apiKey) {
			return c.json(
				{ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY in environment" },
				500,
			);
		}

		const gemini = createGoogleGenerativeAI({ apiKey });
		const result = streamText({
			model: gemini("gemini-2.5-flash"),
			system: "You are a helpful assistant.",
			messages: convertToModelMessages(messages),
		});

		// Return as UIMessage stream so @ai-sdk/react DefaultChatTransport understands it
		return result.toUIMessageStreamResponse();
	} catch (err) {
		console.error("/api/chat error", err);
		return c.json({ error: "Failed to process chat request" }, 400);
	}
});

export default app;
