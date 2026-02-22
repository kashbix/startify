import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ErrorPage() {
  const error = useRouteError();
  let errorMessage: string;
  let errorCode: string | number = '';

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
    errorCode = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = 'Unknown error';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cream-100 p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 mb-6">
          <AlertTriangle className="h-8 w-8 text-danger" />
        </div>

        {/* Error Code */}
        {errorCode && (
          <p className="text-6xl font-bold text-gray-200 mb-2">{errorCode}</p>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
        
        {/* Message */}
        <p className="text-gray-500 mb-6">
          {errorMessage || "We couldn't find what you were looking for."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Link to="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-6">
        If this problem persists, please contact support.
      </p>
    </div>
  );
}
