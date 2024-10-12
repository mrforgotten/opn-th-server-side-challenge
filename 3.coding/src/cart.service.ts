import {
  CART_ALREADY_EXIST,
  CART_ALREADY_DESTROYED,
  PRODUCT_NOT_EXIST,
  PRODUCT_ALREADY_REMOVED_FROM_CART,
} from "./cart-error-message";
import { ProductStore } from "./product";
import { Voucher } from "./voucher";

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  amount: number;
  freeAmount: number;
  totalAmount: number;
  totalPrice: number;
}

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
    // assume free product = not the product user put in cart,
    // hence no free product removable
    const prevAmount = this.productMap[id];
    if (!prevAmount) {
      throw new Error(PRODUCT_ALREADY_REMOVED_FROM_CART);
    }
    delete this.productMap[id];
    if (this.productStore.isFreebieExist(id)) {
      const freebieId = this.productStore.getFreebieByProductId(id);
      this.freeProductMap[freebieId] -= prevAmount;
      if (this.freeProductMap[freebieId] <= 0) {
        delete this.freeProductMap[freebieId];
      }
    }
  }

  getProductById(id: number): CartProduct | unknown {
    if (this.isProductExist(id)) {
      const cartProduct: CartProduct = {
        ...this.productStore.getById(id),
        amount: 0,
        freeAmount: 0,
        totalAmount: 0,
        totalPrice: 0,
      };
      if (this.productMap[id] && this.productMap[id] > 0) {
        cartProduct.amount = this.productMap[id];
      }
      if (this.freeProductMap[id] && this.freeProductMap[id] > 0) {
        cartProduct.freeAmount = this.freeProductMap[id];
      }
      cartProduct.totalAmount = cartProduct.amount + cartProduct.freeAmount;
      cartProduct.totalPrice = cartProduct.amount * cartProduct.price;
    }
    return;
  }

  listAllProduct(): CartProduct[] {
    const calculatedProductMap: { [productId: number]: CartProduct } = {};
    for (const key in this.productMap) {
      const productId = parseInt(key);
      if (!calculatedProductMap[productId] && this.productMap[productId] > 0) {
        calculatedProductMap[productId] = {
          ...this.productStore.getById(productId),
          amount: 0,
          freeAmount: 0,
          totalAmount: 0,
          totalPrice: 0,
        };
      }
      const amount = this.productMap[productId];
      calculatedProductMap[productId].amount += amount;
      calculatedProductMap[productId].totalAmount += amount;
      calculatedProductMap[productId].totalPrice =
        calculatedProductMap[productId].amount *
        calculatedProductMap[productId].price;
    }
    for (const key in this.freeProductMap) {
      const productId = parseInt(key);
      if (
        !calculatedProductMap[productId] &&
        this.freeProductMap[productId] > 0
      ) {
        calculatedProductMap[productId] = {
          ...this.productStore.getById(productId),
          amount: 0,
          freeAmount: 0,
          totalAmount: 0,
          totalPrice: 0,
        };
      }
      const amount = this.freeProductMap[productId];
      calculatedProductMap[productId].freeAmount += amount;
      calculatedProductMap[productId].totalAmount += amount;
    }

    return Object.values(calculatedProductMap);
  }

  isCartEmpty(): boolean {
    const allAmount = [
      ...Object.values(this.freeProductMap),
      ...Object.values(this.productMap),
    ];
    for (const amount of allAmount) {
      if (amount > 0) {
        return false;
      }
    }
    return true;
  }

  isProductExist(id: number): boolean {
    if (
      (this.productMap[id] && this.productMap[id] > 0) ||
      (this.freeProductMap[id] && this.freeProductMap[id] > 0)
    ) {
      return true;
    }

    return false;
  }

  getCountUniqueProduct(): number {
    return this.listAllProduct().length;
  }

  getTotalAmount(): number {
    const allAmount = [
      ...Object.values(this.freeProductMap),
      ...Object.values(this.productMap),
    ];

    return allAmount.reduce((acc, amount) => {
      acc = amount > 0 ? amount : 0;
      return acc;
    }, 0);
  }
}
