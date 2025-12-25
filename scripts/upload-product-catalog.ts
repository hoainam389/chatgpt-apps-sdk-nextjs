import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

/**
 * Upload product catalog CSV to Stripe
 * 
 * This script uploads the product catalog CSV file to Stripe using the correct two-step process:
 * 1. Upload CSV file using Files API with 'data_management_manual_upload' purpose
 * 2. Create an ImportSet using Data Management API to process and index the catalog
 * 
 * API Version: 2025-12-15.preview (Public Preview)
 * 
 * Reference: https://docs.stripe.com/agentic-commerce/enable-in-context-selling-on-ai-agents
 * 
 * Usage:
 * STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/upload-product-catalog.ts
 */

async function uploadProductCatalog() {
  // Check for Stripe API key
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
    console.error('Usage: STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/upload-product-catalog.ts');
    process.exit(1);
  }

  // Initialize Stripe with the preview API version for Data Management API
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.preview' as any, // Preview version for Data Management API
    timeout: 60000, // 60 second timeout
    maxNetworkRetries: 2,
  });
  
  // Set the Stripe-Version header for Data Management API
  const stripeVersionHeader = '2025-12-15.preview';

  // Path to the CSV file
  const csvPath = path.join(process.cwd(), 'mock-products', 'upload.csv');

  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  try {
    console.log('📤 Uploading product catalog to Stripe...');
    console.log(`📁 File: ${csvPath}`);
    
    // Read the file as buffer
    const fileBuffer = fs.readFileSync(csvPath);
    const fileStats = fs.statSync(csvPath);
    
    console.log(`📊 File size: ${fileStats.size} bytes (${(fileStats.size / 1024).toFixed(2)} KB)`);
    console.log('⏳ This may take a moment...\n');
    
    // Step 1: Upload the CSV file using Files API
    console.log('Step 1: Uploading CSV file...');
    
    // Create form data for the file upload
    const fileFormData = new FormData();
    fileFormData.append('purpose', 'data_management_manual_upload');
    fileFormData.append('file', new Blob([fileBuffer], { type: 'text/csv' }), 'product-catalog.csv');

    const fileResponse = await fetch('https://files.stripe.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
      body: fileFormData,
    });

    if (!fileResponse.ok) {
      const error = await fileResponse.json();
      throw new Error(`Failed to upload file: ${error.error?.message || fileResponse.statusText}`);
    }

    const file = await fileResponse.json();

    console.log('✅ File uploaded successfully!');
    console.log('📋 File Details:');
    console.log(`   ID: ${file.id}`);
    console.log(`   Filename: ${file.filename}`);
    console.log(`   Size: ${file.size} bytes`);
    console.log(`   Created: ${new Date(file.created * 1000).toISOString()}`);
    console.log(`   Purpose: ${file.purpose}\n`);
    
    // Step 2: Create ImportSet to process the catalog
    console.log('Step 2: Creating ImportSet to process catalog...');
    
    // Use fetch for Data Management API with custom header
    const importSetResponse = await fetch('https://api.stripe.com/v1/data_management/import_sets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': stripeVersionHeader,
      },
      body: new URLSearchParams({
        file: file.id,
        standard_data_format: 'product_catalog_feed',
      }),
    });

    if (!importSetResponse.ok) {
      const error = await importSetResponse.json();
      throw new Error(`Failed to create ImportSet: ${error.error?.message || importSetResponse.statusText}`);
    }

    const importSet = await importSetResponse.json();

    console.log('✅ ImportSet created successfully!');
    console.log('📋 ImportSet Details:');
    console.log(`   ID: ${importSet.id}`);
    console.log(`   Status: ${importSet.status}`);
    console.log(`   Created: ${new Date(importSet.created * 1000).toISOString()}\n`);

    console.log('🎉 Product catalog upload complete!');
    console.log('⏳ Stripe is now processing and indexing your products.');
    console.log('💡 Monitor status with: stripe.dataManagement.importSets.retrieve("' + importSet.id + '")');
    console.log('💡 Check your Stripe Dashboard for processing status.');
    console.log('📊 View orders at: https://dashboard.stripe.com/transactions\n');

    return { file, importSet };
  } catch (error) {
    console.error('❌ Error uploading file to Stripe:');
    
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`   Type: ${error.type}`);
      console.error(`   Message: ${error.message}`);
      if (error.code) {
        console.error(`   Code: ${error.code}`);
      }
      if (error.param) {
        console.error(`   Parameter: ${error.param}`);
      }
    } else {
      console.error(error);
    }
    
    process.exit(1);
  }
}

// Run the upload
uploadProductCatalog();

