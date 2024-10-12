import {
  CART_ALREADY_DESTROYED,
  CART_ALREADY_EXIST,
  PRODUCT_NOT_EXIST,
} from "./cart-error-message";
import { CartService } from "./cart.service";
import { Product, ProductAdd, ProductStore } from "./product";

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
];
const freebieList: { productId: number; freebieId: number }[] = [
  {
    productId: 3,
    freebieId: 1,
  },
  {
    productId: 4,
    freebieId: 2,
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

function mockCartService(): CartService {
  const mockedProductStore = mockProduct();
  const cartService = new CartService(mockedProductStore);
  return cartService;
}

const TEST_CASE_MESSAGE_BLOCK = "----";
const TEST_MESSAGE_BLOCK = "==================";

(() => {
  const cartService = mockCartService();

  const cleanCartService = (
    fn: () => void = () => {
      try {
        cartService.destroy();
      } catch (e) {}
    }
  ) => {
    fn();
  };

  function testCartCreate() {
    let isPass = true;
    cleanCartService();

    const testCases: {
      caseNumber: number;
      expect: Error | null;
      input: () => void;
    }[] = [
      {
        caseNumber: 1,
        expect: null,
        input: () => {
          cartService.create();
        },
      },
      {
        caseNumber: 2,
        expect: null,
        input: () => {
          cartService.create();
          cartService.destroy();
          cartService.create();
        },
      },
      {
        caseNumber: 3,
        expect: new Error(CART_ALREADY_EXIST),
        input: () => {
          cartService.create();
          cartService.create();
        },
      },
    ];

    console.log("Test cart create: ");

    for (const tc of testCases) {
      try {
        tc.input();
        if (tc.expect) {
          isPass = false;
          console.log(TEST_CASE_MESSAGE_BLOCK);
          console.log(
            "  case: %d\nexpect: %s\n   got: null",
            tc.caseNumber,
            tc.expect.message
          );
          console.log(TEST_CASE_MESSAGE_BLOCK);
        }
      } catch (e) {
        if (!tc.expect || tc.expect?.message !== e.message) {
          isPass = false;
          console.log(TEST_CASE_MESSAGE_BLOCK);
          console.log(
            "  case: %d\nexpect: %s\n   got: %s",
            tc.caseNumber,
            tc.expect?.message,
            e?.message
          );
          console.log(TEST_CASE_MESSAGE_BLOCK);
        }
      } finally {
        cleanCartService();
      }
    }
    console.log("Test cart create %s", isPass ? "success" : "fail");
    console.log(TEST_MESSAGE_BLOCK);
  }

  function testCartDestroy() {
    let isPass = true;
    cleanCartService();

    const testCases: {
      caseNumber: number;
      expect: Error | null;
      input: () => void;
    }[] = [
      {
        caseNumber: 1,
        expect: null,
        input: () => {
          cartService.create();
          cartService.destroy();
        },
      },
      {
        caseNumber: 2,
        expect: new Error(CART_ALREADY_DESTROYED),
        input: () => {
          cartService.destroy();
        },
      },
      {
        caseNumber: 3,
        expect: new Error(CART_ALREADY_DESTROYED),
        input: () => {
          cartService.create();
          cartService.destroy();
          cartService.destroy();
        },
      },
    ];

    console.log("Test cart destroy: ");
    for (const tc of testCases) {
      try {
        tc.input();
        if (tc.expect) {
          isPass = false;
          console.log(TEST_CASE_MESSAGE_BLOCK);
          console.log(
            "  case: %d\nexpect: %s\n   got: null",
            tc.caseNumber,
            tc.expect.message
          );
          console.log(TEST_CASE_MESSAGE_BLOCK);
        }
      } catch (e) {
        if (!tc.expect || tc.expect?.message !== e.message) {
          isPass = false;
          console.log(TEST_CASE_MESSAGE_BLOCK);
          console.log(
            "  case: %d\nexpect: %s\n   got: %s",
            tc.caseNumber,
            tc.expect?.message,
            e?.message
          );
          console.log(TEST_CASE_MESSAGE_BLOCK);
        }
      } finally {
        cleanCartService();
      }
    }
    console.log("Test cart destroy %s", isPass ? "success" : "fail");
    console.log(TEST_MESSAGE_BLOCK);
  }
  function testCartAdd() {
    const cleanFn = () => {
      try {
        cartService.destroy();
      } catch (e) {
      } finally {
        cartService.create();
      }
    };
    cleanCartService(cleanFn);
    const testCases: {
      caseNumber: number;
      expect: Error | null;
      input: () => void;
    }[] = [
      {
        caseNumber: 1,
        expect: null,
        input: () => {
          cartService.addProductToCart(1, 0);
        },
      },
      {
        caseNumber: 1,
        expect: null,
        input: () => {
          cartService.addProductToCart(1, 0);
          cartService.addProductToCart(1, 1);
        },
      },
      {
        caseNumber: 1,
        expect: new Error(PRODUCT_NOT_EXIST),
        input: () => {
          cartService.addProductToCart(-1, 0);
        },
      },
    ];

    console.log("Test cart add:");
    let isPass = true;
    for (const tc of testCases) {
      try {
        tc.input();
        if (tc.expect !== null) {
          isPass = false;
          console.log(TEST_CASE_MESSAGE_BLOCK);
          console.log(
            "  case: %d\nexpect: %s\n   got: null",
            tc.caseNumber,
            tc.expect.message
          );
          console.log(TEST_CASE_MESSAGE_BLOCK);
        }
      } catch (e) {
        if (!tc.expect || tc.expect?.message !== e.message) {
          isPass = false;
          console.log(TEST_CASE_MESSAGE_BLOCK);
          console.log(
            "  case: %d\nexpect: %s\n   got: %s",
            tc.caseNumber,
            tc.expect?.message,
            e.message
          );
          console.log(TEST_CASE_MESSAGE_BLOCK);
        }
      } finally {
        cleanCartService(cleanFn);
      }
    }
    console.log("Test cart add %s", isPass ? "success" : "fail");
    console.log(TEST_MESSAGE_BLOCK);
  }

  testCartCreate();
  testCartDestroy();
  testCartAdd();
})();
