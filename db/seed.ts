import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { productsTable, productVariants } from './schema';
import { productsData } from './data/products';
import { productVariantsData } from './data/variants';

const connectionString =
  'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Insertar datos
    await db.insert(productsTable).values(productsData);
    await db.insert(productVariants).values(productVariantsData);

    console.log('✅ ¡Seed completado exitosamente!');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar directamente
seed();
