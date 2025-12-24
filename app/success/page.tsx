"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface SessionDetails {
  sessionId: string;
  status: "complete" | "processing" | "pending";
  timestamp: number;
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
  paymentStatus?: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchSessionDetails = async () => {
      try {
        const response = await fetch(
          `/api/webhooks/stripe?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch session details");
        }

        const data = await response.json();
        setSessionDetails(data);
      } catch (err) {
        console.error("Error fetching session details:", err);
        setError("Unable to retrieve payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const formatPrice = (amount: number | undefined, currency: string | undefined) => {
    if (!amount || !currency) return "";
    const price = (amount / 100).toFixed(2);
    const currencySymbol = currency === "usd" ? "$" : currency.toUpperCase();
    return `${currencySymbol}${price}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
          <p className="mt-4 text-lg">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <h1 className="text-xl font-bold text-red-900 dark:text-red-100">
                Error
              </h1>
            </div>
            <p className="text-red-800 dark:text-red-200 mb-4">
              {error || "Unable to load payment information"}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-solid border-transparent transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm h-10 px-4"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isComplete = sessionDetails.status === "complete";
  const isProcessing = sessionDetails.status === "processing";

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Success/Processing Header */}
        <div
          className={`rounded-lg p-8 mb-6 ${
            isComplete
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : isProcessing
              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            {isComplete ? (
              <svg
                className="w-16 h-16 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            ) : isProcessing ? (
              <svg
                className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin"
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
                className="w-16 h-16 text-yellow-600 dark:text-yellow-400"
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
            <div>
              <h1
                className={`text-3xl font-bold ${
                  isComplete
                    ? "text-green-900 dark:text-green-100"
                    : isProcessing
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-yellow-900 dark:text-yellow-100"
                }`}
              >
                {isComplete
                  ? "Payment Successful!"
                  : isProcessing
                  ? "Payment Processing"
                  : "Payment Pending"}
              </h1>
              <p
                className={`mt-2 ${
                  isComplete
                    ? "text-green-800 dark:text-green-200"
                    : isProcessing
                    ? "text-blue-800 dark:text-blue-200"
                    : "text-yellow-800 dark:text-yellow-200"
                }`}
              >
                {isComplete
                  ? "Thank you for your purchase! Your payment has been processed successfully."
                  : isProcessing
                  ? "Your payment is being processed. This may take a few moments for certain payment methods."
                  : "Your payment is pending confirmation."}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          
          <div className="space-y-3">
            {/* Session ID */}
            <div className="flex justify-between items-center py-2 border-b border-foreground/10">
              <span className="text-sm opacity-70">Session ID</span>
              <span className="font-mono text-sm">{sessionDetails.sessionId}</span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center py-2 border-b border-foreground/10">
              <span className="text-sm opacity-70">Status</span>
              <span
                className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  isComplete
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                    : isProcessing
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                }`}
              >
                {sessionDetails.status.charAt(0).toUpperCase() + sessionDetails.status.slice(1)}
              </span>
            </div>

            {/* Amount */}
            {sessionDetails.amountTotal && sessionDetails.currency && (
              <div className="flex justify-between items-center py-2 border-b border-foreground/10">
                <span className="text-sm opacity-70">Amount Paid</span>
                <span className="font-bold text-lg">
                  {formatPrice(sessionDetails.amountTotal, sessionDetails.currency)}
                </span>
              </div>
            )}

            {/* Email */}
            {sessionDetails.customerEmail && (
              <div className="flex justify-between items-center py-2 border-b border-foreground/10">
                <span className="text-sm opacity-70">Email</span>
                <span className="text-sm">{sessionDetails.customerEmail}</span>
              </div>
            )}

            {/* Date */}
            <div className="flex justify-between items-center py-2">
              <span className="text-sm opacity-70">Date</span>
              <span className="text-sm">{formatDate(sessionDetails.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {isComplete && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                  <li>You will receive a confirmation email shortly</li>
                  <li>Your order will be processed within 1-2 business days</li>
                  <li>Keep this session ID for your records</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-yellow-900 dark:text-yellow-100">
                <p className="font-medium mb-1">Payment Processing</p>
                <p className="opacity-90">
                  Your payment is being processed. For certain payment methods like bank transfers,
                  this can take several hours or days. You&apos;ll receive an email confirmation once
                  the payment is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 rounded-full border border-solid border-foreground/20 transition-colors flex items-center justify-center hover:bg-foreground/5 text-sm h-12 px-5"
          >
            Return to Home
          </Link>
          <Link
            href="/products"
            className="flex-1 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm h-12 px-5"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm opacity-70">
          <p>
            Need help? Contact our support team with your session ID:{" "}
            <span className="font-mono">{sessionDetails.sessionId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}

