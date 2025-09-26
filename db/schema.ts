import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  real,
} from 'drizzle-orm/pg-core';
import z from 'zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
});

export const productsTable = pgTable('products', {
  id: serial('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  thumbnail: text('thumbnail'),
  brand: text('brand').notNull(),
  category: text('category').array(),
});

export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey().notNull(),
  productId: integer('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  size: varchar('size', { length: 50 }),
  color: varchar('color', { length: 50 }).notNull(),
  stock: integer('stock').notNull().default(0),
});

export type Product = typeof productsTable.$inferInsert;
export type ProductVariants = typeof productVariants.$inferInsert;
export type ProductWithVariant = {
  productInfo: Product;
  variantInfo: ProductVariants;
};

export type ProductWithVariants = {
  productInfo: Product;
  variantInfo: ProductVariants[];
};

export type SelectProduct = typeof productsTable.$inferSelect;
export type SelectProductVariants = typeof productVariants.$inferSelect;
export type SelectProductWithVariant = {
  variantInfo: SelectProductVariants;
  productInfo: SelectProduct;
};

type WithoutIds<T> = Omit<T, 'id' | 'productId'>;
export type ProductEdit = {
  variantInfo: Partial<WithoutIds<ProductVariants>>;
  productInfo: Partial<WithoutIds<Product>>;
};

export const insertProductSchema = z.object({
  productInfo: z.object({
    title: z.string().min(1, 'Debe ingresar un titulo'),
    description: z.string().optional().nullable(),
    price: z
      .number({ message: 'Debe ser un numero' })
      .positive('El precio debe ser positivo'),
    category: z
      .array(z.string())
      .min(1, 'Debe agregar al menos una categoria')
      .max(3, 'El producto debe tener maximo 3 categorias'),
    thumbnail: z
      .string()
      .url('Debe ingresar un enlace correcto')
      .optional()
      .nullable(),
    brand: z.string().min(1, 'La marca debe tener al menos un caracter'),
  }),
  variantInfo: z.object({
    size: z.string(),
    color: z.string().min(1, 'Debe agregar al menos un color'),
    stock: z
      .number({ message: 'Debe ser un numero' })
      .int()
      .nonnegative('La cantidad debe ser positiva'),
  }),
});

export const editProductSchema = z.object({
  productInfo: z.object({
    title: z.string().min(1, 'Debe ingresar un titulo').optional(),
    description: z.string().optional().nullable().optional(),
    price: z
      .number({ message: 'Debe ser un numero' })
      .positive('El precio debe ser positivo')
      .optional(),
    category: z
      .array(z.string())
      .min(1, 'Debe agregar al menos una categoria')
      .max(3, 'El producto debe tener maximo 3 categorias')
      .optional(),
    thumbnail: z
      .string()
      .url('Debe ingresar un enlace correcto')
      .optional()
      .nullable(),
    brand: z
      .string()
      .min(1, 'La marca debe tener al menos un caracter')
      .optional(),
  }),
});

export const addVariantSchema = z.object({
  id: z.number().optional(),
  variantInfo: z.object({
    size: z.string().optional(),
    color: z.string().min(1, 'Debe agregar al menos un color').optional(),
    stock: z
      .number({ message: 'Debe ser un numero' })
      .int()
      .min(0, 'La cantidad debe ser positiva')
      .default(0)
      .optional(),
  }),
});

export const deleteVariantSchema = z.object({
  id: z.number().optional(),
  variantInfo: z.object({
    size: z.string().optional(),
    color: z.string().min(1, 'Debe agregar al menos un color').optional(),
    stock: z
      .number({ message: 'Debe ser un numero' })
      .int()
      .min(0, 'La cantidad debe ser positiva')
      .default(0)
      .optional(),
  }),
});
