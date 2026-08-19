import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

async function upsertSubscription(
  businessId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const supabase = createAdminClient();
  const item = subscription.items.data[0];

  await supabase.from("subscriptions").upsert(
    {
      business_id: businessId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan: item?.price.id ?? null,
      status: subscription.status,
      current_period_end: item
        ? new Date(item.current_period_end * 1000).toISOString()
        : null,
    },
    { onConflict: "business_id" }
  );
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const businessId = session.metadata?.business_id;

      if (businessId && session.subscription && session.customer) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await upsertSubscription(
          businessId,
          session.customer as string,
          subscription
        );
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const businessId = subscription.metadata?.business_id;

      if (businessId) {
        await upsertSubscription(
          businessId,
          subscription.customer as string,
          subscription
        );
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof subscriptionRef === "string"
          ? subscriptionRef
          : subscriptionRef?.id;

      if (subscriptionId) {
        // Re-fetch rather than trust event data: Stripe already flips the
        // subscription to `past_due` on a failed invoice, so this reflects
        // its real current status instead of us guessing at one.
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const businessId = subscription.metadata?.business_id;

        if (businessId) {
          await upsertSubscription(
            businessId,
            subscription.customer as string,
            subscription
          );
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
