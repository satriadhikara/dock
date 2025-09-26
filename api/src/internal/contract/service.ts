import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { contract, counterParty, user } from "../../db/schema";

export const getContracts = async () => {
	try {
		const contracts = await db
			.select({
				id: contract.id,
				name: contract.name,
				status: contract.status,
				createdAt: contract.createdAt,
				type: contract.type,
				startedAt: contract.startedAt,
				initialEndDate: contract.initialEndDate,
				ownerId: contract.ownerId,
				ownerName: user.name,
				ownerImage: user.image,
				counterPartyId: contract.counterPartyId,
				counterPartyName: counterParty.name,
			})
			.from(contract)
			.leftJoin(counterParty, eq(contract.counterPartyId, counterParty.id))
			.leftJoin(user, eq(contract.ownerId, user.id))
			.orderBy(desc(contract.createdAt));
		return contracts;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

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

export const createContractMock = async (
	name: string,
	counterPartyId: string,
	content: unknown,
) => {
	try {
		const id = Bun.randomUUIDv7();

		const [contractResult] = await db
			.insert(contract)
			.values({
				id,
				name,
				counterPartyId,
				status: "Draft",
				ownerId: "M1dVCxAvPjV28VOMstVWpbxTgFkh5lRP",
				type: "BuiltIn",
				createdAt: new Date(),
				content: content,
			})
			.returning();

		return contractResult;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const updateContractContent = async (id: string, content: unknown) => {
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
		const [contractResult] = await db
			.select()
			.from(contract)
			.where(eq(contract.id, id));
		return contractResult;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteContracts = async (ids: string[]) => {
	if (ids.length === 0) {
		return [] as { id: string }[];
	}

	try {
		const deletedContracts = await db
			.delete(contract)
			.where(inArray(contract.id, ids))
			.returning({ id: contract.id });
		return deletedContracts;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
