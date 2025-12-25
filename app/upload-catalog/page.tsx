'use client';

import { useState } from 'react';

interface UploadResponse {
  success: boolean;
  file?: {
    id: string;
    filename: string;
    size: number;
    created: string;
    purpose: string;
    url?: string;
  };
  importSet?: {
    id: string;
    status: string;
    created: string;
  };
  message?: string;
  error?: string;
}

export default function UploadCatalogPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/upload-catalog', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to upload catalog');
      } else {
        setResponse(data);
      }
    } catch (err) {
      setError('Network error: Failed to upload catalog');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              Upload Product Catalog to Stripe
            </h1>
            <p className="mt-2 text-blue-100">
              Upload your product catalog CSV to Stripe's Agentic Commerce platform
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* File Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                📁 File Information
              </h2>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">File:</span> mock-products/upload.csv</p>
                <p><span className="font-medium">Format:</span> Stripe Product Catalog CSV</p>
                <p><span className="font-medium">Products:</span> 10 mock products</p>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`
                  px-8 py-4 rounded-lg font-semibold text-white text-lg
                  transition-all duration-200 transform hover:scale-105
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  '📤 Upload to Stripe'
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="font-semibold text-red-900">Upload Failed</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {response?.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">✅</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-green-900">
                      Upload Successful!
                    </h3>
                    <p className="text-green-700 mt-1">{response.message}</p>
                  </div>
                </div>

                {response.file && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-3">File Details:</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">File ID:</dt>
                        <dd className="text-gray-900 font-mono">{response.file.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Filename:</dt>
                        <dd className="text-gray-900">{response.file.filename}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Size:</dt>
                        <dd className="text-gray-900">{(response.file.size / 1024).toFixed(2)} KB</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Created:</dt>
                        <dd className="text-gray-900">
                          {new Date(response.file.created).toLocaleString()}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Purpose:</dt>
                        <dd className="text-gray-900">{response.file.purpose}</dd>
                      </div>
                      {response.file.url && (
                        <div className="flex justify-between">
                          <dt className="font-medium text-gray-600">URL:</dt>
                          <dd className="text-gray-900">
                            <a 
                              href={response.file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View File
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {response.importSet && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-3">ImportSet Details:</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">ImportSet ID:</dt>
                        <dd className="text-gray-900 font-mono">{response.importSet.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Status:</dt>
                        <dd className="text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            response.importSet.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                            response.importSet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            response.importSet.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {response.importSet.status}
                          </span>
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Created:</dt>
                        <dd className="text-gray-900">
                          {new Date(response.importSet.created).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Stripe is now processing your product catalog</li>
                    <li>• Products will be indexed into the Stripe Catalog</li>
                    <li>• Check your Stripe Dashboard for processing status</li>
                    <li>• AI agents will be able to discover and sell your products</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About This Upload</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• This uploads your product catalog to Stripe's Agentic Commerce platform</li>
                <li>• Products will be made available for AI agent discovery and shopping</li>
                <li>• The CSV follows Stripe's product catalog specification</li>
                <li>• Includes all required fields: ID, title, description, pricing, shipping, etc.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

