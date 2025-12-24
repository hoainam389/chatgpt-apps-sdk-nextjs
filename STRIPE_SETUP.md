# Stripe Integration Setup

This project includes Stripe Agentic Commerce Protocol integration for accepting payments through ChatGPT apps.

## Prerequisites

1. A Stripe account ([Sign up here](https://dashboard.stripe.com/register))
2. Stripe API keys

## Setup Instructions

### 1. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for production)

### 2. Configure Environment Variables

You have two options to set up your environment variables:

#### Option A: Use the Setup Script (Recommended)

**For Windows (PowerShell):**
```powershell
cd chatgpt-apps-sdk-nextjs
.\setup-env.ps1
```

**For Mac/Linux (Bash):**
```bash
cd chatgpt-apps-sdk-nextjs
chmod +x setup-env.sh
./setup-env.sh
```

The script will:
- Prompt you for your Stripe secret key
- Validate the key format
- Create `.env.local` file automatically

#### Option B: Manual Setup

Create a `.env.local` file in the `chatgpt-apps-sdk-nextjs` directory:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

You can also copy from the example:
```bash
# Copy the example file
cp env.example.txt .env.local

# Then edit .env.local and replace the placeholder with your actual key
```

**Important Notes:**
- The `.env.local` file is required for both **build time** and **runtime**
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Use `sk_test_` keys for development
- Use `sk_live_` keys for production

### 3. Create Products and Prices in Stripe

You can create products and prices in two ways:

#### Option A: Using Stripe Dashboard
1. Go to [Stripe Products](https://dashboard.stripe.com/products)
2. Click "Add product"
3. Fill in product details (name, description, price)
4. Save the product

#### Option B: Using Stripe CLI
```bash
stripe products create --name="Test Product 1" --description="A test product"
stripe prices create --product=prod_xxx --unit-amount=2000 --currency=usd
```

### 4. Test the Integration

1. Start your Next.js development server:
   ```bash
   pnpm dev
   ```

2. In ChatGPT, use the following tools:
   - **list-products**: Displays all active products from your Stripe account
   - **buy-products**: Creates a checkout session for selected products

## Available MCP Tools

### `list-products`
Lists all active products available for purchase from your Stripe account.

**Usage in ChatGPT:**
- "Show me the available products"
- "What products can I buy?"

**Returns:**
- Interactive UI with checkboxes for product selection
- Product names and prices

### `buy-products`
Creates a Stripe Checkout session for the selected products.

**Parameters:**
- `priceIds`: Array of Stripe price IDs to purchase

**Returns:**
- Checkout session URL
- Redirects user to Stripe Checkout page

## How It Works

1. **Product Listing**: The `list-products` tool fetches active prices from Stripe and displays them in an interactive widget
2. **Product Selection**: Users can select multiple products using checkboxes
3. **Checkout**: When the user clicks "Buy", the `buy-products` tool creates a Stripe Checkout Session
4. **Payment**: User is redirected to Stripe's hosted checkout page to complete the payment
5. **Success/Cancel**: After payment, user is redirected to success or cancel URL

## Webhook Integration (Optional)

To handle successful payments, you should set up webhook handlers:

1. Create a webhook endpoint in your app
2. Listen for `checkout.session.completed` events
3. Fulfill orders when payment is successful

See [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks) for more details.

## Security Notes

- Never commit your `.env.local` file with real API keys
- Use test mode keys (`sk_test_`) during development
- Only use live keys (`sk_live_`) in production
- Validate all webhook events using Stripe's signature verification

## Resources

- [Stripe Agentic Commerce Documentation](https://docs.stripe.com/agentic-commerce/apps/accept-payment)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)

