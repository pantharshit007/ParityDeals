import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProductDetailsForm from "./productforms/ProductDetailsForm";
import { notFound } from "next/navigation";
import { ProductType } from "@/data/types/type";

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
