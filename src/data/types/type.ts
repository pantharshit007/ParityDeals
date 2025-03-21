import { CHART_INTERVALS } from "../constant";

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

export interface customizationType {
  productId: string;
  locationMessage: string;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  bannerContainer: string;
  isSticky: boolean;
  classPrefix: string | null;
}

export interface ViewsCountryChartType {
  timezone: string;
  productId?: string;
  userId: string;
  interval: (typeof CHART_INTERVALS)[keyof typeof CHART_INTERVALS];
}
