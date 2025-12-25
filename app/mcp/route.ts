import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import Stripe from "stripe";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.preview",
});

// Helper function to create a Checkout Session
async function createCheckoutSession(priceIds: string[]) {
  const lineItems = priceIds.map((price) => ({ price, quantity: 1 }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${baseURL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseURL}/cancel`,
  });

  return session;
}

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

// Helper function to register product widget
async function registerProductWidget(server: any) {
  const productWidget: ContentWidget = {
    id: "list_products",
    title: "List Products",
    templateUri: "ui://widget/list-products.html",
    invoking: "Loading products...",
    invoked: "Products loaded",
    html: await getAppsSdkCompatibleHtml(baseURL, "/products"),
    description: "Interactive product selection widget",
    widgetDomain: baseURL,
  };

  // Register the product list UI resource
  server.registerResource(
    "list-products-widget",
    productWidget.templateUri,
    {
      title: productWidget.title,
      description: productWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": productWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri: any) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${productWidget.html}</html>`,
          _meta: {
            "openai/widgetCSP": {
              connect_domains: [
                "https://checkout.stripe.com",
                productWidget.widgetDomain,
              ],
              resource_domains: [
                "https://checkout.stripe.com",
                productWidget.widgetDomain,
              ],
            },
            "openai/widgetDescription": productWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": productWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register the list-products tool
  server.registerTool(
    productWidget.id,
    {
      title: productWidget.title,
      description: "List the products available for purchase from Stripe",
      inputSchema: {},
      _meta: {
        "openai/outputTemplate": productWidget.templateUri,
        "openai/toolInvocation/invoking": productWidget.invoking,
        "openai/toolInvocation/invoked": productWidget.invoked,
        "openai/widgetAccessible": false,
        "openai/resultCanProduceWidget": true,
      },
    },
    async () => {
      // Fetch products from Stripe
      const prices = await stripe.prices.list({
        active: true,
        expand: ["data.product"],
      });

      const suggestedProducts = prices.data.map((price) => {
        const product = price.product as Stripe.Product;
        return {
          priceId: price.id,
          name: product.name,
          price: price.unit_amount,
          currency: price.currency,
        };
      });

      return {
        structuredContent: { products: suggestedProducts },
        content: [
          {
            type: "text",
            text: `Found ${suggestedProducts.length} products available for purchase.`,
          },
        ],
        _meta: {
          "openai/outputTemplate": productWidget.templateUri,
          "openai/toolInvocation/invoking": productWidget.invoking,
          "openai/toolInvocation/invoked": productWidget.invoked,
          "openai/widgetAccessible": false,
          "openai/resultCanProduceWidget": true,
        },
      };
    }
  );

  // Register the buy-products tool
  server.registerTool(
    "buy-products",
    {
      title: "Buy products",
      description: "Create a checkout page link for purchasing the selected products",
      inputSchema: {
        priceIds: z.array(z.string()).describe("Array of Stripe price IDs to purchase"),
      },
    },
    async ({ priceIds }: { priceIds: string[] }) => {
      const session = await createCheckoutSession(priceIds);

      return {
        content: [
          {
            type: "text",
            text: `[Complete your purchase here](${session.url})`,
          },
        ],
        structuredContent: {
          checkoutSessionId: session.id,
          checkoutSessionUrl: session.url,
        },
      };
    }
  );
}

// Helper function to register custom page widget
async function registerCustomPageWidget(server: any) {
  const customPageWidget: ContentWidget = {
    id: "show_custom_page",
    title: "Show Custom Page",
    templateUri: "ui://widget/custom-page-template.html",
    invoking: "Loading custom page...",
    invoked: "Custom page loaded",
    html: await getAppsSdkCompatibleHtml(baseURL, "/custom-page"),
    description: "Displays the custom page content",
    widgetDomain: baseURL,
  };
  
  server.registerResource(
    "custom-page-widget",
    customPageWidget.templateUri,
    {
      title: customPageWidget.title,
      description: customPageWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": customPageWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri: any) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${customPageWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": customPageWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": customPageWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerTool(
    customPageWidget.id,
    {
      title: customPageWidget.title,
      description: "Fetch and display the custom page content",
      inputSchema: {},
      _meta: widgetMeta(customPageWidget),
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "Custom page content loaded",
          },
        ],
        structuredContent: {
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(customPageWidget),
      };
    }
  );
}

// Helper function to register content widget
async function registerContentWidget(server: any) {
  const contentWidget: ContentWidget = {
    id: "show_content",
    title: "Show Content",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading content...",
    invoked: "Content loaded",
    html: await getAppsSdkCompatibleHtml(baseURL, "/"),
    description: "Displays the homepage content",
    widgetDomain: "https://nextjs.org/docs",
  };
  
  server.registerResource(
    "content-widget",
    contentWidget.templateUri,
    {
      title: contentWidget.title,
      description: contentWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": contentWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri: any) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${contentWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": contentWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": contentWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerTool(
    contentWidget.id,
    {
      title: contentWidget.title,
      description:
        "Fetch and display the homepage content with the name of the user",
      inputSchema: {
        name: z.string().describe("The name of the user to display on the homepage"),
      },
      _meta: widgetMeta(contentWidget),
    },
    async ({ name }: { name: string }) => {
      return {
        content: [
          {
            type: "text",
            text: name,
          },
        ],
        structuredContent: {
          name: name,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(contentWidget),
      };
    }
  );
}

const handler = createMcpHandler(async (server) => {
  // Register Stripe product widget
  await registerProductWidget(server);

  // Register custom page widget
  await registerCustomPageWidget(server);

  // Register content widget
  await registerContentWidget(server);
});

export const GET = handler;
export const POST = handler;
