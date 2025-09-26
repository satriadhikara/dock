CREATE TYPE "public"."status" AS ENUM('Draft', 'On Review', 'Negotiating', 'Active', 'Signed', 'Finished');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('BuiltIn', 'Imported');--> statement-breakpoint
CREATE TABLE "contract" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"counter_party_id" text NOT NULL,
	"status" "status" NOT NULL,
	"owner_id" text NOT NULL,
	"type" "contract_type" NOT NULL,
	"created_at" timestamp NOT NULL,
	"started_at" timestamp,
	"initial_end_date" timestamp,
	"content" jsonb
);
--> statement-breakpoint
CREATE TABLE "contract_asset" (
	"id" text PRIMARY KEY NOT NULL,
	"contract_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"size" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counter_party" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text
);
--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_counter_party_id_counter_party_id_fk" FOREIGN KEY ("counter_party_id") REFERENCES "public"."counter_party"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract" ADD CONSTRAINT "contract_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_asset" ADD CONSTRAINT "contract_asset_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE cascade ON UPDATE no action;