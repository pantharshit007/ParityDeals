export interface ProductType {
  id: string;
  name: string;
  description: string | null;
  url: string;
}

export interface CountryGrpsType {
  id: string;
  name: string;
  recommendedDiscountPercentage: number | null;
  countries: {
    name: string;
    code: string;
  }[];
  discount?: {
    coupon: string;
    discountPercentage: number;
  };
}

export interface insertType {
  countryGroupId: string;
  productId: string;
  coupon: string;
  discountPercentage: number;
}
