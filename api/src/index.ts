import { Hono } from "hono";
import auth from "./internal/auth/controller";
import chat from "./internal/chat/controller";
import contract from "./internal/contract/controller";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth as authLib } from "./lib/auth";

const app = new Hono<{
	Variables: {
		user: typeof authLib.$Infer.Session.user | null;
		session: typeof authLib.$Infer.Session.session | null;
	};
}>();

app.use(logger());

app.use(
	"/*",
	cors({
		origin: Bun.env.CLIENT_URL as string,
		allowHeaders: ["Content-Type", "Authorization", "User-Agent"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.use("*", async (c, next) => {
	const session = await authLib.api.getSession({ headers: c.req.raw.headers });
	if (!session) {
		c.set("user", null);
		c.set("session", null);
		return next();
	}
	c.set("user", session.user);
	c.set("session", session.session);
	return next();
});

app.get("/health", (c) => {
	return c.json({ message: "OK" });
});

app.route("/api/auth", auth);
app.route("/api/chat", chat);
app.route("/api/contract", contract);

export default {
	port: Bun.env.PORT ? Number(Bun.env.PORT) : undefined,
	idleTimeout: 60,
	fetch: app.fetch,
};
