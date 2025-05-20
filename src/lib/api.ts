/**
 * API utilities to handle fetching data in both client and server components
 */

// Helper function to determine the absolute base URL for API requests
export function getBaseUrl() {
    // For browser requests, we can use relative paths
    if (typeof window !== 'undefined') {
        return '';
    }

    // For server-side requests, we need absolute URLs
    // First check for environment variables
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Fallback to a constructed URL based on the environment
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    return `${protocol}://${host}`;
}

// Custom error class for authentication errors
export class AuthError extends Error {
    status: number;

    constructor(message: string, status = 401) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
    }
}

// Custom error class for general API errors
export class ApiError extends Error {
    status: number;

    constructor(message: string, status = 500) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// Utility function to make a GET request
export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
        const response = await fetch(url, {
            ...options,
            method: 'GET',
            headers: {
                ...options?.headers,
            },
            // Add cache control and credentials
            credentials: 'include',
        });

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            throw new AuthError(`Authentication required: ${response.statusText}`, response.status);
        }

        // Handle redirection responses
        if (response.redirected) {
            throw new AuthError(`Redirect detected: ${response.url}`, 302);
        }

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new ApiError(errorData.error || `API error: ${response.statusText}`, response.status);
            } catch (e) {
                // If we can't parse the error, just use the status text
                throw new ApiError(`API error: ${response.statusText}`, response.status);
            }
        }

        return response.json() as Promise<T>;
    } catch (error) {
        // Rethrow AuthErrors as is
        if (error instanceof AuthError || error instanceof ApiError) {
            throw error;
        }

        // For network errors or other exceptions
        console.error('API fetch error:', error);
        throw new ApiError(
            `Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            500
        );
    }
}

// Utility function to make a POST request
export async function apiPost<T, D = unknown>(
    endpoint: string,
    data: D,
    options?: RequestInit
): Promise<T> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
        const response = await fetch(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            // Add credentials for authentication cookies
            credentials: 'include',
            body: JSON.stringify(data),
        });

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            throw new AuthError(`Authentication required: ${response.statusText}`, response.status);
        }

        // Handle redirection responses
        if (response.redirected) {
            throw new AuthError(`Redirect detected: ${response.url}`, 302);
        }

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new ApiError(errorData.error || `API error: ${response.statusText}`, response.status);
            } catch (e) {
                // If we can't parse the error, just use the status text
                throw new ApiError(`API error: ${response.statusText}`, response.status);
            }
        }

        return response.json() as Promise<T>;
    } catch (error) {
        // Rethrow AuthErrors as is
        if (error instanceof AuthError || error instanceof ApiError) {
            throw error;
        }

        // For network errors or other exceptions
        console.error('API fetch error:', error);
        throw new ApiError(
            `Failed to send data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            500
        );
    }
} 