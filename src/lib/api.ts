/**
 * Frontend API client
 * All data fetching should go through this module, not direct store imports
 */

// ============================================
// LOGGING UTILITIES
// ============================================

const logApiRequest = (method: string, url: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔵 API Request: ${method} ${url}`, details || '');
};

const logApiSuccess = (method: string, url: string, status: number, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🟢 API Success: ${method} ${url} (${status})`);
  if (process.env.NODE_ENV !== 'production') {
    console.log('   Response:', data);
  }
};

const logApiError = (method: string, url: string, status: number, error: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] 🔴 API Error: ${method} ${url} (${status})`);
  console.error('   Error Details:', {
    statusText: error.statusText,
    message: error.message,
    stack: error.stack,
  });
  // Send error context to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).__LOVELINK_API_ERRORS__ = (window as any).__LOVELINK_API_ERRORS__ || [];
    (window as any).__LOVELINK_API_ERRORS__.push({
      timestamp,
      method,
      url,
      status,
      error: error.message,
    });
  }
};

// ============================================
// HELPER FUNCTION FOR API CALLS
// ============================================

const makeRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const method = options.method || 'GET';
  
  logApiRequest(method, url);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = new Error(`${response.statusText}`);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      logApiError(method, url, response.status, error);
      throw error;
    }

    const data = await response.json();
    logApiSuccess(method, url, response.status, data);
    return data;
  } catch (error) {
    const err = error as any;
    const status = err.status || 0;
    logApiError(method, url, status, err);
    throw error;
  }
};

// ============================================
// API METHODS
// ============================================

export const api = {
  /**
   * Health check - verify server is responding
   */
  healthCheck: async () => {
    try {
      return await makeRequest('/api/health');
    } catch (error) {
      console.error('Health check failed - server may be down:', error);
      throw error;
    }
  },

  /**
   * Fetch all templates
   */
  getTemplates: async () => {
    try {
      return await makeRequest('/api/templates');
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Fetch a single template by ID or slug
   */
  getTemplate: async (idOrSlug: string) => {
    try {
      return await makeRequest(`/api/templates/${idOrSlug}`);
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  /**
   * Fetch all stories
   */
  getStories: async () => {
    try {
      return await makeRequest('/api/stories');
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },

  /**
   * Fetch user's stories
   */
  getUserStories: async () => {
    try {
      return await makeRequest('/api/stories/user');
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  },

  /**
   * Save a new or updated story
   */
  saveStory: async (story: any) => {
    try {
      return await makeRequest('/api/stories', {
        method: 'POST',
        body: JSON.stringify(story),
      });
    } catch (error) {
      console.error('Error saving story:', error);
      throw error;
    }
  },

  /**
   * Get announcements
   */
  getAnnouncements: async () => {
    try {
      return await makeRequest('/api/announcements');
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },
};

// ============================================
// DEBUGGING UTILITIES
// ============================================

// Make debugging utilities available globally in production
if (typeof window !== 'undefined') {
  (window as any).__LOVELINK_DEBUG__ = {
    api,
    healthCheck: () => api.healthCheck(),
    getErrors: () => (window as any).__LOVELINK_API_ERRORS__ || [],
    clearErrors: () => {
      (window as any).__LOVELINK_API_ERRORS__ = [];
    },
  };
  
  // Log that debugging tools are available
  console.log('🔧 LoveLink Debug Tools Available - Type window.__LOVELINK_DEBUG__ in console');
}
