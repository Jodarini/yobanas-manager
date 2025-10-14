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
  variantInfo: ProductVariants[];
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
    description: z.string({ message: 'Su producto debe tener una descripción' }),
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

export type InsertProduct = z.infer<typeof insertProductSchema>;

export const editProductSchema2 = z.object({
  productInfo: z.object({
    id: z.number().min(1, 'Ingrese un ID'),
    title: z.string().min(1, 'Debe ingresar un nombre'),
    description: z.string().optional().nullable(),
    category: z
      .array(z.string())
      .min(1, 'Debe agregar al menos una categoria')
      .max(3, 'El producto debe tener maximo 3 categorias')
      .optional(),
    price: z
      .number({ message: 'Debe ser un numero' })
      .positive('El precio debe ser positivo'),
    brand: z.string().min(1, 'La marca debe tener al menos un caracter'),
  }),
  variantInfo: z
    .array(
      // Changed to array
      z.object({
        id: z.number().optional(), // Add id field
        size: z.string().min(1, 'Debe ingresar el tamaño'),
        color: z.string().min(1, 'Debe ingresar el color'),
        stock: z.coerce // Add coerce for number inputs
          .number({ message: 'Debe ser un numero' })
          .int()
          .nonnegative('La cantidad debe ser positiva'),
      })
    )
    .min(1, 'Debe tener al menos una variante'), // Require at least 1 variant
});

const productInfoNoId = z.object({
  ...editProductSchema2.shape.productInfo.shape,
});

export const addProductSchema = editProductSchema2.extend({
  productInfo: productInfoNoId.omit({ id: true }),
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
  id: z.number(),
  size: z.string(),
  color: z.string().min(1, 'Debe agregar al menos un color'),
});
