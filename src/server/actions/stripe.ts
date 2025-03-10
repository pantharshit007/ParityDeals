"use server";

import { PaidTierNames, subscriptionTiers } from "@/data/subscriptionTiers";
import { auth, currentUser, User } from "@clerk/nextjs/server";
import { getUserSubscription } from "../db-queries/subscription";
import { Stripe } from "stripe";
import { env_server } from "@/data/env/env-server";
import { env_client } from "@/data/env/env-client";
import { redirect } from "next/navigation";

const stripe = new Stripe(env_server.STRIPE_SECRET_KEY);

interface subType {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionItemId: string | null;
}

export async function createCustomerPortalSession() {
  let redirectPath: string | null = null;

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("not found!");

    const subscription = await getUserSubscription(userId);
    if (!subscription) throw new Error("not found!");

    if (subscription?.stripeCustomerId == null) {
      throw new Error("Stripe Customer ID not found");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env_client.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
    });

    redirectPath = portalSession.url;
  } catch (error) {
    console.error("[ERROR-CREATE-CUSTOMER-PORTAL-SESSION]", error);
    return;
  } finally {
    if (redirectPath) redirect(redirectPath);
  }
}

export async function createCheckoutSession(tier: PaidTierNames) {
  let redirectPath: string | null = null;
  try {
    const user = await currentUser();
    if (!user) throw new Error("not found!");

    const subscription = await getUserSubscription(user.id);
    if (!subscription) throw new Error("not found!");

    if (subscription.stripeCustomerId == null) {
      const url = await getCheckoutSession(tier, user);
      if (!url) throw new Error("not found!");

      redirectPath = url;
    } else {
      const url = await getSubscriptionUpgradeSession(tier, subscription);
      if (!url) throw new Error("not found!");

      redirectPath = url;
    }
  } catch (err) {
    console.error("[ERROR-CREATE-CHECKOUT-SESSION]", err);
    return;
  } finally {
    if (redirectPath) redirect(redirectPath);
  }
}

async function getCheckoutSession(tier: PaidTierNames, user: User) {
  const customerEmail = user.primaryEmailAddress?.emailAddress;

  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    subscription_data: { metadata: { clerkUserId: user.id } },
    line_items: [{ price: subscriptionTiers[tier].stripePriceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${env_client.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
    cancel_url: `${env_client.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
  });
  return session.url;
}

async function getSubscriptionUpgradeSession(tier: PaidTierNames, sub: subType) {
  if (
    sub.stripeSubscriptionId == null ||
    sub.stripeSubscriptionItemId == null ||
    sub.stripeCustomerId == null
  ) {
    throw new Error("Stripe Subscription ID not found");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${env_client.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
    flow_data: {
      type: "subscription_update_confirm",
      subscription_update_confirm: {
        subscription: sub.stripeSubscriptionId,
        items: [
          {
            id: sub.stripeSubscriptionItemId,
            price: subscriptionTiers[tier].stripePriceId,
            quantity: 1,
          },
        ],
      },
    },
  });

  return portalSession.url;
}

// TODO: there is a problem here i think, what happen to the product user created if he cancel it back to FREE?
export async function createCancelSession() {
  let redirectPath: string | null = null;

  try {
    const user = await currentUser();
    if (!user) throw new Error("not found!");

    const subscription = await getUserSubscription(user.id);
    if (!subscription) throw new Error("not found!");

    if (subscription.stripeCustomerId == null || subscription.stripeSubscriptionId == null) {
      throw new Error("Stripe Customer/subscription ID not found");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env_client.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
      flow_data: {
        type: "subscription_cancel",
        subscription_cancel: { subscription: subscription.stripeSubscriptionId },
      },
    });

    redirectPath = portalSession.url;
  } catch (error) {
    console.error("[ERROR-CREATE-CUSTOMER-PORTAL-SESSION]", error);
    return;
  } finally {
    if (redirectPath) redirect(redirectPath);
  }
}
