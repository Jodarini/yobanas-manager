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
} from 'drizzle-orm/pg-core'
import { authenticatedRole } from 'drizzle-orm/supabase'
import { sql } from 'drizzle-orm'
import z from 'zod'

export const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
})

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
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_products_user_id').on(table.user_id),
    uniqueIndex('uq_products_sku').on(table.sku),
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
)

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
    last_sold_at: timestamp('last_sold_at', { withTimezone: true }),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_variants_product_id').on(table.productId),
    index('idx_variants_user_id').on(table.user_id),
    uniqueIndex('uq_variants_sku').on(table.sku),
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
)

export const sales = pgTable(
  'sales',
  {
    id: serial('id').primaryKey().notNull(),
    user_id: uuid('user_id').notNull(),
    status: varchar('status', { length: 32 }).notNull().default('paid'),
    total_amount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0'),
    note: text('note'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
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
)

export const saleItems = pgTable(
  'sale_items',
  {
    id: serial('id').primaryKey().notNull(),
    user_id: uuid('user_id').notNull(),
    sale_id: integer('sale_id')
      .notNull()
      .references(() => sales.id, { onDelete: 'cascade' }),
    product_variant_id: integer('product_variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull(),
    unit_price: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    line_total: numeric('line_total', { precision: 12, scale: 2 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_sale_items_sale_id').on(table.sale_id),
    index('idx_sale_items_variant_id').on(table.product_variant_id),
    index('idx_sale_items_user_id').on(table.user_id),
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
)

export const insertProductVariantSchema = z.object({
  size: z.string().min(1, 'es obligatoria').max(50),
  color: z.string().min(1, 'es obligatorio').max(50),
  stock: z.number({ message: 'debe ser número' })
    .int({ message: 'debe ser número' })
    .min(0, 'no puede ser negativo')
    .default(0),
})

export const insertProductSchema = z.object({
  title: z.string().min(1, 'es obligatorio'),
  description: z.string().optional(),
  price: z.number().positive('no puede ser negativo'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  brand: z.string().min(1, 'es obligatoria'),
  category: z.array(z.string()).min(1, 'es obligatoria'),
  variants: z.array(insertProductVariantSchema).min(1, 'es obligatoria'),
})

export type InsertProduct = z.infer<typeof insertProductSchema>
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>

export const updateProductVariantSchema = z.object({
  id: z.number().int().positive().optional(),
  size: z.string().min(1, 'es obligatoria').max(50),
  color: z.string().min(1, 'es obligatorio').max(50),
  stock: z.number({ message: 'debe ser número' })
    .int({ message: 'debe ser número' })
    .min(0, 'no puede ser negativo')
    .default(0),
  productId: z.number().int().optional(),
  user_id: z.string().uuid().optional(),
})

export const updateProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'es obligatorio'),
  description: z.string().optional(),
  price: z.number().positive('no puede ser negativo'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  brand: z.string().min(1, 'es obligatoria'),
  category: z.array(z.string()).min(1, 'es obligatoria'),
  variants: z.array(updateProductVariantSchema).min(1, 'es obligatoria'),
})


export const updateProductSchema2 = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'es obligatorio'),
  description: z.string().optional(),
  price: z.number().positive('no puede ser negativo'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  brand: z.string().min(1, 'es obligatoria'),
  category: z.array(z.string()).min(1, 'es obligatoria'),
})

export const updateVariantSchema = z.object({
  variants: z.array(
    z.object({
      id: z.number().int().positive().optional(),  // Remove the union/transform
      size: z.string().min(1, 'Tamaño es requerido').max(50),
      color: z.string().min(1, 'Color es requerido').max(50),
      stock: z.coerce.number().min(0, 'Stock no puede ser negativo'),
    })
  ),
  productSKU: z.string().optional(),
});

export const checkoutItemSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

export const checkoutPayloadSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  note: z.string().max(1000).optional(),
})

export type checkoutItem = z.infer<typeof checkoutItemSchema>

export type UpdateProduct = z.infer<typeof updateProductSchema>
export type UpdateVariant = z.infer<typeof updateVariantSchema>
export type UpdateProduct2 = z.infer<typeof updateProductSchema2>
export type UpdateProductVariant = z.infer<typeof updateProductVariantSchema>

export type Product = typeof productsTable.$inferSelect
export type ProductVariant = typeof productVariants.$inferSelect
export type ProductWithVariants = Product & { variants: ProductVariant[] }
