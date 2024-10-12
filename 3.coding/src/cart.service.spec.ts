import {
  CART_ALREADY_DESTROYED,
  CART_ALREADY_EXIST,
} from "./cart-error-message";
import { CartService } from "./cart.service";
import { ProductAdd, ProductStore } from "./product";

const ProductList: ProductAdd[] = [
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
const freebieList: { productId: number; freebieId: number }[] = [
  {
    productId: 6,
    freebieId: 5,
  },
  {
    productId: 7,
    freebieId: 1,
  },
];

function mockProduct(): ProductStore {
  const productStore: ProductStore = new ProductStore();
  for (const p of ProductList) {
    productStore.add(p);
  }
  for (const f of freebieList) {
    productStore.addFreebie(f.productId, f.freebieId);
  }

  return productStore;
}

const mockedProductStore = mockProduct();

function mockCartService(): CartService {
  const cartService = new CartService(Object.create(mockedProductStore));
  return cartService;
}

describe("Test cart service", () => {
  let service: CartService;
  beforeEach(() => {
    service = mockCartService();
  });

  describe("Test create and destroy", () => {
    const testCases: {
      case: number;
      input: () => void;
      expect: Error | null;
    }[] = [
      {
        case: 1,
        input: () => {
          service.create();
        },
        expect: null,
      },
      {
        case: 2,
        input: () => {
          service.create();
          service.create();
        },
        expect: new Error(CART_ALREADY_EXIST),
      },
      {
        case: 3,
        input: () => {
          service.create();
          service.destroy();
        },
        expect: null,
      },
      {
        case: 4,
        input: () => {
          service.destroy();
        },
        expect: new Error(CART_ALREADY_DESTROYED),
      },
      {
        case: 5,
        input: () => {
          service.create();
          service.destroy();
          service.destroy();
        },
        expect: new Error(CART_ALREADY_DESTROYED),
      },
    ];
    testCases.forEach((testCase) => {
      test(`case: ${testCase.case}`, () => {
        if (testCase.expect) {
          expect(testCase.input).toThrow(testCase.expect);
        } else {
          expect(testCase.input).not.toThrow();
        }
      });
    });
  });

  describe("Test add product, list product, update product, and remove product", () => {
    beforeEach(() => {
      service.create();
    });
    test("Add product and check if exist", () => {
      service.addProductToCart(1, 1);
      expect(service.isProductExist(1)).toBe(true);
    });

    test("Add product with negative and check if exist", () => {
      service.addProductToCart(1, -1);
      expect(service.isProductExist(1)).toBe(false);
      service.addProductToCart(1, 0);
      expect(service.isProductExist(1)).toBe(false);
      service.addProductToCart(1, 1);
      expect(service.isProductExist(1)).toBe(true);
    });

    test("List product", () => {
      const expectation = [
        {
          id: 1,
          name: "Product 1",
          price: 10,
          amount: 2,
          freeAmount: 0,
          totalAmount: 2,
          totalPrice: 20,
        },
        {
          id: 2,
          name: "Product 2",
          price: 50,
          amount: 1,
          freeAmount: 0,
          totalAmount: 1,
          totalPrice: 50,
        },
      ];
      service.addProductToCart(1, 1);
      service.addProductToCart(1, -1);
      service.addProductToCart(1, 1);
      service.addProductToCart(2, 1);
      const list = service.listAllProduct();

      for (const elem of expectation) {
        expect(list).toEqual(
          expect.arrayContaining([expect.objectContaining(elem)])
        );
      }
    });
  });
});
