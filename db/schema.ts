import {
  pgTable,
  serial,
  text,
  varchar,
  numeric,
  integer,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
});

export const productsTable = pgTable('products', {
  id: serial('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  thumbnail: text('thumbnail'),
  brand: text('brand').notNull(),
  tags: text('tags').array(),
  category: text('category').array(),
});

export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey().notNull(),
  productId: integer('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  size: varchar('size'), // e.g., 'L', '10', 'M'
  color: varchar('color', { length: 50 }).notNull(), // e.g., 'red', 'blue'
  stock: integer('stock').notNull().default(0),
});

export type Product = typeof productsTable.$inferInsert;
export type ProductVariants = typeof productVariants.$inferInsert;
export type ProductWithVariant = {
  variantInfo: ProductVariants;
  productInfo: Product;
};
