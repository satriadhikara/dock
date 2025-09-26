import { z } from "zod";
import { db } from "../../db";
import { contractChunkEmbeddings } from "../../db/schema";
import { generateEmbeddings } from "../embedding";

export const insertResourceSchema = z.object({ content: z.string().min(1) });
export type NewResourceParams = z.infer<typeof insertResourceSchema>;

export async function createResource(ownerId: string, input: NewResourceParams) {
  const { content } = insertResourceSchema.parse(input);
  const vectors = await generateEmbeddings(content);
  if (vectors.length === 0) return "No content to embed.";
  await db.insert(contractChunkEmbeddings).values(
    vectors.map((v) => ({ ownerId, content: v.content, embedding: v.embedding })),
  );
  return "Resource successfully created and embedded.";
}
