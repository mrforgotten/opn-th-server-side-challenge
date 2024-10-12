import { PRODUCT_DUPLICATE_ID } from "./product-error-message";

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface ProductAdd {
  id?: number;
  name: string;
  price: number;
}

export class ProductStore {
  private productIdMap: { [productId: number]: Product };
  private autoIncrement: number;
  private productIdFreeMap: { [productId: number]: number }; // {productId: freeProductId}
  constructor() {
    this.productIdMap = {};
    this.productIdFreeMap = {};
    this.autoIncrement = 1;
  }
  add(newProduct: ProductAdd): number {
    // case custom id
    if (newProduct.id) {
      if (this.isProductExist(newProduct.id)) {
        throw new Error(PRODUCT_DUPLICATE_ID);
      }
      const newProductId = newProduct.id;
      this.productIdMap[newProductId] = {
        ...(newProduct as Product),
      };

      return newProduct.id;
    }

    // bump autoincrement to avoid duplicate id, since there is assign id option above.
    for (; this.isProductExist(this.autoIncrement); this.autoIncrement++) {}
    newProduct.id = this.autoIncrement;

    const productId = this.autoIncrement;
    const { name, price } = newProduct;
    this.productIdMap[productId] = {
      id: productId,
      name,
      price,
    };

    return productId;
  }
  getById(id: number) {
    return this.productIdMap[id];
  }
  isProductExist(id: number): boolean {
    return this.productIdMap[id] !== undefined;
  }
  addFreebie(productId: number, freeProductId: number) {
    this.productIdFreeMap[productId] = freeProductId;
  }
  isFreebieExist(productId: number): boolean {
    return this.productIdMap[productId] !== undefined;
  }
  getFreebieByProductId(productId: number): number | undefined {
    return this.productIdFreeMap[productId];
  }
}
