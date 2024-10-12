import { Product, ProductStore } from "./product";
import {
  FixedDiscountVoucher,
  PercentageDiscountVoucher,
  Voucher,
  VoucherStore,
} from "./voucher";

export const mockProductList: Product[] = [
  {
    id: 1,
    name: "Product 1",
    price: 10,
  },
  {
    id: 2,
    name: "Product 2",
    price: 50,
  },
  {
    id: 3,
    name: "Product 3",
    price: 200,
  },
  {
    id: 4,
    name: "Product 4",
    price: 500,
  },
  {
    id: 5,
    name: "Product 5",
    price: 25,
  },
  {
    id: 6,
    name: "Product 6",
    price: 220,
  },

  {
    id: 7,
    name: "Product 7",
    price: 1000,
  },
];
export const mockFreebieList: { productId: number; freebieId: number }[] = [
  {
    productId: 6,
    freebieId: 5,
  },
  {
    productId: 7,
    freebieId: 1,
  },
];

export const mockVoucherMap: { [x: number]: Voucher } = {
  1: new FixedDiscountVoucher("oct10", 10),
  2: new FixedDiscountVoucher("oct100", 100),
  3: new FixedDiscountVoucher("massive", 1000),
  4: new PercentageDiscountVoucher("free", 20, 20),
  5: new PercentageDiscountVoucher("free100", 100, 100),
  6: new PercentageDiscountVoucher("free50", 50, 1000),
  7: new PercentageDiscountVoucher("nodiscount", 5),
  8: new PercentageDiscountVoucher("freefortestpurpose", 100),
};

export function mockProductStore(): ProductStore {
  const store: ProductStore = new ProductStore();
  for (const p of mockProductList) {
    store.add(p);
  }
  for (const f of mockFreebieList) {
    store.addFreebie(f.productId, f.freebieId);
  }

  return store;
}

export function mockVoucherStore(): VoucherStore {
  const store: VoucherStore = new VoucherStore();
  const mockVoucherList = Object.values(mockVoucherMap);
  for (const v of mockVoucherList) {
    store.add(v);
  }
  return store;
}
