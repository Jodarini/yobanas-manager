import { pgTable, serial, text, varchar, numeric } from "drizzle-orm/pg-core";

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
  stock: numeric("stock", { precision: 10, scale: 0 }).notNull(),
});

export type Product = typeof products.$inferInsert;
