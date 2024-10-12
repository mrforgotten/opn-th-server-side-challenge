import {
  CART_ALREADY_EXIST,
  CART_ALREADY_DESTROYED,
  PRODUCT_NOT_IN_CART,
  VOUCHER_NOT_IN_CART,
  PRODUCT_NOT_EXIST,
} from "./cart-error-message";
import { ProductStore } from "./product";
import { Voucher, VoucherStore } from "./voucher";

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
  private freeProductMap: { [freebieProductId: number]: number };
  private voucherMap: { [voucherName: string]: Voucher };
  constructor(
    private productStore: ProductStore,
    private voucherStore: VoucherStore
  ) {
    this.isDestroy = true;
  }

  validateCartNotDestroyed() {
    if (this.isDestroy) {
      throw new Error(CART_ALREADY_DESTROYED);
    }
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
    this.validateCartNotDestroyed();
    this.isDestroy = true;
    delete this.productMap;
    delete this.freeProductMap;
    delete this.voucherMap;
  }

  addProductToCart(id: number, amount: number = 0) {
    this.validateCartNotDestroyed();

    if (!this.productStore.isProductExist(id)) {
      throw new Error(PRODUCT_NOT_EXIST);
    }

    if (amount < 0) {
      amount = 0;
    }

    if (this.productMap[id] === undefined) {
      this.productMap[id] = 0;
    }

    this.productMap[id] += amount;

    if (this.productStore.isFreebieExist(id)) {
      const freeProductId = this.productStore.getFreebieByProductId(id);
      if (!this.freeProductMap[freeProductId]) {
        this.freeProductMap[freeProductId] = 0;
      }
      this.freeProductMap[freeProductId] += amount;
    }
  }

  updateProduct(id: number, amount: number = 0) {
    this.validateCartNotDestroyed();
    if (!this.productStore.isProductExist(id)) {
      throw new Error(PRODUCT_NOT_EXIST);
    }
    const prevAmount = this.productMap[id] ?? 0;
    if (amount < 0) {
      amount = 0;
    }

    this.productMap[id] = amount;
    if (this.productStore.isFreebieExist(id)) {
      const freeProductId = this.productStore.getFreebieByProductId(id);
      if (!this.freeProductMap[freeProductId]) {
        this.freeProductMap[freeProductId] = 0;
      }

      this.freeProductMap[freeProductId] =
        this.freeProductMap[freeProductId] - (prevAmount - amount);
    }
  }

  removeProductFromCart(id: number) {
    this.validateCartNotDestroyed();
    // assume free product = not the product user put in cart,
    // hence no free product removable
    const prevAmount = this.productMap[id];
    if (!prevAmount) {
      throw new Error(PRODUCT_NOT_IN_CART);
    }
    delete this.productMap[id];
    if (this.productStore.isFreebieExist(id)) {
      const freebieProductId = this.productStore.getFreebieByProductId(id);
      this.freeProductMap[freebieProductId] -= prevAmount;
      if (this.freeProductMap[freebieProductId] <= 0) {
        delete this.freeProductMap[freebieProductId];
      }
    }
  }

  getProductById(id: number): CartProduct | unknown {
    this.validateCartNotDestroyed();
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
    this.validateCartNotDestroyed();
    const calculatedProductMap: { [productId: number]: CartProduct } = {};
    for (const key in this.productMap) {
      const productId = parseInt(key);
      if (!calculatedProductMap[productId]) {
        if (this.productMap[productId] <= 0) {
          continue;
        }
        calculatedProductMap[productId] = {
          ...this.productStore.getById(productId),
          amount: 0,
          freeAmount: 0,
          totalAmount: 0,
          totalPrice: 0,
        };
      }
      const productAmount = this.productMap[productId];
      calculatedProductMap[productId].amount += productAmount;
      calculatedProductMap[productId].totalAmount += productAmount;
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
    this.validateCartNotDestroyed();
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
    this.validateCartNotDestroyed();
    if (
      (this.productMap[id] && this.productMap[id] > 0) ||
      (this.freeProductMap[id] && this.freeProductMap[id] > 0)
    ) {
      return true;
    }

    return false;
  }

  getCountUniqueProduct(): number {
    this.validateCartNotDestroyed();
    return this.listAllProduct().length;
  }

  getTotalQuantity(): number {
    this.validateCartNotDestroyed();
    const allAmount = [
      ...Object.values(this.freeProductMap),
      ...Object.values(this.productMap),
    ];
    return allAmount.reduce((acc, amount) => {
      acc += amount > 0 ? amount : 0;
      return acc;
    }, 0);
  }

  getTotalPrice(): number {
    this.validateCartNotDestroyed();
    const allProductId = Object.keys(this.productMap);
    let totalPrice = 0;
    for (
      let i = 0;
      i < allProductId.length && this.productMap[allProductId[i]] > 0;
      i++
    ) {
      const productId = parseInt(allProductId[i]);
      const product = this.productStore.getById(productId);
      totalPrice += product.price * this.productMap[productId];
    }

    return totalPrice;
  }

  getTotalAmount(): number {
    this.validateCartNotDestroyed();
    const allVoucher = Object.values(this.voucherMap);
    let totalAmount = this.getTotalPrice();
    if (allVoucher.length === 0) {
      return totalAmount;
    }

    // apply high fix first, low fix later, then low maxDiscount to high
    allVoucher.sort((a, b): number => {
      if (a.type === "fixed" && b.type === "fixed") {
        return b.discountAmount - a.discountAmount;
      } else if (a.type === "fixed" && b.type === "percentage") {
        return -1;
      } else if (a.type === "percentage" && b.type === "fixed") {
        return 1;
      }
      return a["maxDiscount"] - b["maxDiscount"];
    });

    for (const voucher of allVoucher) {
      totalAmount = voucher.apply(totalAmount);
      if (totalAmount === 0) {
        return 0;
      }
    }
    return totalAmount;
  }

  applyVoucher(name: string) {
    name = name.toLocaleLowerCase();
    this.validateCartNotDestroyed();
    if (this.voucherMap[name]) {
      return;
    }

    const voucher = this.voucherStore.getVoucherByName(name);

    if (!voucher) {
      throw new Error(VOUCHER_NOT_IN_CART);
    }
    this.voucherMap[voucher.name] = voucher;
  }

  listAllVoucherName() {
    this.validateCartNotDestroyed();
    return Object.keys(this.voucherMap);
  }

  removeVoucher(name: string) {
    name = name.toLocaleLowerCase();
    this.validateCartNotDestroyed();
    if (!this.voucherMap[name]) {
      throw new Error(VOUCHER_NOT_IN_CART);
    }
    delete this.voucherMap[name];
  }
}
