import React from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import {
  CountryTab,
  CustomizationsTab,
  DetailsTab,
} from "@/app/dashboard/_components/edit-prod-tab";
import { PageWithBackButton } from "@/app/dashboard/_components/PageWithBackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSingleProduct } from "@/server/db-queries/products";

interface EditProductPageProps {
  params: {
    productId: string;
  };
  searchParams: {
    tab?: string;
  };
}

async function EditProductPage({
  params,
  searchParams: { tab = "details" },
}: EditProductPageProps) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const product = await getSingleProduct(params.productId, userId);
  if (!product) return notFound();

  return (
    <PageWithBackButton backButtonHref={`/dashboard/products`} pageTitle={`Edit Product`}>
      <Tabs defaultValue={tab}>
        <TabsList className="bg-background/75">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <DetailsTab product={product} />
        </TabsContent>
        <TabsContent value="countries">
          <CountryTab productId={product.id} userId={userId} />
        </TabsContent>
        <TabsContent value="customization">
          <CustomizationsTab productId={product.id} userId={userId} />
        </TabsContent>
      </Tabs>
    </PageWithBackButton>
  );
}

export default EditProductPage;
