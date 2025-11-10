// db/seed.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { productsTable, productVariants } from './schema';
import { productsData } from './data/products';
import { buildProductSku, buildVariantSku } from './utils/sku';

const connectionString =
  'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Local-only reset
    await client`TRUNCATE TABLE sale_items, sales, product_variants, products, users RESTART IDENTITY CASCADE`;

    // 1) Compute product SKUs and insert
    const productsWithSku = productsData.map((p) => {
      const primaryCategory = p.category[0] || 'misc';
      const sku = buildProductSku({
        brand: p.brand,
        category: primaryCategory,
        model: p.title,
      });
      return { ...p, sku };
    });

    const inserted = await db
      .insert(productsTable)
      .values(productsWithSku)
      .returning({
        id: productsTable.id,
        sku: productsTable.sku,
        title: productsTable.title,
      });

    console.log('Inserted products:', inserted);

    // 2) Build authoritative maps from DB
    const idBySku = new Map(inserted.map((r) => [r.sku, r.id]));
    const skuByTitle = new Map(inserted.map((r) => [r.title, r.sku]));

    // Guarded resolvers
    const mustSkuByTitle = (title: string) => {
      const sku = skuByTitle.get(title);
      if (!sku) {
        console.error('Available titles:', Array.from(skuByTitle.keys()));
        throw new Error(`No SKU found for title: "${title}"`);
      }
      return sku;
    };
    const mustIdBySku = (sku: string) => {
      const id = idBySku.get(sku);
      if (id == null) {
        console.error('Available SKUs:', Array.from(idBySku.keys()));
        throw new Error(`No product id for SKU: "${sku}"`);
      }
      return id;
    };

    // 3) Build variants from inserted rows only
    const U = 'f2355eff-89c0-40f9-bd72-7d2d41b27ae8';
    function v(
      title: string,
      size: string,
      color: string,
      stock: number,
      sold: number
    ) {
      const productSku = mustSkuByTitle(title);
      const productId = mustIdBySku(productSku);
      const variantSku = buildVariantSku({ productSku, color, size });
      return {
        productId: productId, // ← camelCase matches schema field name
        user_id: U,
        size,
        color,
        stock,
        sold_count: sold,
        sku: variantSku,
      };
    }
    const variants = [
      v('Camiseta básica de algodón', 'S', 'blanco', 25, 5),
      v('Camiseta básica de algodón', 'M', 'blanco', 30, 7),
      v('Camiseta básica de algodón', 'L', 'negro', 20, 3),

      v('Pantalón jogger', 'S', 'gris', 15, 2),
      v('Pantalón jogger', 'M', 'negro', 18, 4),

      v('Chaqueta rompevientos', 'M', 'azul', 12, 1),
      v('Chaqueta rompevientos', 'L', 'verde', 10, 0),

      v('Zapatillas urbanas', '39', 'blanco', 8, 1),
      v('Zapatillas urbanas', '41', 'negro', 9, 2),

      v('Gorra clásica', 'U', 'negro', 40, 6),
      v('Gorra clásica', 'U', 'rojo', 25, 1),

      v('Sudadera con capucha', 'M', 'gris', 14, 2),
      v('Sudadera con capucha', 'L', 'negro', 16, 3),

      v('Camisa de lino', 'M', 'beige', 11, 0),
      v('Camisa de lino', 'L', 'blanco', 9, 1),

      v('Medias deportivas', 'U', 'blanco', 60, 10),
      v('Medias deportivas', 'U', 'negro', 55, 12),

      v('Cinturón de cuero', '90', 'marrón', 7, 0),
      v('Cinturón de cuero', '95', 'negro', 6, 0),

      v('Short deportivo', 'S', 'azul', 20, 2),
      v('Short deportivo', 'M', 'negro', 22, 1),
    ];

    // Final guard before insert
    for (const row of variants) {
      if (row.productId == null) {
        throw new Error(`Variant missing productId: ${JSON.stringify(row)}`);
      }
    }

    await db.insert(productVariants).values(variants);

    console.log('✅ ¡Seed completado exitosamente!');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await client.end();
  }
}

seed();
