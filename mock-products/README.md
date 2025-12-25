# Product Catalog Upload

This directory contains the product catalog CSV file for uploading to Stripe's Agentic Commerce platform.

## File Structure

- `upload.csv` - Product catalog file following [Stripe's product catalog specification](https://docs.stripe.com/agentic-commerce/product-catalog)

## CSV Format

The CSV includes the following key fields:

### Required Fields
- `id` - Unique product identifier (SKU)
- `title` - Product title
- `description` - Product description
- `link` - Product landing page URL
- `brand` - Product brand name
- `gtin` - Global Trade Item Number
- `image_link` - Main product image URL
- `condition` - Product condition (new, refurbished, used)
- `google_product_category` - Google product taxonomy category
- `availability` - Stock status (in_stock, out_of_stock, preorder, backorder)
- `price` - Product price with currency

### Additional Fields
- `additional_image_link` - Additional product images (comma-separated)
- `video_link` - Product video URL
- `shipping` - Shipping options and costs
- `free_shipping_threshold` - Free shipping thresholds
- `applicable_fees` - Regional fees (e.g., recycling fees)
- `popularity_score` - Product popularity (0-5 scale)
- `return_rate` - Return rate percentage
- `product_review_count` - Number of reviews
- `product_review_rating` - Average rating (1-5 scale)

## Upload Methods

### Method 1: Command Line Script

Upload using the Node.js script:

```bash
# Install dependencies first
pnpm install

# Set your Stripe secret key and run the upload
STRIPE_SECRET_KEY=sk_test_your_key_here pnpm upload-catalog
```

### Method 2: Web Interface

1. Start the development server:
```bash
pnpm dev
```

2. Navigate to: `http://localhost:3000/upload-catalog`

3. Click the "Upload to Stripe" button

### Method 3: API Endpoint (Programmatic)

Use the API endpoint directly for integration:

```bash
curl -X POST http://localhost:3000/api/upload-catalog
```

## Environment Variables

Make sure to set your Stripe secret key:

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

## What Happens After Upload?

1. The CSV file is uploaded to Stripe's File Upload API
2. Stripe validates and processes the product data
3. Products are indexed into the Stripe Catalog
4. Products become discoverable by AI agents for search and shopping
5. You can track the processing status in your Stripe Dashboard

## Mock Products Included

The `upload.csv` file includes 10 mock products:

1. Mens Floral Polo Shirt - Apparel
2. Womens Running Sneakers - Footwear
3. Wireless Bluetooth Headphones - Electronics
4. Stainless Steel Water Bottle - Home Goods
5. Organic Cotton T-Shirt - Basic Apparel
6. Smart Fitness Watch - Wearable Tech
7. Yoga Mat Premium - Sporting Goods
8. Leather Laptop Backpack - Accessories
9. Ceramic Coffee Mug Set - Kitchen
10. Portable Bluetooth Speaker - Audio

## Updating the Catalog

To update products:

1. Modify the `upload.csv` file with your changes
2. Re-run the upload (products with matching `id` will be updated)
3. To delete a product, set the `delete` column to `true`

## Inventory Updates

For frequent stock updates without re-uploading the full catalog, create an inventory feed with just:
- `id` - Product ID
- `availability` - Stock status
- `inventory_quantity` - Available units
- `availability_date` - For preorders

## Resources

- [Stripe Product Catalog Documentation](https://docs.stripe.com/agentic-commerce/product-catalog)
- [Stripe File Upload API](https://docs.stripe.com/api/files)
- [Stripe Agentic Commerce Overview](https://docs.stripe.com/agentic-commerce)

