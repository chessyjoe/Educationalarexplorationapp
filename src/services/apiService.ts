/**
 * API Service
 * Handles all API requests to the backend with authentication support.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Auth token management
let authTokenGetter: (() => Promise<string | null>) | null = null;

/**
 * Register a function to get the current auth token.
 * Call this from your AuthContext after initialization.
 */
export function registerAuthTokenGetter(getter: () => Promise<string | null>) {
    authTokenGetter = getter;
}

/**
 * Get authentication headers with current token.
 */
async function getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (authTokenGetter) {
        const token = await authTokenGetter();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
}

/**
 * Helper function to handle API responses.
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({
            detail: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
    }
    return response.json();
}

/**
 * User API
 */
export const userAPI = {
    /**
     * Get current user profile.
     * Creates profile automatically on first call.
     */
    async getProfile() {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/users/me`, { headers });
        return handleResponse(response);
    },

    /**
     * Add a child profile to the current user.
     */
    async addChild(childData: {
        name: string;
        age: number;
        interests?: string[];
        learning_level?: string;
    }) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/users/children`, {
            method: 'POST',
            headers,
            body: JSON.stringify(childData)
        });
        return handleResponse(response);
    },

    /**
     * Get all children for current user.
     */
    async getChildren() {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/users/children`, { headers });
        return handleResponse(response);
    },

    /**
     * Update user preferences.
     */
    async updatePreferences(preferences: Record<string, any>) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(preferences)
        });
        return handleResponse(response);
    }
};

/**
 * Discovery API
 */
export const discoveryAPI = {
    /**
     * Create a new discovery.
     * Works with or without authentication.
     */
    async create(discoveryData: {
        child_id?: string;
        child_name?: string;
        child_age?: number;
        discovery_description?: string;
        location_tag?: string;
        media_type: string;
        media_data: string;
        timestamp?: string;
        location?: { lat: number; lng: number };
    }) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/discovery`, {
            method: 'POST',
            headers,
            body: JSON.stringify(discoveryData)
        });
        return handleResponse(response);
    },

    /**
     * Get discovery history (requires auth).
     */
    async getHistory(params?: {
        child_id?: string;
        limit?: number;
        page?: number;
    }) {
        const headers = await getAuthHeaders();
        const queryParams = new URLSearchParams();
        if (params?.child_id) queryParams.set('child_id', params.child_id);
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.page) queryParams.set('page', params.page.toString());

        const url = `${API_BASE_URL}/api/discoveries${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url, { headers });
        return handleResponse(response);
    },

    /**
     * Get recent discoveries (requires auth).
     */
    async getRecent(days: number = 7) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/discoveries/recent?days=${days}`, {
            headers
        });
        return handleResponse(response);
    },

    /**
     * Get favorite discoveries (requires auth).
     */
    async getFavorites() {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/discoveries/favorites`, {
            headers
        });
        return handleResponse(response);
    },

    /**
     * Toggle favorite status (requires auth).
     */
    async toggleFavorite(discoveryId: string, favorite: boolean = true) {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${API_BASE_URL}/api/discoveries/${discoveryId}/favorite?favorite=${favorite}`,
            {
                method: 'POST',
                headers
            }
        );
        return handleResponse(response);
    }
};

/**
 * Health check
 */
export async function healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
}

export default {
    userAPI,
    discoveryAPI,
    healthCheck,
    registerAuthTokenGetter
};
