"use client";

import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        {/* Cancel Header */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <svg
              className="w-16 h-16 text-yellow-600 dark:text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h1 className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                Checkout Cancelled
              </h1>
              <p className="mt-2 text-yellow-800 dark:text-yellow-200">
                Your payment was not processed
              </p>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">What happened?</h2>
          <p className="text-sm opacity-80 mb-4">
            You cancelled the checkout process. No charges were made to your payment method.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
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
                <p className="font-medium mb-1">Need help?</p>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                  <li>Having trouble with payment? Try a different payment method</li>
                  <li>Questions about products? Contact our support team</li>
                  <li>Your cart items are still saved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/products"
            className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm h-12 px-5"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full rounded-full border border-solid border-foreground/20 transition-colors flex items-center justify-center hover:bg-foreground/5 text-sm h-12 px-5"
          >
            Return to Home
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm opacity-70">
          <p>
            If you experienced any issues during checkout, please{" "}
            <a href="mailto:support@example.com" className="underline hover:opacity-100">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

