import { Hono } from "hono";
import {
	createContractMock,
	createCounterParty,
	deleteContracts,
	getContract,
	getContracts,
	getCounterParties,
	updateContractContent,
} from "./service";

const app = new Hono();

app.get("/", async (c) => {
	try {
		const contracts = await getContracts();
		return c.json(contracts);
	} catch (_error) {
		return c.json({ error: "Failed to get contracts" }, 500);
	}
});

app.get("/counter-parties", async (c) => {
	try {
		const counterParties = await getCounterParties();
		return c.json(counterParties);
	} catch (_error) {
		return c.json({ error: "Failed to get counter parties" }, 500);
	}
});

app.post("/counter-parties", async (c) => {
	const { name } = await c.req.json();
	try {
		const counterParty = await createCounterParty(name);
		return c.json(counterParty);
	} catch (_error) {
		return c.json({ error: "Failed to create counter party" }, 500);
	}
});

app.post("/mock", async (c) => {
	const { name, content, counterPartyId } = await c.req.json<{
		name?: string;
		content?: unknown;
		counterPartyId?: string;
	}>();

	if (!name || typeof name !== "string") {
		return c.json({ error: "Contract name is required" }, 400);
	}

	if (!counterPartyId || typeof counterPartyId !== "string") {
		return c.json({ error: "counterPartyId is required" }, 400);
	}
	try {
		const contract = await createContractMock(name, counterPartyId, content);
		return c.json(contract);
	} catch (_error) {
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
	} catch (_error) {
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
	} catch (_error) {
		return c.json({ error: "Failed to update contract content" }, 500);
	}
});

app.delete("/", async (c) => {
	const body = await c.req.json<{ ids?: string[] }>();
	const ids = Array.isArray(body.ids) ? body.ids : [];
	try {
		await deleteContracts(ids);
		return c.json({ success: true });
	} catch (_error) {
		return c.json({ error: "Failed to delete contracts" }, 500);
	}
});

export default app;
