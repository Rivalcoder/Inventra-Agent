// API client utility for making authenticated database requests
export class ApiClient {
  private static getDatabaseConfig(): any {
    if (typeof window === 'undefined') return null;
    
    // Try to get admin database configuration first (for actual database operations)
    const adminDbConfig = localStorage.getItem('admin_db_config');
    if (adminDbConfig) {
      try {
        const config = JSON.parse(adminDbConfig);
        console.log('Using admin database config:', config);
        return config;
      } catch (error) {
        console.error('Error parsing admin config:', error);
      }
    }
    
    // Try to get user's database configuration
    const userDbConfig = localStorage.getItem('databaseConfig');
    if (userDbConfig) {
      try {
        const config = JSON.parse(userDbConfig);
        console.log('Using user database config:', config);
        return config;
      } catch (error) {
        console.error('Error parsing database config:', error);
        return null;
      }
    }
    
    // Fallback to default config
    const defaultConfig = localStorage.getItem('default_db_config');
    if (defaultConfig) {
      try {
        const config = JSON.parse(defaultConfig);
        console.log('Using default database config:', config);
        return config;
      } catch (error) {
        console.error('Error parsing default config:', error);
        return null;
      }
    }
    
    console.log('No database configuration found');
    return null;
  }

  private static getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add database configuration header
    const dbConfig = this.getDatabaseConfig();
    if (dbConfig) {
      headers['x-user-db-config'] = JSON.stringify(dbConfig);
      console.log('Added database config to headers');
      
      // Add userId if available in config
      if (dbConfig.userId) {
        headers['x-user-id'] = dbConfig.userId;
        console.log('Added userId to headers:', dbConfig.userId);
      }
    } else {
      console.log('No database config available for headers');
    }

    // Also try to get userId from userData
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.userId) {
            headers['x-user-id'] = user.userId;
            console.log('Added userId from userData to headers:', user.userId);
          }
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
    }

    return headers;
  }

  static async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    return fetch(endpoint, {
      ...options,
      headers,
    });
  }

  static async get(endpoint: string): Promise<Response> {
    return this.fetch(endpoint, { method: 'GET' });
  }

  static async post(endpoint: string, data?: any): Promise<Response> {
    return this.fetch(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put(endpoint: string, data?: any): Promise<Response> {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete(endpoint: string): Promise<Response> {
    return this.fetch(endpoint, { method: 'DELETE' });
  }
}
