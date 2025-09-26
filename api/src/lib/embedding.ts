import { embed, embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db } from "../db";
import { contractChunkEmbeddings, contract } from "../db/schema";
import { cosineDistance, desc, gt, sql, and, eq } from "drizzle-orm";

const google = createGoogleGenerativeAI({ apiKey: Bun.env.GEMINI_API_KEY! });
const embeddingModel = google.embedding("text-embedding-004");

export function generateChunks(input: string): string[] {
  return input
    .split("\n").join(" ")
    .split(/[\.\?\!]/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);
}

export async function generateEmbeddings(
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> {
  const chunks = generateChunks(value);
  if (chunks.length === 0) return [];
  const { embeddings } = await embedMany({ model: embeddingModel, values: chunks });
  return embeddings.map((e, i) => ({ content: chunks[i]!, embedding: (e as any) as number[] }));
}

export async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.split("\n").join(" ");
  const { embedding } = await embed({ model: embeddingModel, value: input });
  return (embedding as any) as number[];
}

export async function findRelevantContent(
  ownerId: string,
  userQuery: string,
  opts?: { topK?: number; minSim?: number },
) {
  const topK = opts?.topK ?? 8;
  const minSim = opts?.minSim ?? 0.6;
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    contractChunkEmbeddings.embedding,
    userQueryEmbedded,
  )})`;
  const rows = await db
    .select({
      content: contractChunkEmbeddings.content,
      similarity,
      contractId: contractChunkEmbeddings.contractId,
      contractName: contract.name,
    })
    .from(contractChunkEmbeddings)
    .leftJoin(contract, eq(contract.id, contractChunkEmbeddings.contractId))
    .where(and(eq(contractChunkEmbeddings.ownerId, ownerId), gt(similarity, minSim)))
    .orderBy((t) => desc(t.similarity))
    .limit(topK);
  return rows;
}
