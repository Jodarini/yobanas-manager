export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[P]>
    : T[P];
};

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface NewProductWithVariant {
  productInfo: Omit<Product, 'variants'>;
  variantInfo: Omit<ProductVariants, 'id' | 'productId'>;
}
// export interface Product {
//   id?: number;
//   title: string;
//   description: string;
//   category: string[];
//   price: number;
//   // stock: number;
//   tags?: string[];
//   brand: string;
//   thumbnail: string;
//   variants: Product_Variant
// }
//
// export interface Product_Variant {
//   size: string;
//   color: string
//   stock: number
// }

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Meta {
  createdAt: Date;
  updatedAt: Date;
  barcode: string;
  qrCode: string;
}

export interface Review {
  rating: number;
  comment: string;
  date: Date;
  reviewerName: string;
  reviewerEmail: string;
}
