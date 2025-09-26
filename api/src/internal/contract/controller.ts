import { Hono } from "hono";
import {
	createContractMock,
	createCounterParty,
	getContract,
	getCounterParties,
	updateContractContent,
} from "./service";

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

app.post("/mock", async (c) => {
	const { name, content } = await c.req.json();
	try {
		const contract = await createContractMock(name, content);
		return c.json(contract);
	} catch (error) {
		return c.json({ error: "Failed to create mock contract" }, 500);
	}
});

app.get("/:id", async (c) => {
	const { id } = c.req.param();
	try {
		const contract = await getContract(id);
		if (!contract) {
			return c.json({ error: "Contract not found" }, 404);
		}
		return c.json(contract);
	} catch (error) {
		return c.json({ error: "Failed to get contract" }, 500);
	}
});

app.put("/:id/content", async (c) => {
	const { id } = c.req.param();
	const { content } = await c.req.json();
	try {
		const contract = await updateContractContent(id, content);
		if (!contract) {
			return c.json({ error: "Contract not found" }, 404);
		}
		return c.json(contract);
	} catch (error) {
		return c.json({ error: "Failed to update contract content" }, 500);
	}
});

export default app;
