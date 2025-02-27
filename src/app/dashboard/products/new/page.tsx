import React from "react";
import { PageWithBackButton } from "@/app/dashboard/_components/PageWithBackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductDetailsForm from "@/app/dashboard/_components/productforms/ProductDetailsForm";

function page() {
  return (
    <PageWithBackButton backButtonHref="/dashboard/products" pageTitle="Create Product">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductDetailsForm />
        </CardContent>
      </Card>
    </PageWithBackButton>
  );
}

export default page;
