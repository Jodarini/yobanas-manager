import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  uuid,
  pgPolicy,
  timestamp,
  numeric,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';
import { sql } from 'drizzle-orm';
import z from 'zod';
import { createSelectSchema } from 'drizzle-zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
});

export const productsTable = pgTable(
  'products',
  {
    id: serial('id').primaryKey().notNull(),
    sku: text('sku').notNull(),
    user_id: uuid('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    price: numeric('price', { precision: 12, scale: 2 }).notNull(),
    thumbnail: text('thumbnail'),
    brand: text('brand').notNull(),
    category: text('category').array().notNull(),
    stock: integer('stock').default(0),
    sold_count: integer('sold_count').notNull().default(0),
    last_sold_at: timestamp('last_sold_at', {
      withTimezone: true,
      mode: 'string',
    }),
    deleted_at: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    index('idx_products_user_id').on(table.user_id),
    index('idx_products_created_at').on(table.created_at),
    index('idx_products_user_created').on(table.user_id, table.created_at),
    uniqueIndex('uq_products_user_sku').on(table.user_id, table.sku),
    pgPolicy('users_select_own_products', {
      as: 'permissive',
      for: 'select',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_insert_own_products', {
      as: 'permissive',
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_update_own_products', {
      as: 'permissive',
      for: 'update',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
      withCheck: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_delete_own_products', {
      as: 'permissive',
      for: 'delete',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
    }),
  ]
);

export const productVariants = pgTable(
  'product_variants',
  {
    id: serial('id').primaryKey().notNull(),
    sku: text('sku').notNull(),
    productId: integer('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id').notNull(),
    size: varchar('size', { length: 50 }).notNull(),
    color: varchar('color', { length: 50 }).notNull(),
    stock: integer('stock').notNull().default(0),
    sold_count: integer('sold_count').notNull().default(0),
    last_sold_at: timestamp('last_sold_at', {
      withTimezone: true,
      mode: 'string',
    }),
    deleted_at: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index('idx_variants_product_id').on(table.productId),
    index('idx_variants_user_id').on(table.user_id),
    uniqueIndex('uq_variants_user_sku').on(table.user_id, table.sku),
    pgPolicy('users_select_own_variants', {
      as: 'permissive',
      for: 'select',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_insert_own_variants', {
      as: 'permissive',
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_update_own_variants', {
      as: 'permissive',
      for: 'update',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
      withCheck: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_delete_own_variants', {
      as: 'permissive',
      for: 'delete',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
    }),
  ]
);

export const sales = pgTable(
  'sales',
  {
    id: serial('id').primaryKey().notNull(),
    user_id: uuid('user_id').notNull(),
    status: varchar('status', { length: 32 }).notNull().default('paid'),
    total_amount: numeric('total_amount', { precision: 12, scale: 2 })
      .notNull()
      .default('0'),
    note: text('note'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    deleted_at: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index('idx_sales_user_id').on(table.user_id),
    index('idx_sales_created_at').on(table.created_at),
    pgPolicy('users_select_own_sales', {
      as: 'permissive',
      for: 'select',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_insert_own_sales', {
      as: 'permissive',
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_update_own_sales', {
      as: 'permissive',
      for: 'update',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
      withCheck: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_delete_own_sales', {
      as: 'permissive',
      for: 'delete',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
    }),
  ]
);

export const selectSaleSchema = createSelectSchema(sales);
export type Sale = z.infer<typeof selectSaleSchema>;

export const saleItems = pgTable(
  'sale_items',
  {
    id: serial('id').primaryKey().notNull(),
    user_id: uuid('user_id').notNull(),
    sale_id: integer('sale_id')
      .notNull()
      .references(() => sales.id, { onDelete: 'cascade' }),
    product_variant_id: integer('product_variant_id').references(
      () => productVariants.id,
      { onDelete: 'restrict' }
    ),
    product_id: integer('product_id').references(() => productsTable.id, {
      onDelete: 'restrict',
    }),
    quantity: integer('quantity').notNull(),
    unit_price: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    line_total: numeric('line_total', { precision: 12, scale: 2 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    deleted_at: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index('idx_sale_items_sale_id').on(table.sale_id),
    index('idx_sale_items_variant_id').on(table.product_variant_id),
    index('idx_sale_items_user_id').on(table.user_id),
    index('idx_sale_items_product_id').on(table.product_id),
    pgPolicy('users_select_own_sale_items', {
      as: 'permissive',
      for: 'select',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_insert_own_sale_items', {
      as: 'permissive',
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_update_own_sale_items', {
      as: 'permissive',
      for: 'update',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
      withCheck: sql`(select auth.uid()) = ${table.user_id}`,
    }),
    pgPolicy('users_delete_own_sale_items', {
      as: 'permissive',
      for: 'delete',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = ${table.user_id}`,
    }),
  ]
);

export const paymentSources = pgTable(
  'payment_sources',
  {
    id: serial('id').primaryKey().notNull(),
    user_id: uuid('user_id').notNull(),
    wompi_payment_source_id: integer('wompi_payment_source_id').notNull(),
    type: text('type').notNull(), // 'CARD', 'NEQUI', 'DAVIPLATA', 'BANCOLOMBIA_TRANSFER'
    status: text('status').notNull().default('AVAILABLE'), // 'AVAILABLE', 'VOIDED'

    // Optional display info from Wompi's public_data
    card_brand: text('card_brand'),
    card_last_four: text('card_last_four'),
    phone_number: text('phone_number'),

    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    index('idx_payment_sources_user_id').on(table.user_id),
    uniqueIndex('uq_payment_sources_user_wompi').on(
      table.user_id,
      table.wompi_payment_source_id
    ),
  ]
);

export const selectPaymentSourceSchema = createSelectSchema(paymentSources);
export type PaymentSource = z.infer<typeof selectPaymentSourceSchema>;

export const selectSale_items_Schema = createSelectSchema(saleItems);
export type Sale_Item = z.infer<typeof selectSale_items_Schema>;

export const insertProductVariantSchema = z.object({
  size: z.string().min(1, 'es obligatoria').max(50),
  color: z.string().min(1, 'es obligatorio').max(50),
  stock: z
    .number({ message: 'debe ser número' })
    .int({ message: 'debe ser número' })
    .min(0, 'no puede ser negativo'),
});

export const insertProductSchema = z.object({
  title: z.string().min(1, 'es obligatorio'),
  description: z.string().optional(),
  price: z.number().positive('no puede ser negativo'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  brand: z.string().min(1, 'es obligatoria'),
  category: z.array(z.string()).min(1, 'es obligatoria'),
  variants: z.array(insertProductVariantSchema).optional(),
  stock: z
    .number({ message: 'debe ser número' })
    .int({ message: 'debe ser número' })
    .min(0, 'no puede ser negativo')
    .optional(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;

export const updateProductVariantSchema = z.object({
  id: z.number().int().positive().optional(),
  size: z.string().min(1, 'es obligatoria').max(50),
  color: z.string().min(1, 'es obligatorio').max(50),
  stock: z
    .number({ message: 'debe ser número' })
    .int({ message: 'debe ser número' })
    .min(0, 'no puede ser negativo')
    .default(0),
  productId: z.number().int().optional(),
  user_id: z.string().uuid().optional(),
});

export const updateProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'es obligatorio'),
  description: z.string().optional(),
  price: z.number().positive('no puede ser negativo'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  brand: z.string().min(1, 'es obligatoria'),
  category: z.array(z.string()).min(1, 'es obligatoria'),
  variants: z.array(updateProductVariantSchema).min(1, 'es obligatoria'),
});

export const updateProductSchema2 = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'es obligatorio'),
  description: z.string().optional(),
  price: z.number().positive('no puede ser negativo'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  brand: z.string().min(1, 'es obligatoria'),
  category: z.array(z.string()).min(1, 'es obligatoria'),
  stock: z.number().positive().optional(),
});

export const updateVariantSchema = z.object({
  variants: z.array(
    z.object({
      id: z.number().int().positive().optional(),
      size: z.string().min(1, 'Tamaño es requerido').max(50),
      color: z.string().min(1, 'Color es requerido').max(50),
      stock: z.coerce.number().min(0, 'Stock no puede ser negativo'),
    })
  ),
  productSKU: z.string().optional(),
});

export const checkoutItemSchema = z
  .object({
    variantId: z.number().int().positive().optional(),
    productId: z.number().int().positive().optional(),
    quantity: z.number().int().positive(),
  })
  .refine((data) => data.variantId || data.productId, {
    message: 'Either variantId or productId must be provided',
    path: ['variantId'],
  });

export const checkoutPayloadSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  note: z.string().max(1000).optional(),
});

export type checkoutItem = z.infer<typeof checkoutItemSchema>;

export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type UpdateVariant = z.infer<typeof updateVariantSchema>;
export type UpdateProduct2 = z.infer<typeof updateProductSchema2>;
export type UpdateProductVariant = z.infer<typeof updateProductVariantSchema>;

export type Product = typeof productsTable.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductWithVariants = Product & { variants: ProductVariant[] };
