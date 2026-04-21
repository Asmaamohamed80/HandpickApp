CREATE TABLE "product_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"reviewerName" varchar(120) NOT NULL,
	"reviewerEmail" varchar(320),
	"rating" numeric(2, 1) NOT NULL,
	"comment" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" varchar(120) NOT NULL;