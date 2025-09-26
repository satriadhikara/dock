import { embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { contract, contractChunkEmbeddings } from "../../db/schema";

// Simple text chunker by characters with small overlap
function chunkText(input: string, chunkSize = 800, overlap = 120) {
  const chunks: string[] = [];
  let i = 0;
  const n = input.length;
  while (i < n) {
    const end = Math.min(i + chunkSize, n);
    chunks.push(input.slice(i, end));
    if (end === n) break;
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return chunks;
}

// Build descriptive text for a contract row
function contractToText(row: typeof contract.$inferSelect) {
  const pieces: string[] = [];
  pieces.push(`Contract: ${row.name}`);
  pieces.push(`Status: ${row.status}`);
  if (row.startedAt) pieces.push(`Started: ${new Date(row.startedAt).toISOString()}`);
  if (row.initialEndDate)
    pieces.push(`Initial End: ${new Date(row.initialEndDate).toISOString()}`);
  if (row.content) {
    try {
      // Keep it compact but searchable
      pieces.push(`Content JSON: ${JSON.stringify(row.content)}`);
    } catch {
      // ignore
    }
  }
  return pieces.join("\n");
}

// Memory-mode ingestion and retrieval removed; using DB-backed embeddings only.

// Ingest contracts into pgvector table for persistent retrieval
export async function ingestContractsForOwnerToDb(ownerId: string) {
  const apiKey = Bun.env.GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY in environment");

  const rows = await db.select().from(contract).where(eq(contract.ownerId, ownerId));
  if (rows.length === 0) return { inserted: 0, contracts: 0 } as const;

  const records: { ownerId: string; contractId: string; content: string }[] = [];
  for (const row of rows) {
    const text = contractToText(row);
    const parts = chunkText(text);
    for (const p of parts) {
      records.push({ ownerId, contractId: row.id, content: p });
    }
  }

  if (records.length === 0) return { inserted: 0, contracts: rows.length } as const;

  const google = createGoogleGenerativeAI({ apiKey });
  const { embeddings } = await embedMany({
    model: google.embedding("text-embedding-004"),
    values: records.map((r) => r.content),
  });

  await db.insert(contractChunkEmbeddings).values(
    records.map((r, i) => ({
      ownerId: r.ownerId,
      contractId: r.contractId,
      content: r.content,
      embedding: (embeddings[i] as unknown as number[]) ?? [],
    })),
  );

  return { inserted: records.length, contracts: rows.length } as const;
}
