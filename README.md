# ChatGPT Apps SDK Next.js Starter with Stripe Integration

A Next.js application demonstrating how to build an [OpenAI Apps SDK](https://developers.openai.com/apps-sdk) compatible MCP server with Stripe payment integration and real-time webhook handling.

## Features

- ✅ **MCP Server** - ChatGPT-compatible Model Context Protocol server
- ✅ **Stripe Payments** - Complete checkout flow with product selection
- ✅ **Webhook Integration** - Real-time payment status updates
- ✅ **Async Payment Support** - Bank transfers, SEPA, and delayed payment methods
- ✅ **Success/Cancel Pages** - Professional post-checkout experience

## Quick Start

### 1. Installation

```bash
pnpm install
```

### 2. Environment Variables

Create `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Start Webhook Forwarding (Development)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook secret (`whsec_...`) to your `.env.local` and restart the server.

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Connecting to ChatGPT

1. Deploy to Vercel (see Deployment section below)
2. In ChatGPT, go to **Settings → [Connectors](https://chatgpt.com/#settings/Connectors) → Create**
3. Add your MCP server URL: `https://your-app.vercel.app/mcp`

**Note:** Requires ChatGPT developer mode. See [connection guide](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt).


## Key Files

```
app/
├── api/webhooks/stripe/route.ts  # Webhook handler (POST & GET)
├── mcp/route.ts                  # MCP server with Stripe tools
├── products/page.tsx             # Product selection + status polling
├── success/page.tsx              # Payment success page
└── cancel/page.tsx               # Payment cancellation page
```

## How It Works

### Payment Flow

1. User selects products → Creates Stripe checkout session
2. User completes payment → Stripe sends webhook to `/api/webhooks/stripe`
3. Webhook verifies signature and stores session status
4. Products page polls for updates every 3 seconds
5. Success page displays payment details from session ID

### Webhook Events

- `checkout.session.completed` - Immediate payment
- `checkout.session.async_payment_succeeded` - Delayed payment (bank transfer, SEPA)
- `checkout.session.async_payment_failed` - Failed payment
- `checkout.session.expired` - Expired session

## Production Setup

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel-labs/chatgpt-apps-sdk-nextjs-starter)

### 2. Add Environment Variables

In Vercel dashboard, add:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - From Stripe Dashboard webhook

### 3. Configure Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
4. Copy signing secret to Vercel environment variables

## Testing

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

**Test Webhook Events:**
```bash
stripe trigger checkout.session.completed
stripe trigger checkout.session.async_payment_succeeded
```

## Documentation

- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Model Context Protocol](https://modelcontextprotocol.io)
