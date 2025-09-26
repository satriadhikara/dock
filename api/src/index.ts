import { Hono } from "hono";
import auth from "./internal/auth/controller";
import chat from "./internal/chat/controller";
import { cors } from "hono/cors";
import { auth as authLib } from "./lib/auth";

const app = new Hono<{
	Variables: {
		user: typeof authLib.$Infer.Session.user | null;
		session: typeof authLib.$Infer.Session.session | null;
	};
}>();

app.use(
	"/*",
	cors({
		origin: Bun.env.CLIENT_URL as string,
		allowHeaders: ["Content-Type", "Authorization"],
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

export default {
	port: Bun.env.PORT,
	fetch: app.fetch,
};
