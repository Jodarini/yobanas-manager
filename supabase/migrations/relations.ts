import { relations } from "drizzle-orm/relations";
import { products, productVariants, sales, saleItems } from "./schema";

export const productVariantsRelations = relations(productVariants, ({one, many}) => ({
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id]
	}),
	saleItems: many(saleItems),
}));

export const productsRelations = relations(products, ({many}) => ({
	productVariants: many(productVariants),
}));

export const saleItemsRelations = relations(saleItems, ({one}) => ({
	sale: one(sales, {
		fields: [saleItems.saleId],
		references: [sales.id]
	}),
	productVariant: one(productVariants, {
		fields: [saleItems.productVariantId],
		references: [productVariants.id]
	}),
}));

export const salesRelations = relations(sales, ({many}) => ({
	saleItems: many(saleItems),
}));