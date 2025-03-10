import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { subscriptionTiers, subscriptionTiersInOrder, TierNames } from "@/data/subscriptionTiers";
import { formatCompactNumber } from "@/lib/formatters";

import { createCustomerPortalSession } from "@/server/actions/stripe";
import { getProductCount } from "@/server/db-queries/products";
import { getProductViewCount } from "@/server/db-queries/productViews";
import { getUserSubscriptionTier } from "@/server/db-queries/subscription";
import { auth } from "@clerk/nextjs/server";
import { startOfMonth } from "date-fns";
import PricingCard from "../_components/PricingCard";

export default async function SubscriptionPage() {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();
  const tier = await getUserSubscriptionTier(userId);
  const productCount = await getProductCount(userId);
  const pricingViewCount = await getProductViewCount(userId, startOfMonth(new Date()));

  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">Your Subscription</h1>
      <div className="flex flex-col gap-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Usage</CardTitle>
              <CardDescription>
                {formatCompactNumber(pricingViewCount)} /{" "}
                {formatCompactNumber(tier.maxNumberOfVisits)} pricing page visits this month
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Progress value={(pricingViewCount / tier.maxNumberOfVisits) * 100} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Number of Products</CardTitle>
              <CardDescription>
                {productCount} / {tier.maxNumberOfProducts} products created
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Progress value={(productCount / tier.maxNumberOfProducts) * 100} />
            </CardContent>
          </Card>
        </div>

        {tier.name != subscriptionTiers.Free.name && ( // stupid js thing: reference vs value comparison
          <Card>
            <CardHeader>
              <CardTitle>You are currently on the {tier.name} plan</CardTitle>
              <CardDescription>
                If you would like to upgrade, cancel, or change your payment method use the button
                below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createCustomerPortalSession}>
                <Button variant="accent" className="text-lg rounded-lg" size="lg">
                  Manage Subscription
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="grid-cols-2 lg:grid-cols-4 grid gap-4 max-w-screen-xl mx-auto">
        {subscriptionTiersInOrder.map((t) => (
          <PricingCard key={t.name} currentTierName={tier.name} {...t} />
        ))}
      </div>
    </>
  );
}
