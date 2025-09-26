import {
	pgTable,
	text,
	timestamp,
	boolean,
	pgEnum,
	jsonb,
	varchar,
	serial,
	vector,
	index,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
		.notNull(),
});

export const contractTypeEnum = pgEnum("contract_type", [
	"BuiltIn",
	"Imported",
]);

export const contractStatusEnum = pgEnum("status", [
	"Draft",
	"On Review",
	"Negotiating",
	"Active",
	"Signed",
	"Finished",
]);

export const counterParty = pgTable("counter_party", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email"),
	phone: text("phone"),
	address: text("address"),
});

export const contract = pgTable("contract", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	counterPartyId: text("counter_party_id")
		.notNull()
		.references(() => counterParty.id, { onDelete: "cascade" }),
	status: contractStatusEnum().notNull(),
	ownerId: text("owner_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	type: contractTypeEnum("type").notNull(),
	createdAt: timestamp("created_at")
		.notNull()
		.$defaultFn(() => new Date()),
	startedAt: timestamp("started_at"),
	initialEndDate: timestamp("initial_end_date"),
	content: jsonb("content"),
});

export const contractAsset = pgTable("contract_asset", {
	id: text("id").primaryKey(),
	contractId: text("contract_id")
		.notNull()
		.references(() => contract.id, { onDelete: "cascade" }),
	storageKey: text("storage_key").notNull(),
	fileName: text("file_name").notNull(),
	mimeType: varchar("mime_type", { length: 255 }).notNull(),
	size: text("size"),
	createdAt: timestamp("created_at")
		.notNull()
		.$defaultFn(() => new Date()),
});

// Embeddings for RAG (pgvector-backed). Dimensions match Gemini text-embedding-004 (768)
export const contractChunkEmbeddings = pgTable(
	"contract_chunk_embeddings",
	{
		id: serial("id").primaryKey(),
		ownerId: text("owner_id").notNull(),
		contractId: text("contract_id").references(() => contract.id, {
			onDelete: "cascade",
		}),
		content: text("content").notNull(),
		embedding: vector("embedding", { dimensions: 768 }).notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(table) => [
		index("contract_chunk_embeddings_hnsw")
			.using("hnsw", table.embedding.op("vector_cosine_ops")),
		index("contract_chunk_embeddings_owner_idx").on(table.ownerId),
	],
);
