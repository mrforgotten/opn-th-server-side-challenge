import {
  CART_ALREADY_EXIST,
  CART_ALREADY_DESTROYED,
  PRODUCT_NOT_EXIST,
} from "./cart-error-message";
import { ProductStore } from "./product";
import { Voucher } from "./voucher";

export class CartService {
  private isDestroy: boolean;
  private productMap: { [productId: number]: number }; // {productId: amount}
  private freeProductMap: { [freebieId: number]: number };
  private voucherMap: { [voucherName: string]: Voucher };
  constructor(private productStore: ProductStore) {
    this.isDestroy = true;
  }

  create() {
    if (!this.isDestroy) {
      throw new Error(CART_ALREADY_EXIST);
    }
    this.isDestroy = false;
    this.productMap = {};
    this.freeProductMap = {};
    this.voucherMap = {};
  }

  destroy() {
    if (this.isDestroy) {
      throw new Error(CART_ALREADY_DESTROYED);
    }
    this.isDestroy = true;
    delete this.productMap;
    delete this.freeProductMap;
    delete this.voucherMap;
  }

  addProductToCart(id: number, amount: number = 0) {
    if (this.isDestroy) {
      throw new Error(CART_ALREADY_DESTROYED);
    }

    if (!this.productStore.isProductExist(id)) {
      throw new Error(PRODUCT_NOT_EXIST);
    }

    if (amount < 0) {
      amount = 0;
    }

    if (this.productStore.isFreebieExist(id)) {
      const freeProductId = this.productStore.getFreebieByProductId(id);
      if (!this.freeProductMap[freeProductId]) {
        this.freeProductMap[freeProductId] = 0;
      }
      this.freeProductMap[freeProductId] += amount;
    }

    if (this.productMap[id] === undefined) {
      this.productMap[id] = 0;
    }

    this.productMap[id] += amount;
  }

  updateCartProduct(id: number, amount: number = 0) {
    if (this.isDestroy) {
      throw new Error(CART_ALREADY_DESTROYED);
    }
    if (!this.productStore.isProductExist(id)) {
      throw new Error(PRODUCT_NOT_EXIST);
    }
    if (amount < 0) {
      amount = 0;
    }

    this.productMap[id] = amount;
  }

  removeProductFromCart(id: number) {
    if (this.isDestroy) {
      throw new Error(CART_ALREADY_DESTROYED);
    }
    const prevAmount = this.productMap[id];
    delete this.productMap[id];
    if (this.productStore.isFreebieExist(id)) {
      const freebieId = this.productStore.getFreebieByProductId(id);
      this.freeProductMap[freebieId] -= prevAmount;
      if (this.freeProductMap[freebieId] <= 0) {
        delete this.freeProductMap[freebieId];
      }
    }
  }

  isProductExist(id: number) {
    if (this.freeProductMap) {
    }
  }
}
