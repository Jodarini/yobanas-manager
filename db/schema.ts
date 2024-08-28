import { pgTable, serial, text, varchar, numeric } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  phone: varchar("phone", { length: 256 }),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  price: numeric("price"),
  thumbnail: text("thumbnail"),
  tags: text("tags").array(),
  category: text("category").array(),
  stock: numeric("stock"),
});
