import { eq } from "drizzle-orm";
import { db } from "../../db";
import { counterParty, contract } from "../../db/schema";

export const getCounterParties = async () => {
	try {
		const counterParties = await db.select().from(counterParty);
		return counterParties;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const createCounterParty = async (name: string) => {
	try {
		const id = Bun.randomUUIDv7();
		const [counterPartyResult] = await db
			.insert(counterParty)
			.values({
				id,
				name,
			})
			.returning();
		return counterPartyResult;
	} catch (error) {
		console.error(error);
		throw error;
	}
};


export const createContractMock = async (content: any) => {
	try {
		const id = Bun.randomUUIDv7();

		const [contractResult] = await db.insert(contract).values({
			id,
			name: "Mock Contract",
			counterPartyId: "0199865b-ef15-7000-930a-f5273d1b0bc2",
			status: "Draft",
			ownerId: "M1dVCxAvPjV28VOMstVWpbxTgFkh5lRP",
			type: "BuiltIn",
			createdAt: new Date(),
			content: content,
		}).returning();

		return contractResult;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const updateContractContent = async (id: string, content: any) => {
	try {
		const [contractResult] = await db
			.update(contract)
			.set({
				content,
			})
			.where(eq(contract.id, id))
			.returning();
		return contractResult;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getContract = async (id: string) => {
	try {
		const [contractResult] = await db.select().from(contract).where(eq(contract.id, id));
		return contractResult;
	} catch (error) {
		console.error(error);
		throw error;
	}
};