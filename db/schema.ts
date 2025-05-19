import { pgTable, serial, text, varchar, numeric, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  phone: varchar("phone", { length: 256 }),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  thumbnail: text("thumbnail"),
  brand: text("brand").notNull(),
  tags: text("tags").array(),
  category: text("category").array(),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  size: varchar("size", { length: 10 }).notNull(),   // e.g., 'L', '10', 'M'
  color: varchar("color", { length: 50 }).notNull(), // e.g., 'red', 'blue'
  stock: integer("stock").notNull().default(0),
});

export type Product = typeof products.$inferInsert;
