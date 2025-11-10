import { pgTable, serial, text, varchar, index, uniqueIndex, foreignKey, pgPolicy, integer, uuid, timestamp, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	fullName: text("full_name"),
	phone: varchar({ length: 256 }),
});

export const productVariants = pgTable("product_variants", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	userId: uuid("user_id").notNull(),
	size: varchar({ length: 50 }).notNull(),
	color: varchar({ length: 50 }).notNull(),
	stock: integer().default(0).notNull(),
	soldCount: integer("sold_count").default(0).notNull(),
	lastSoldAt: timestamp("last_sold_at", { withTimezone: true, mode: 'string' }),
	sku: text().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_variants_product_id").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("idx_variants_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_variants_sku").using("btree", table.sku.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_variants_product_id_products_id_fk"
		}).onDelete("cascade"),
	pgPolicy("users_select_own_variants", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	pgPolicy("users_insert_own_variants", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("users_update_own_variants", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("users_delete_own_variants", { as: "permissive", for: "delete", to: ["authenticated"] }),
]);

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().notNull(),
	description: text(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	thumbnail: text(),
	brand: text().notNull(),
	category: text().array().notNull(),
	sku: text().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_products_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_products_sku").using("btree", table.sku.asc().nullsLast().op("text_ops")),
	pgPolicy("users_select_own_products", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	pgPolicy("users_insert_own_products", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("users_update_own_products", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("users_delete_own_products", { as: "permissive", for: "delete", to: ["authenticated"] }),
]);

export const saleItems = pgTable("sale_items", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	saleId: integer("sale_id").notNull(),
	productVariantId: integer("product_variant_id").notNull(),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 12, scale:  2 }).notNull(),
	lineTotal: numeric("line_total", { precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_sale_items_sale_id").using("btree", table.saleId.asc().nullsLast().op("int4_ops")),
	index("idx_sale_items_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("idx_sale_items_variant_id").using("btree", table.productVariantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.saleId],
			foreignColumns: [sales.id],
			name: "sale_items_sale_id_sales_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productVariantId],
			foreignColumns: [productVariants.id],
			name: "sale_items_product_variant_id_product_variants_id_fk"
		}).onDelete("restrict"),
	pgPolicy("users_select_own_sale_items", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	pgPolicy("users_insert_own_sale_items", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("users_update_own_sale_items", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("users_delete_own_sale_items", { as: "permissive", for: "delete", to: ["authenticated"] }),
]);

export const sales = pgTable("sales", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	status: varchar({ length: 32 }).default('paid').notNull(),
	totalAmount: numeric("total_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_sales_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_sales_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("users_select_own_sales", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	pgPolicy("users_insert_own_sales", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("users_update_own_sales", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("users_delete_own_sales", { as: "permissive", for: "delete", to: ["authenticated"] }),
]);
