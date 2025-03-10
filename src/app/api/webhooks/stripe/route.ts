import { env_server } from "@/data/env/env-server";
import { getTierByPriceId, subscriptionTiers } from "@/data/subscriptionTiers";
import { UserSupscriptionTable } from "@/drizzle/schema";
import { updateUserSubscription } from "@/server/db-queries/subscription";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(env_server.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    env_server.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case "customer.subscription.created": {
      await handleCreate(event.data.object);
      break;
    }
    case "customer.subscription.updated": {
      await handleUpdate(event.data.object);
      break;
    }
    case "customer.subscription.deleted": {
      await handleDelete(event.data.object);
      break;
    }
  }

  return new Response(null, { status: 200 });
}

async function handleCreate(sub: Stripe.Subscription) {
  const tier = getTierByPriceId(sub.items.data[0].price.id);
  const clerkUserId = sub.metadata.clerkUserId;
  if (!clerkUserId || !tier) {
    return new Response(null, { status: 500 });
  }

  const customer = sub.customer;
  const customerId = typeof customer === "string" ? customer : customer.id;

  const whereClause = eq(UserSupscriptionTable.clerkUserId, clerkUserId);
  const data: Partial<typeof UserSupscriptionTable.$inferInsert> = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    stripeSubscriptionItemId: sub.items.data[0].id,
    tier: tier.name,
  };

  return await updateUserSubscription(whereClause, data);
}

async function handleUpdate(sub: Stripe.Subscription) {
  const tier = getTierByPriceId(sub.items.data[0].price.id);
  const customer = sub.customer;
  const customerId = typeof customer === "string" ? customer : customer.id;

  if (tier == null) {
    return new Response(null, { status: 500 });
  }

  const whereClause = eq(UserSupscriptionTable.stripeCustomerId, customerId);
  return await updateUserSubscription(whereClause, { tier: tier.name }); // don't we need to also pass subscription id here? basic -> premium
}

async function handleDelete(sub: Stripe.Subscription) {
  const customer = sub.customer;
  const customerId = typeof customer === "string" ? customer : customer.id;

  const whereClause = eq(UserSupscriptionTable.stripeCustomerId, customerId);
  const data: Partial<typeof UserSupscriptionTable.$inferInsert> = {
    tier: subscriptionTiers.Free.name,
    stripeSubscriptionId: null,
    stripeSubscriptionItemId: null,
  };
  return await updateUserSubscription(whereClause, data);
}
