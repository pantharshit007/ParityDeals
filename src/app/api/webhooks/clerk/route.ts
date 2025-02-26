import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { env_server } from "@/data/env/env-server";
import { createSubscription } from "@/server/db-queries/subscription";
import { deleteUser } from "@/server/db-queries/user";

export async function POST(req: Request) {
  // Get headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svimTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svixId || !svimTimestamp || !svixSignature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create new Svix instance with secret
  const wh = new Webhook(env_server.CLERK_WEBHOOK_SECRET);

  let event: WebhookEvent;

  // Verify payload with headers
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svimTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;

    switch (event.type) {
      case "user.created":
        await createSubscription({
          clerkUserId: event.data.id,
          tier: "Free",
        });
        break;

      case "user.deleted":
        if (event.data.id !== undefined) {
          await deleteUser(event.data.id);
        }
        break;

      default:
        console.log("Unknown event type:", event.type);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }
}
