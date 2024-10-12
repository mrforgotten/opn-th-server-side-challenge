import { before } from "node:test";
import {
  CART_ALREADY_DESTROYED,
  CART_ALREADY_EXIST,
  PRODUCT_NOT_IN_CART,
} from "./cart-error-message";
import { CartService } from "./cart.service";
import {
  mockProductStore,
  mockProductList,
  mockVoucherStore,
  mockVoucherMap,
} from "./mock";

const mockedProductStore = mockProductStore();
const mockedVoucherStore = mockVoucherStore();

function mockCartService(): CartService {
  const cartService = new CartService(
    Object.create(mockedProductStore),
    Object.create(mockedVoucherStore)
  );
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

  describe("Test utility", () => {
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

    test("Get unique item count", () => {
      expect(service.getCountUniqueProduct()).toBe(0);
      service.addProductToCart(1, 1);
      expect(service.getCountUniqueProduct()).toBe(1);

      service.updateProduct(1, -1);
      expect(service.getCountUniqueProduct()).toBe(0);

      service.addProductToCart(1, 1);
      service.addProductToCart(2, 1);
      expect(service.getCountUniqueProduct()).toBe(2);
    });

    test("Is card empty", () => {
      expect(service.isCartEmpty()).toBe(true);
      service.addProductToCart(1, 1);
      expect(service.isCartEmpty()).toBe(false);

      service.updateProduct(1, -1);
      expect(service.isCartEmpty()).toBe(true);

      service.addProductToCart(1, 1);
      service.addProductToCart(2, 1);
      expect(service.isCartEmpty()).toBe(false);

      service.updateProduct(1, -1);
      service.updateProduct(2, 0);
      expect(service.isCartEmpty()).toBe(true);
    });

    test("Get total quantity", () => {
      expect(service.getTotalQuantity()).toBe(0);
      service.addProductToCart(1, 2);
      expect(service.getTotalQuantity()).toBe(2);

      service.updateProduct(1, -1);
      expect(service.getTotalQuantity()).toBe(0);

      service.addProductToCart(1, 2);
      service.addProductToCart(2, 1);
      expect(service.getTotalQuantity()).toBe(3);
    });

    test("List product", () => {
      expect(service.listAllProduct()).toEqual([]);
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
      expect(list.length).toBe(2);
      for (const elem of expectation) {
        expect(list).toEqual(
          expect.arrayContaining([expect.objectContaining(elem)])
        );
      }
    });

    test("Update product", () => {
      service.addProductToCart(1, 1);
      expect(service.isProductExist(1)).toBe(true);

      service.addProductToCart(1, 1);
      expect(service.isProductExist(1)).toBe(true);
      expect(service.listAllProduct().length).toBe(1);

      service.updateProduct(1, -1);
      expect(service.isProductExist(1)).toBe(false);
      expect(service.listAllProduct().length).toBe(0);

      service.updateProduct(1, 11);
      expect(service.isProductExist(1)).toBe(true);
      expect(service.listAllProduct().length).toBe(1);
    });

    test("Remove product", () => {
      expect(() => service.removeProductFromCart(1)).toThrow(
        PRODUCT_NOT_IN_CART
      );

      service.addProductToCart(1, 1);
      expect(service.isProductExist(1)).toBe(true);
      expect(service.listAllProduct().length).toBe(1);

      service.removeProductFromCart(1);
      expect(service.listAllProduct().length).toBe(0);
      expect(service.isProductExist(1)).toBe(false);
    });

    test("Get total price", () => {
      expect(service.getTotalPrice()).toBe(0);
      const testProduct1 = {
        ...mockProductList[0],
      };
      const testProduct2 = {
        ...mockProductList[1],
      };
      service.addProductToCart(testProduct1.id, 1);
      expect(service.getTotalPrice()).toBe(testProduct1.price);

      service.updateProduct(testProduct1.id, 10);
      expect(service.getTotalPrice()).toBe(testProduct1.price * 10);

      service.addProductToCart(testProduct2.id, 10);
      expect(service.getTotalPrice()).toBe(
        testProduct1.price * 10 + testProduct2.price * 10
      );
    });
  });

  describe("Test Discount", () => {
    beforeEach(() => {
      service.create();
    });

    test("Get voucher", () => {
      const voucherName1 = "oct10";
      const voucherName2 = "oct100";
      expect(service.listAllVoucherName()).toEqual([]);
      service.applyVoucher(voucherName1);
      expect(service.listAllVoucherName()).toEqual([voucherName1]);

      service.applyVoucher(voucherName1);
      expect(service.listAllVoucherName()).toEqual([voucherName1]);

      service.applyVoucher(voucherName2);
      expect(service.listAllVoucherName()).toEqual(
        expect.arrayContaining([voucherName2, voucherName1])
      );
    });

    test("Remove voucher", () => {
      const voucherName1 = "oct10";
      const voucherName2 = "oct100";
      service.applyVoucher(voucherName1);
      service.removeVoucher(voucherName1);
      expect(service.listAllVoucherName()).toEqual([]);

      service.applyVoucher(voucherName1);
      service.applyVoucher(voucherName2);
      service.removeVoucher(voucherName2);
      expect(service.listAllVoucherName()).toEqual([voucherName1]);
    });

    test("Fixed voucher", () => {
      expect(service.getTotalAmount()).toEqual(0);
      service.addProductToCart(1, 1);
      expect(service.getTotalAmount()).toEqual(10);

      // fixed 10
      service.applyVoucher("oct10");
      expect(service.getTotalAmount()).toEqual(0);
      service.updateProduct(1, 2);
      expect(service.getTotalAmount()).toEqual(10);
      service.applyVoucher("oct10");
      expect(service.getTotalAmount()).toEqual(10);
      service.removeVoucher("oct10");
      expect(service.getTotalAmount()).toEqual(20);

      // fixed 100
      service.applyVoucher("oct100");
      expect(service.getTotalAmount()).toEqual(0);
    });

    test("Percentage voucher", () => {
      service.addProductToCart(1, 2);
      // 20% max 20
      service.applyVoucher("free");
      expect(service.getTotalAmount()).toEqual(16);
      service.removeVoucher("free");

      // 100% max 100
      service.applyVoucher("free100");
      expect(service.getTotalAmount()).toEqual(0);

      // price = 200
      service.updateProduct(1, 20);
      expect(service.getTotalAmount()).toEqual(100);

      // max 0
      service.applyVoucher("nodiscount");
      expect(service.getTotalAmount()).toEqual(100);

      service.applyVoucher("free");
      // service will now have free100 and free which is 100% for 100 and 20% for 20
      service.removeVoucher("free100");

      //50% max 1000
      service.applyVoucher("free50");
      // it should apply 20% for 20 first then 50% for 1000
      expect(service.getTotalAmount()).toEqual(90);
    });

    test("Mix fixed and percentage", () => {
      service.addProductToCart(1, 100); // 1000
      service.applyVoucher("oct100");
      expect(service.getTotalAmount()).toEqual(900);
      service.applyVoucher("oct10");
      expect(service.getTotalAmount()).toEqual(890);
      service.removeVoucher("oct10");

      service.applyVoucher("free50");
      expect(service.getTotalAmount()).toEqual(450);
      service.applyVoucher("oct10");
      expect(service.getTotalAmount()).toEqual(445);

      service.applyVoucher("free100");
      expect(service.getTotalAmount()).toEqual(395);
    });
  });

  describe("Test freebie", () => {
    beforeEach(() => {
      service.create();
    });

    test("add freebie", () => {
      //item 7 free item 1
      service.addProductToCart(7, 2);
      expect(service.getCountUniqueProduct()).toEqual(2);
      expect(service.getTotalQuantity()).toEqual(4);
      expect(service.getTotalAmount()).toEqual(2000);

      let expectation = [
        {
          id: 1,
          name: "Product 1",
          price: 10,
          amount: 0,
          freeAmount: 2,
          totalAmount: 2,
          totalPrice: 0,
        },
        {
          id: 7,
          name: "Product 7",
          price: 1000,
          amount: 2,
          freeAmount: 0,
          totalAmount: 2,
          totalPrice: 2000,
        },
      ];
      expect(service.listAllProduct()).toEqual(
        expect.arrayContaining([
          expect.objectContaining(expectation[0]),
          expect.objectContaining(expectation[1]),
        ])
      );

      service.addProductToCart(1, 2);
      expectation[0] = {
        ...expectation[0],
        amount: 2,
        totalAmount: 4,
        totalPrice: 20,
      };
      expect(service.listAllProduct()).toEqual(
        expect.arrayContaining([expect.objectContaining(expectation[0])])
      );
      expect(service.getCountUniqueProduct()).toEqual(2);
      expect(service.getTotalQuantity()).toEqual(6);
      expect(service.getTotalAmount()).toEqual(2020);

      service.removeProductFromCart(7);
      expect(service.getCountUniqueProduct()).toEqual(1);
      expect(service.getTotalAmount()).toEqual(20);
      let list = service.listAllProduct();
      expect(list.length).toEqual(1);
      expect(list).toEqual([
        {
          ...expectation[0],
          freeAmount: 0,
          amount: 2,
          totalAmount: 2,
          totalPrice: 20,
        },
      ]);

      service.addProductToCart(2, 1);
      expect(service.getTotalAmount()).toEqual(70);
      expect(service.getCountUniqueProduct()).toEqual(2);
      expect(service.getTotalQuantity()).toEqual(3);

      service.updateProduct(7, 1);
      expect(service.getTotalAmount()).toEqual(1070);
      expect(service.getCountUniqueProduct()).toEqual(3);
      expect(service.getTotalQuantity()).toEqual(5);
    });
  });
});

describe("Cart Scenario", () => {
  let service: CartService;
  beforeAll(() => {
    service = mockCartService();
    service.create();
  });

  it("add product", () => {
    //item 7 free item 1
    service.addProductToCart(1, 2);
    expect(service.getCountUniqueProduct()).toEqual(1);
    expect(service.getTotalQuantity()).toEqual(2);
    expect(service.getTotalAmount()).toEqual(20);
  });

  it("add product with freebie", () => {
    service.addProductToCart(7, 1);
    expect(service.getCountUniqueProduct()).toEqual(2);
    expect(service.getTotalQuantity()).toEqual(4);
    expect(service.getTotalAmount()).toEqual(1020);
  });

  it("remove product that added before getting freebie", () => {
    service.removeProductFromCart(1);
    expect(service.getCountUniqueProduct()).toEqual(2);
    expect(service.getTotalQuantity()).toEqual(2);
    expect(service.getTotalAmount()).toEqual(1000);
  });

  it("add other product", () => {
    service.addProductToCart(3, 2);
    expect(service.getCountUniqueProduct()).toEqual(3);
    expect(service.getTotalQuantity()).toEqual(4);
    expect(service.getTotalAmount()).toEqual(1400);
  });

  it("add another product with different freebie", () => {
    service.addProductToCart(6, 1);
    expect(service.getCountUniqueProduct()).toEqual(5);
    expect(service.getTotalQuantity()).toEqual(6);
    expect(service.getTotalAmount()).toEqual(1620);
  });

  it("Check list in cart", () => {
    const list = service.listAllProduct();

    let expectation = [
      {
        ...mockProductList[0],
        freeAmount: 1,
        totalAmount: 1,
        totalPrice: 0,
      },
      {
        ...mockProductList[2],
        amount: 2,
        freeAmount: 0,
        totalAmount: 2,
        totalPrice: 400,
      },
      {
        ...mockProductList[4],

        amount: 0,
        freeAmount: 1,
        totalAmount: 1,
        totalPrice: 0,
      },
      {
        ...mockProductList[5],
        amount: 1,
        freeAmount: 0,
        totalAmount: 1,
        totalPrice: 220,
      },
      {
        ...mockProductList[6],
        amount: 1,
        freeAmount: 0,
        totalAmount: 1,
        totalPrice: 1000,
      },
    ];

    expect(list.length).toEqual(expectation.length);
    for (const ex of expectation) {
      expect(list).toEqual(
        expect.arrayContaining([expect.objectContaining(ex)])
      );
    }
  });

  it("Apply voucher", () => {
    service.applyVoucher("oct10");
    expect(service.getTotalAmount()).toEqual(1610);
    service.applyVoucher("oct100");
    expect(service.getTotalAmount()).toEqual(1510);

    service.applyVoucher("free100");
    expect(service.getTotalAmount()).toEqual(1410);
    service.applyVoucher("free50");
    expect(service.getTotalAmount()).toEqual(705);
    service.applyVoucher("massive");
    expect(service.getTotalAmount()).toEqual(205);
  });
});
