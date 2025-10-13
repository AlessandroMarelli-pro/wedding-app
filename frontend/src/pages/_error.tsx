import { NextPageContext } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';

interface ErrorProps {
  statusCode: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) {
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    // Log error details for debugging
    if (err) {
      console.error('Error details:', err);
      setErrorDetails(err.message || 'Unknown error occurred');
    }
  }, [err]);

  const getErrorMessage = () => {
    switch (statusCode) {
      case 404:
        return {
          title: 'Page Not Found',
          message: "Sorry, the page you're looking for doesn't exist.",
          description:
            'The page you requested could not be found on our server.',
        };
      case 500:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end.',
          description:
            'We are experiencing technical difficulties. Please try again later.',
        };
      default:
        return {
          title: 'An Error Occurred',
          message: 'Something unexpected happened.',
          description:
            'Please try refreshing the page or contact support if the problem persists.',
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <>
      <Head>
        <title>{`${statusCode} - ${errorInfo.title}`}</title>
        <meta name="description" content={errorInfo.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-4">
            <h1 className="text-6xl font-bold text-gray-800 mb-2">
              {statusCode}
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {errorInfo.title}
            </h2>
          </div>

          {/* Error Message */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">{errorInfo.message}</p>
            <p className="text-sm text-gray-500">{errorInfo.description}</p>
          </div>

          {/* Error Details (Development Only) */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Error Details (Development):
            </h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
              {errorDetails}
            </pre>
          </div>
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Go Home
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If this problem persists, please contact us at{' '}
              <a
                href="mailto:support@ricerf2026en26.fr"
                className="text-pink-600 hover:text-pink-700 underline"
              >
                support@ricerf2026en26.fr
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err, asPath }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  // Log the error for debugging
  if (err) {
    console.error('Error in _error.tsx:', {
      statusCode,
      path: asPath,
      error: err.message,
      stack: err.stack,
    });
  }

  return {
    statusCode,
    hasGetInitialPropsRun: true,
    err,
  };
};

export default Error;
