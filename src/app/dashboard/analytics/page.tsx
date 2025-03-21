import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TimezoneDropdownMenuItem } from "@/components/ui/timezone-dropdown-menu-item";
import Link from "next/link";
import { canAccessAnalytics } from "@/server/permissions";
import { ChevronDown } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { HasPermission } from "@/components/HasPermission";
import {
  ProductDropdown,
  ViewsByCountryCard,
  ViewsByDayCard,
  ViewsByPPPCard,
} from "../_components/ViewsCard";
import { CHART_INTERVALS } from "@/data/constant";
import { createURL } from "@/lib/utils";

type searchParams = {
  interval?: string;
  timezone?: string;
  productId?: string;
};

async function page({ searchParams }: { searchParams: searchParams }) {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();

  // const { timezone, productId } = searchParams;
  const timezone = searchParams.timezone ?? "UTC";
  const productId = searchParams.productId;
  const interval =
    CHART_INTERVALS[searchParams?.interval as keyof typeof CHART_INTERVALS] ??
    CHART_INTERVALS.last7days;

  return (
    <>
      <div className="mb-6 flex justify-between items-baseline">
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <HasPermission permission={canAccessAnalytics}>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {interval.label}
                  <ChevronDown className="size-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.entries(CHART_INTERVALS).map(([key, value]) => (
                  <DropdownMenuItem asChild key={key}>
                    <Link href={createURL("/dashboard/analytics", searchParams, { interval: key })}>
                      {value.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ProductDropdown
              userId={userId}
              selectedProductId={productId}
              searchParams={searchParams}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {timezone}
                  <ChevronDown className="size-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link
                    href={createURL("/dashboard/analytics", searchParams, {
                      timezone: "UTC",
                    })}
                  >
                    UTC
                  </Link>
                </DropdownMenuItem>
                <TimezoneDropdownMenuItem searchParams={searchParams} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </HasPermission>
      </div>

      <HasPermission permission={canAccessAnalytics} renderFallback>
        <div className="flex flex-col gap-8">
          <ViewsByDayCard
            interval={interval}
            timezone={timezone}
            userId={userId}
            productId={productId}
          />
          <ViewsByPPPCard
            interval={interval}
            timezone={timezone}
            userId={userId}
            productId={productId}
          />
          <ViewsByCountryCard
            interval={interval}
            timezone={timezone}
            userId={userId}
            productId={productId}
          />
        </div>
      </HasPermission>
    </>
  );
}

export default page;
