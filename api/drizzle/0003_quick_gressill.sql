CREATE TABLE "contract_chunk_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"contract_id" text,
	"content" text NOT NULL,
	"embedding" vector(768) NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contract_chunk_embeddings" ADD CONSTRAINT "contract_chunk_embeddings_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contract_chunk_embeddings_hnsw" ON "contract_chunk_embeddings" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "contract_chunk_embeddings_owner_idx" ON "contract_chunk_embeddings" USING btree ("owner_id");