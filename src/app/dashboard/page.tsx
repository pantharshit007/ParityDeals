import { getProducts } from "@/server/db-queries/products";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import { NoProducts } from "./_components/NoProducts";

async function page() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  const products = await getProducts(userId, { limit: 6 });

  if (products.length === 0) return NoProducts();

  return <div>page {userId}</div>;
}

export default page;
