import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiClient } from '@/services/api.client';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ResetResponse {
  message: string;
  reset_token?: string; // Only returned in dev mode
}

export function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await apiClient.post<ResetResponse>('/auth/forgot-password', {
        email: data.email,
      });
      setIsSuccess(true);
      
      // In development mode, the API returns the token directly
      if (response.reset_token) {
        setDevToken(response.reset_token);
      }
    } catch (error) {
      console.error("Forgot password failed", error);
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Failed to send reset email. Please try again.');
      } else {
        setErrorMessage('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-500">
          If an account exists with that email, we've sent password reset instructions.
        </p>
        
        {/* Development mode: Show token directly */}
        {devToken && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
            <p className="text-xs font-medium text-yellow-800 mb-2">
              🛠️ Development Mode - Reset Token:
            </p>
            <code className="text-xs text-yellow-700 break-all block bg-yellow-100 p-2 rounded">
              {devToken}
            </code>
            <Link 
              to={`/reset-password?token=${devToken}`}
              className="mt-3 inline-block text-sm font-medium text-primary-500 hover:text-primary-600"
            >
              Click here to reset password →
            </Link>
          </div>
        )}

        <div className="pt-4">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email and we'll send you instructions to reset your password.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            {...register('email')} 
            id="email" 
            type="email" 
            placeholder="you@example.com"
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors" 
          />
        </div>
        {errors.email && <p className="text-danger text-sm mt-1">{errors.email.message}</p>}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Send Reset Instructions
      </Button>

      {/* Back to Login Link */}
      <p className="text-center">
        <Link 
          to="/login" 
          className="inline-flex items-center text-sm font-medium text-primary-500 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </Link>
      </p>
    </form>
  );
}
