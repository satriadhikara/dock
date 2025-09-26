import { db } from "../../db";
import { counterParty } from "../../db/schema";

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
