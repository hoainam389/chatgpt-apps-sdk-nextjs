"use client";

import { useState, useEffect, useRef } from "react";
import {
  useWidgetProps,
  useMaxHeight,
  useDisplayMode,
  useRequestDisplayMode,
} from "../hooks";

interface Product {
  priceId: string;
  name: string;
  price: number | null;
  currency: string;
}

interface PaymentStatus {
  sessionId: string;
  status: 'complete' | 'processing' | 'pending';
  timestamp: number;
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
}

export default function ProductsPage() {
  const toolOutput = useWidgetProps<Record<string, unknown>>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  
  const [selectedPriceIds, setSelectedPriceIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract products from toolOutput
  const products = (toolOutput?.products as Product[]) || [];
  
  // Track initial load state
  useEffect(() => {
    if (toolOutput !== null && toolOutput !== undefined) {
      setIsInitialLoad(false);
    }
  }, [toolOutput]);

  // Poll for payment status
  useEffect(() => {
    if (!checkoutSessionId) return;

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/webhooks/stripe?session_id=${checkoutSessionId}`
        );
        
        if (response.ok) {
          const data: PaymentStatus = await response.json();
          setPaymentStatus(data);

          // Stop polling if payment is complete
          if (data.status === 'complete') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      }
    };

    // Check immediately
    checkPaymentStatus();

    // Then poll every 3 seconds
    pollingIntervalRef.current = setInterval(checkPaymentStatus, 3000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [checkoutSessionId]);

  const handleCheckboxChange = (priceId: string, checked: boolean) => {
    setSelectedPriceIds((prev) =>
      checked ? [...prev, priceId] : prev.filter((id) => id !== priceId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedPriceIds.length === 0) {
      setError("Please select at least one product");
      return;
    }

    setIsLoading(true);

    try {
      // Use the native window.openai API directly for better compatibility
      if (typeof window !== "undefined" && window?.openai?.callTool) {
        const result = await window.openai.callTool("buy-products", {
          priceIds: selectedPriceIds,
        });

        // The result should have structuredContent with checkoutSessionUrl
        const checkoutUrl = (result as any)?.structuredContent?.checkoutSessionUrl;
        const sessionId = (result as any)?.structuredContent?.checkoutSessionId;
        
        if (checkoutUrl && sessionId) {
          // Store the session ID to start polling
          setCheckoutSessionId(sessionId);
          setPaymentStatus({
            sessionId,
            status: 'pending',
            timestamp: Date.now(),
          });
          
          window.openai.openExternal({ href: checkoutUrl });
        } else {
          setError("Failed to create checkout session. Please try again.");
        }
      } else {
        setError("ChatGPT API not available. Please use this in ChatGPT.");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError("Failed to create checkout session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null) return "";
    const amount = (price / 100).toFixed(2);
    const currencySymbol = currency === "usd" ? "$" : currency.toUpperCase();
    return `${currencySymbol}${amount}`;
  };

  return (
    <div
      className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20"
      style={{
        maxHeight,
        height: displayMode === "fullscreen" ? maxHeight : undefined,
      }}
    >
      {displayMode !== "fullscreen" && (
        <button
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-50 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          onClick={() => requestDisplayMode("fullscreen")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
      )}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-4xl">
        {/* Header */}
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Select Products to Purchase
          </h1>
          <p className="text-sm sm:text-base opacity-80">
            Choose one or more products and proceed to checkout
          </p>
        </div>

        {/* Payment Status */}
        {paymentStatus && (
          <div
            className={`w-full border rounded-lg px-4 py-3 ${
              paymentStatus.status === 'complete'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : paymentStatus.status === 'processing'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {paymentStatus.status === 'complete' ? (
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : paymentStatus.status === 'processing' ? (
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    paymentStatus.status === 'complete'
                      ? 'text-green-900 dark:text-green-100'
                      : paymentStatus.status === 'processing'
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-yellow-900 dark:text-yellow-100'
                  }`}
                >
                  {paymentStatus.status === 'complete'
                    ? '✓ Payment completed successfully!'
                    : paymentStatus.status === 'processing'
                    ? 'Processing your payment...'
                    : 'Waiting for payment...'}
                </p>
                {paymentStatus.customerEmail && (
                  <p className="text-xs opacity-70 mt-1">
                    Confirmation sent to {paymentStatus.customerEmail}
                  </p>
                )}
                {paymentStatus.amountTotal && paymentStatus.currency && (
                  <p className="text-xs opacity-70 mt-1">
                    Amount: {formatPrice(paymentStatus.amountTotal, paymentStatus.currency)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-900 dark:text-red-100 font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Products List */}
        {isInitialLoad ? (
          <div className="w-full text-center py-8">
            <svg
              className="mx-auto h-12 w-12 opacity-50 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <h3 className="mt-2 text-sm font-semibold">
              Loading products...
            </h3>
            <p className="mt-1 text-sm opacity-70">
              Please wait while we fetch available products
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="w-full text-center py-8">
            <svg
              className="mx-auto h-12 w-12 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold">
              No products available
            </h3>
            <p className="mt-1 text-sm opacity-70">
              Please add products in your Stripe Dashboard
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <label
                  key={product.priceId}
                  className="flex items-center p-4 border border-solid rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer"
                    value={product.priceId}
                    checked={selectedPriceIds.includes(product.priceId)}
                    onChange={(e) =>
                      handleCheckboxChange(product.priceId, e.target.checked)
                    }
                  />
                  <div className="ml-3 flex-1 flex items-center justify-between gap-4">
                    <span className="font-medium">
                      {product.name}
                    </span>
                    {product.price !== null && (
                      <span className="font-bold">
                        {formatPrice(product.price, product.currency)}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading || 
                selectedPriceIds.length === 0 || 
                paymentStatus?.status === 'complete'
              }
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentStatus?.status === 'complete' ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Payment Completed</span>
                </>
              ) : isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>
                    Buy Selected Products ({selectedPriceIds.length})
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Info */}
        <div className="w-full pt-4 border-t border-foreground/10">
          <div className="flex items-start gap-2 text-sm opacity-70">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
            <p>
              Secure checkout powered by{" "}
              <span className="font-semibold">Stripe</span>. You&apos;ll be
              redirected to complete your purchase.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

