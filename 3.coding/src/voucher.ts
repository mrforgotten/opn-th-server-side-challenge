export interface Voucher {
  type: string;
  name: string;
  discountAmount: number;
  /**
   * @param priceAmount price amount
   * @return price after discount
   */
  apply(priceAmount: number): number;
}
export class FixedDiscountVoucher implements Voucher {
  type = "fixed";
  name: string;
  discountAmount: number;

  /**
   * @param name
   * @param discountAmount will always be possive value
   */
  constructor(name: string, discountAmount: number) {
    this.name = name.toLocaleLowerCase();
    this.discountAmount = Math.abs(discountAmount);
  }

  apply(priceAmount: number): number {
    const priceAfterDiscount = priceAmount - this.discountAmount;
    return priceAfterDiscount > 0 ? priceAfterDiscount : 0;
  }
}

export class PercentageDiscountVoucher implements Voucher {
  type = "percentage";
  name: string;
  discountAmount: number;
  maxDiscount: number;

  /**
   *
   * @param name
   * @param discountAmount always positive value;
   * @param maxDiscount always positive value; default 0; assume no discount, but can be apply for something else
   */
  constructor(name: string, discountAmount: number, maxDiscount: number = 0) {
    this.name = name.toLocaleLowerCase();
    this.discountAmount = Math.abs(discountAmount);
    this.maxDiscount = Math.abs(maxDiscount);
  }
  apply(priceAmount: number): number {
    let calculatedDiscount = (priceAmount * this.discountAmount) / 100;
    if (calculatedDiscount > this.maxDiscount) {
      calculatedDiscount = this.maxDiscount;
    }

    return priceAmount - calculatedDiscount;
  }
}

export class VoucherStore {
  private voucherMap: {
    [name: string]: Voucher;
  };

  constructor() {
    this.voucherMap = {};
  }

  add(voucher: Voucher) {
    this.voucherMap[voucher.name] = voucher;
  }

  getVoucherByName(name: string): Voucher {
    name = name.toLocaleLowerCase();
    return this.voucherMap[name];
  }
}
