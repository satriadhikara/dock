import { Hono } from "hono";
import { createCounterParty, getCounterParties } from "./service";

const app = new Hono();

app.get("/counter-parties", async (c) => {
	try {
		const counterParties = await getCounterParties();
		return c.json(counterParties);
	} catch (error) {
		return c.json({ error: "Failed to get counter parties" }, 500);
	}
});

app.post("/counter-parties", async (c) => {
	const { name } = await c.req.json();
	try {
		const counterParty = await createCounterParty(name);
		return c.json(counterParty);
	} catch (error) {
		return c.json({ error: "Failed to create counter party" }, 500);
	}
});

export default app;
