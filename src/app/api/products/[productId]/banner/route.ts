import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextRequest } from "next/server";
import { createElement } from "react";

import { customizationType } from "@/data/types/type";
import { getProductBanner } from "@/server/db-queries/products";
import { createProductView } from "@/server/db-queries/productViews";
import { canRemoveBranding, canShowDiscountBanner } from "@/server/permissions";
import { Banner } from "@/components/Banner";

interface params {
  params: {
    productId: string;
  };
}

export const runtime = "edge";

export async function GET(req: NextRequest, { params: { productId } }: params) {
  const headersList = headers();
  const requestOriginUrl = headersList.get("referer") || headersList.get("origin");

  if (requestOriginUrl == null) return notFound();

  const countryCode = getCountryCode(req);
  if (countryCode == null) return notFound();

  const { product, discount, country } = await getProductBanner(
    productId,
    countryCode,
    requestOriginUrl
  );

  if (!product) return notFound();

  const canShowBanner = await canShowDiscountBanner(product.clerkUserId);

  await createProductView({
    productId: product.id,
    countryId: country?.id,
    userId: product.clerkUserId,
  });

  console.log("canShowBanner", canShowBanner);
  if (!canShowBanner) return notFound();
  if (!country || !discount) return notFound();

  const canRemoveBrand = await canRemoveBranding(product.clerkUserId);

  // prettier-ignore
  return new Response(await getJS(
    product.customization,
    country,
    discount,
    canRemoveBrand),
    { headers: { "Content-Type": "text/javascript" }} 
  );
}

function getCountryCode(req: NextRequest) {
  if (req.geo?.country != null) return req.geo.country;
  if (process.env.NODE_ENV === "development") return process.env.TEST_COUNTRY_CODE;
}

async function getJS(
  customization: customizationType,
  country: { name: string },
  discount: { coupon: string; percentage: number },
  canRemoveBranding: boolean
) {
  const { renderToStaticMarkup } = await import("react-dom/server"); // it's creashing whenever i import on top
  const element = renderToStaticMarkup(
    createElement(Banner, {
      canRemoveBranding,
      message: customization.locationMessage,
      mappings: {
        country: country.name,
        coupon: discount.coupon,
        discount: (discount.percentage * 100).toString(),
      },
      customization,
    })
  );

  const doc = `
    const banner = document.createElement("div");
    banner.innerHTML = '${JSON.stringify(element)}';

    document.querySelector("${customization.bannerContainer}").prepend(...banner.children);
  `;

  return doc.replace(/(\r\n|\n|\r)/g, "");
}
