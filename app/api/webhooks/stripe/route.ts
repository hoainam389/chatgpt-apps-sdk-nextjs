import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Store completed sessions in memory (in production, use a database)
const completedSessions = new Map<string, {
  sessionId: string;
  status: 'complete' | 'processing';
  timestamp: number;
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
}>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Checkout session completed:", session.id);
        
        // Store the completed session
        completedSessions.set(session.id, {
          sessionId: session.id,
          status: session.payment_status === 'paid' ? 'complete' : 'processing',
          timestamp: Date.now(),
          customerEmail: session.customer_email || undefined,
          amountTotal: session.amount_total || undefined,
          currency: session.currency || undefined,
        });

        // Handle successful payment
        if (session.payment_status === 'paid') {
          console.log("💰 Payment successful for session:", session.id);
          // Here you would typically:
          // - Update your database
          // - Send confirmation email
          // - Fulfill the order
        } else {
          console.log("⏳ Payment processing for session:", session.id);
        }
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Async payment succeeded:", session.id);
        
        // Update the session status
        completedSessions.set(session.id, {
          sessionId: session.id,
          status: 'complete',
          timestamp: Date.now(),
          customerEmail: session.customer_email || undefined,
          amountTotal: session.amount_total || undefined,
          currency: session.currency || undefined,
        });

        console.log("💰 Delayed payment completed for session:", session.id);
        // Handle delayed payment success
        // - Update your database
        // - Send confirmation email
        // - Fulfill the order
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("❌ Async payment failed:", session.id);
        
        // Remove or update the session
        completedSessions.delete(session.id);
        
        // Handle delayed payment failure
        // - Notify the customer
        // - Update your database
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("⏰ Checkout session expired:", session.id);
        
        // Clean up expired session
        completedSessions.delete(session.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// GET endpoint to check session status
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id parameter is required" },
      { status: 400 }
    );
  }

  // Check if we have this session in our completed sessions
  const sessionData = completedSessions.get(sessionId);

  if (sessionData) {
    return NextResponse.json(sessionData);
  }

  // If not in memory, check with Stripe
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    const status = session.payment_status === 'paid' 
      ? 'complete' 
      : session.payment_status === 'unpaid' && session.status === 'complete'
      ? 'processing'
      : 'pending';

    return NextResponse.json({
      sessionId: session.id,
      status,
      timestamp: Date.now(),
      customerEmail: session.customer_email || undefined,
      amountTotal: session.amount_total || undefined,
      currency: session.currency || undefined,
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }
}

