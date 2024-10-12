export interface Voucher {
  name: string;
  discountAmount: number;
  /**
   * @param priceAmount price amount
   * @return price after discount
   */
  apply(priceAmount: number): number;
}
export class FixedDiscountVoucher implements Voucher {
  name: string;
  discountAmount: number;
  apply(priceAmount: number): number {
    const priceAfterDiscount = priceAmount - this.discountAmount;
    return priceAfterDiscount > 0 ? priceAfterDiscount : 0;
  }
}

export class PercentageDiscountVoucher implements Voucher {
  name: string;
  discountAmount: number;
  maxDiscount: number;
  apply(priceAmount: number): number {
    const calculatedDiscount = (priceAmount * this.discountAmount) / 100;
    return calculatedDiscount > this.maxDiscount
      ? priceAmount - calculatedDiscount
      : priceAmount - this.maxDiscount;
  }
}
