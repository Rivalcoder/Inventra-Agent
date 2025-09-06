// API client utility for making authenticated database requests
export class ApiClient {
  private static getDatabaseConfig(): any {
    if (typeof window === 'undefined') return null;
    
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
    } else {
      console.log('No database config available for headers');
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
