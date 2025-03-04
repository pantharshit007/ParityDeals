import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProductDetailsForm from "./forms/ProductDetailsForm";
import { notFound } from "next/navigation";
import { CountryGrpsType, ProductType } from "@/data/types/type";
import { getProductCountryGroups } from "@/server/db-queries/products";
import { CountryDiscountsForm } from "./forms/CountryDiscountsForm";

export function DetailsTab({ product }: { product: ProductType }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductDetailsForm product={product} />
      </CardContent>
    </Card>
  );
}

export async function CountryTab({ productId, userId }: { productId: string; userId: string }) {
  const countryGroups = await getProductCountryGroups({
    productId,
    userId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Country Discounts</CardTitle>
        <CardDescription>
          Leave the discount field blank if you do not want to display deals for any specific parity
          group.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CountryDiscountsForm productId={productId} countryGroups={countryGroups} />
      </CardContent>
    </Card>
  );
}
