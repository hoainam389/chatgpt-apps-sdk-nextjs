import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

/**
 * API Route to upload product catalog to Stripe
 * 
 * POST /api/upload-catalog
 * 
 * This endpoint uploads the product catalog CSV file to Stripe using the correct two-step process:
 * 1. Upload CSV file using Files API with 'data_management_manual_upload' purpose
 * 2. Create an ImportSet using Data Management API to process and index the catalog
 * 
 * API Version: 2025-12-15.preview (Public Preview)
 * 
 * Reference: https://docs.stripe.com/agentic-commerce/enable-in-context-selling-on-ai-agents
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.preview' as any, // Preview version for Data Management API
  timeout: 60000, // 60 second timeout
  maxNetworkRetries: 2,
});

// Stripe-Version header for Data Management API
const STRIPE_VERSION_HEADER = '2025-12-15.preview';

export async function POST(request: NextRequest) {
  try {
    // Check for Stripe API key
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe API key not configured' },
        { status: 500 }
      );
    }

    // Path to the CSV file
    const csvPath = path.join(process.cwd(), 'mock-products', 'upload.csv');

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { error: 'Product catalog CSV file not found' },
        { status: 404 }
      );
    }

    // Read the file as buffer
    const fileBuffer = fs.readFileSync(csvPath);
    const fileStats = fs.statSync(csvPath);
    
    console.log(`Uploading file: ${csvPath}`);
    console.log(`File size: ${fileStats.size} bytes (${(fileStats.size / 1024).toFixed(2)} KB)`);
    
    // Step 1: Upload the CSV file using Files API
    console.log('Step 1: Uploading CSV file...');
    
    // Create form data for the file upload
    const fileFormData = new FormData();
    fileFormData.append('purpose', 'data_management_manual_upload');
    fileFormData.append('file', new Blob([fileBuffer], { type: 'text/csv' }), 'product-catalog.csv');

    const fileResponse = await fetch('https://files.stripe.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
      body: fileFormData,
    });

    if (!fileResponse.ok) {
      const error = await fileResponse.json();
      throw new Error(`Failed to upload file: ${error.error?.message || fileResponse.statusText}`);
    }

    const file = await fileResponse.json();

    console.log(`File uploaded: ${file.id}`);
    
    // Step 2: Create ImportSet to process the catalog
    console.log('Step 2: Creating ImportSet...');
    const importSetResponse = await fetch('https://api.stripe.com/v1/data_management/import_sets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': STRIPE_VERSION_HEADER,
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
    console.log(`ImportSet created: ${importSet.id}, Status: ${importSet.status}`);

    return NextResponse.json({
      success: true,
      file: {
        id: file.id,
        filename: file.filename,
        size: file.size,
        created: new Date(file.created * 1000).toISOString(),
        purpose: file.purpose,
        url: file.url,
      },
      importSet: {
        id: importSet.id,
        status: importSet.status,
        created: new Date(importSet.created * 1000).toISOString(),
      },
      message: 'Product catalog uploaded and ImportSet created successfully. Stripe is processing and indexing your products.',
    });
  } catch (error) {
    console.error('Error uploading catalog:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: 'Stripe API error',
          type: error.type,
          message: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload product catalog' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to upload product catalog',
    endpoint: '/api/upload-catalog',
    method: 'POST',
  });
}

