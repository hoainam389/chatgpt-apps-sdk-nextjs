# Product Catalog Upload Guide

This guide explains how to upload your product catalog to Stripe's Agentic Commerce platform using the File Upload API.

## 📋 Overview

The product catalog upload system allows you to:
- Upload structured product data to Stripe using a two-step process
- Make products discoverable by AI agents
- Enable in-context selling through ChatGPT and other AI platforms
- Manage inventory and pricing through CSV feeds

**Upload Process:**
1. Upload CSV file using Files API (`fetch` to `https://files.stripe.com/v1/files`) with `data_management_manual_upload` purpose
2. Create an ImportSet using Data Management API (`fetch` to `https://api.stripe.com/v1/data_management/import_sets`) to process and index the catalog

**API Version:** `2025-12-15.preview` (Public Preview)

Reference: [Stripe Agentic Commerce Documentation](https://docs.stripe.com/agentic-commerce/enable-in-context-selling-on-ai-agents)

## 🚀 Quick Start

### Prerequisites

1. **Stripe Account**: You need a Stripe account with access to Agentic Commerce (Private Preview)
2. **API Key**: Get your Stripe Secret Key from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. **Environment Setup**: Add your Stripe key to `.env.local`

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

### Installation

Install dependencies:

```bash
pnpm install
```

## 📤 Upload Methods

### Method 1: Command Line (Recommended for Automation)

Use the Node.js script to upload from the command line:

```bash
# Set your Stripe secret key and run the upload
STRIPE_SECRET_KEY=sk_test_your_key_here pnpm upload-catalog
```

**Output:**
```
📤 Uploading product catalog to Stripe...
📁 File: C:\path\to\mock-products\upload.csv
📊 File size: 15234 bytes (14.88 KB)
⏳ This may take a moment...

Step 1: Uploading CSV file...
✅ File uploaded successfully!
📋 File Details:
   ID: file_xxxxxxxxxxxxx
   Filename: product-catalog.csv
   Size: 15234 bytes
   Created: 2025-12-25T12:00:00.000Z
   Purpose: data_management_manual_upload

Step 2: Creating ImportSet to process catalog...
✅ ImportSet created successfully!
📋 ImportSet Details:
   ID: impset_xxxxxxxxxxxxx
   Status: pending
   Created: 2025-12-25T12:00:01.000Z

🎉 Product catalog upload complete!
⏳ Stripe is now processing and indexing your products.
💡 Monitor status with: stripe.dataManagement.importSets.retrieve("impset_xxxxxxxxxxxxx")
💡 Check your Stripe Dashboard for processing status.
📊 View orders at: https://dashboard.stripe.com/transactions
```

### Method 2: Web Interface (Recommended for Manual Uploads)

1. Start the development server:
```bash
pnpm dev
```

2. Open your browser and navigate to:
```
http://localhost:3000/upload-catalog
```

3. Click the **"📤 Upload to Stripe"** button

4. View the upload status and file details on the page

### Method 3: API Endpoint (For Programmatic Integration)

Use the REST API endpoint directly:

```bash
# POST request to upload
curl -X POST http://localhost:3000/api/upload-catalog

# GET request to see endpoint info
curl http://localhost:3000/api/upload-catalog
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file_xxxxxxxxxxxxx",
    "filename": "upload.csv",
    "size": 12345,
    "created": "2025-12-25T12:00:00.000Z",
    "purpose": "product_feed",
    "url": "https://files.stripe.com/..."
  },
  "message": "Product catalog uploaded successfully. Stripe will process and index your products."
}
```

## 📝 CSV Format

The `upload.csv` file follows [Stripe's Product Catalog Specification](https://docs.stripe.com/agentic-commerce/product-catalog).

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique product identifier (SKU) | `SKU12AB3456` |
| `title` | Product title (max 150 chars) | `Mens Floral Polo Shirt` |
| `description` | Product description (max 5000 chars) | `Bring a burst of fun...` |
| `link` | Product landing page URL | `https://example.com/product/SKU12AB3456` |
| `brand` | Product brand name | `Stripe Golf` |
| `gtin` | Global Trade Item Number | `3234567890126` |
| `image_link` | Main product image URL | `https://example.com/image.jpg` |
| `condition` | Product condition | `new`, `refurbished`, or `used` |
| `google_product_category` | Google taxonomy category | `1594` or `Apparel & Accessories > Clothing` |
| `availability` | Stock status | `in_stock`, `out_of_stock`, `preorder`, `backorder` |
| `price` | Product price with currency | `89.99 USD` |

### Recommended Fields

- `additional_image_link` - Additional product images (comma-separated URLs)
- `video_link` - Product demonstration video URL
- `shipping` - Shipping options and costs
- `free_shipping_threshold` - Free shipping thresholds
- `popularity_score` - Product popularity (0-5 scale)
- `product_review_count` - Number of reviews
- `product_review_rating` - Average rating (1-5 scale)

### Optional Fields

- `sale_price` - Discounted price
- `sale_price_effective_date` - Sale period (ISO 8601 range)
- `applicable_fees` - Regional fees (e.g., recycling fees)
- `tax_behavior` - Tax inclusion (`inclusive` or `exclusive`)
- `model_3d_link` - 3D model URL (GLB/GLTF format)

## 🔄 Feed Processing

### Upload Mode: Upsert

The product feed uses **upsert mode**:
- If the `id` doesn't exist → creates a new product
- If the `id` exists → updates the product
- Products not in the file → remain unchanged

### Deleting Products

To delete a product, set the `delete` column to `true`:

```csv
id,title,description,...,delete
SKU12AB3456,,,,...,true
```

## 📦 Mock Products

The included `upload.csv` contains 10 mock products:

1. **Mens Floral Polo Shirt** - Apparel with sale pricing
2. **Womens Running Sneakers** - Footwear with multiple shipping options
3. **Wireless Bluetooth Headphones** - Electronics with high ratings
4. **Stainless Steel Water Bottle** - Home goods with recycling fees
5. **Organic Cotton T-Shirt** - Basic apparel
6. **Smart Fitness Watch** - Wearable tech with promotional pricing
7. **Yoga Mat Premium** - Sporting goods
8. **Leather Laptop Backpack** - Accessories
9. **Ceramic Coffee Mug Set** - Kitchen items
10. **Portable Bluetooth Speaker** - Audio equipment

## 🔧 Customizing Your Catalog

### Editing the CSV

1. Open `mock-products/upload.csv` in a spreadsheet editor or text editor
2. Modify product data according to your needs
3. Ensure all required fields are populated
4. Save the file
5. Re-run the upload

### Adding New Products

Add new rows to the CSV with unique `id` values:

```csv
id,title,description,link,brand,...
SKU-NEW-001,New Product,Description here,https://example.com/new,...
```

### Updating Existing Products

Keep the same `id` and modify other fields:

```csv
id,title,description,price,...
SKU12AB3456,Updated Title,New description,99.99 USD,...
```

## 📊 Inventory Updates

For frequent stock updates without re-uploading the full catalog, create a separate inventory feed:

```csv
id,availability,inventory_quantity,availability_date
SKU12AB3456,in_stock,100,
SKU78CD9012,preorder,0,2026-02-24
SKU34EF5678,out_of_stock,0,
```

## 🎯 What Happens After Upload?

1. **File Upload**: CSV is uploaded to Stripe's File Upload API
2. **Validation**: Stripe validates the data format and required fields
3. **Processing**: Products are cleaned and normalized
4. **Indexing**: Products are indexed into the Stripe Catalog
5. **Distribution**: Products become available to AI agents
6. **Discovery**: AI agents can search and recommend your products
7. **Selling**: Customers can purchase through AI interfaces

## 📈 Monitoring

### Check Upload Status

- **Stripe Dashboard**: View file uploads and processing status
- **API Response**: Check the returned file ID and status
- **Logs**: Review console output for errors

### Common Issues

**Issue**: `Stripe API key not configured`
- **Solution**: Add `STRIPE_SECRET_KEY` to `.env.local`

**Issue**: `Product catalog CSV file not found`
- **Solution**: Ensure `mock-products/upload.csv` exists

**Issue**: `Invalid CSV format`
- **Solution**: Verify CSV follows Stripe's specification

**Issue**: `Purpose 'product_feed' not recognized`
- **Solution**: Agentic Commerce may not be enabled for your account (Private Preview)

## 🔐 Security

- **Never commit** `.env.local` to version control
- Use **test mode keys** (`sk_test_...`) during development
- Use **live mode keys** (`sk_live_...`) only in production
- Rotate API keys regularly
- Use environment variables for sensitive data

## 📚 Resources

- [Stripe Product Catalog Documentation](https://docs.stripe.com/agentic-commerce/product-catalog)
- [Stripe File Upload API](https://docs.stripe.com/api/files)
- [Stripe Agentic Commerce Overview](https://docs.stripe.com/agentic-commerce)
- [Google Product Taxonomy](https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt)

## 🛠️ File Structure

```
chatgpt-apps-sdk-nextjs/
├── app/
│   ├── api/
│   │   └── upload-catalog/
│   │       └── route.ts           # API endpoint for uploads
│   └── upload-catalog/
│       └── page.tsx                # Web UI for uploads
├── mock-products/
│   ├── upload.csv                  # Product catalog CSV
│   └── README.md                   # Mock products documentation
├── scripts/
│   └── upload-product-catalog.ts   # CLI upload script
├── .env.local                      # Environment variables (not in git)
└── PRODUCT_CATALOG_UPLOAD_GUIDE.md # This guide
```

## 💡 Tips

1. **Start Small**: Test with a few products first
2. **Validate Data**: Ensure all URLs are accessible
3. **Use High-Quality Images**: Minimum 800x800px recommended
4. **Update Regularly**: Keep inventory and pricing current
5. **Monitor Performance**: Track popularity_score and return_rate
6. **Optimize Descriptions**: Write clear, SEO-friendly descriptions
7. **Test Thoroughly**: Use test mode before going live

## 🤝 Support

For issues or questions:
- Check the [Stripe Documentation](https://docs.stripe.com)
- Contact [Stripe Support](https://support.stripe.com)
- Review error messages in console output

---

**Happy Selling! 🎉**

