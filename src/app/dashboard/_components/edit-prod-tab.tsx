import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProductDetailsForm from "./forms/ProductDetailsForm";
import { notFound } from "next/navigation";
import { ProductType } from "@/data/types/type";
import { getProductCountryGroups, getProductCustomization } from "@/server/db-queries/products";
import { CountryDiscountsForm } from "./forms/CountryDiscountsForm";
import { canCustomizeBanner, canRemoveBranding } from "@/server/permissions";
import { ProductCustomizationForm } from "./forms/ProductCustomizationForm";

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

export async function CustomizationsTab({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const customization = await getProductCustomization({ productId, userId });

  if (customization == null) return notFound();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Banner Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductCustomizationForm
          canRemoveBranding={await canRemoveBranding(userId)}
          canCustomizeBanner={await canCustomizeBanner(userId)}
          customization={customization}
        />
      </CardContent>
    </Card>
  );
}
