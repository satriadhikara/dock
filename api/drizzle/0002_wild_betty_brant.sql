CREATE TABLE "contract_contributor" (
	"id" text PRIMARY KEY NOT NULL,
	"contract_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contract" ADD COLUMN "signage_date" timestamp;--> statement-breakpoint
ALTER TABLE "contract_contributor" ADD CONSTRAINT "contract_contributor_contract_id_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_contributor" ADD CONSTRAINT "contract_contributor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;