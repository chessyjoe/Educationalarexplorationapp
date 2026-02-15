/**
 * Protected Route Wrapper
 * Redirects to auth modal if user is not authenticated.
 */
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
    onAuthRequired?: () => void;
}

export function ProtectedRoute({
    children,
    fallback,
    onAuthRequired
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, show fallback or trigger auth modal
    if (!user) {
        if (onAuthRequired) {
            onAuthRequired();
        }

        return fallback ? (
            <>{fallback}</>
        ) : (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center max-w-md p-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Authentication Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please sign in to access this section.
                    </p>
                </div>
            </div>
        );
    }

    // User is authenticated, render children
    return <>{children}</>;
}

export default ProtectedRoute;
