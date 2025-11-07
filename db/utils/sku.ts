// db/utils/sku.ts

// Normalize text: uppercase, remove diacritics, keep A-Z0-9 and hyphens only
export function normalizeSkuPart(input: string): string {
  return input
    .normalize('NFD') // split accents
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-') // non-alnum -> hyphen
    .replace(/^-+|-+$/g, '') // trim edge hyphens
    .replace(/-+/g, '-'); // collapse hyphens
}

// Compact code helper (e.g., take first 3 letters of a normalized word)
export function code3(input: string): string {
  const n = normalizeSkuPart(input).replace(/-/g, '');
  return n.slice(0, 3) || 'XXX';
}

// Build a product-level SKU, e.g.: YBN-TSH-CLASSIC
export function buildProductSku(params: {
  brand: string; // e.g., "Yobanas"
  category: string; // main category, e.g., "camisetas"
  model: string; // title or a shorter product name, e.g., "Camiseta básica"
}): string {
  const brand = code3(params.brand);
  const cat = code3(params.category);
  const model = normalizeSkuPart(params.model).replace(/-/g, ''); // allow longer model token
  return [brand, cat, model].filter(Boolean).join('-');
}

// Build a variant-level SKU, e.g.: YBN-TSH-CLASSIC-BLANCO-M
export function buildVariantSku(params: {
  productSku: string; // parent product SKU
  color?: string; // e.g., "blanco"
  size?: string; // e.g., "M"
}): string {
  const parts = [params.productSku];
  if (params.color) parts.push(normalizeSkuPart(params.color));
  if (params.size) parts.push(normalizeSkuPart(params.size));
  return parts.join('-');
}
