// Configuration service for environment-based settings

export interface AppConfig {
  authMode: 'airtable' | 'local';
  enableDemoMode: boolean;
  defaultDatabaseType: string;
  airtableConfig: {
    apiKey: string;
    baseId: string;
  };
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    // Check if we're on the client side before accessing localStorage
    const isClient = typeof window !== 'undefined';
    
    // Safely get stored auth mode from localStorage only on client side
    let storedAuthMode: string | null = null;
    if (isClient) {
      try {
        storedAuthMode = localStorage.getItem('app_auth_mode');
      } catch (error) {
        console.warn('Failed to access localStorage:', error);
      }
    }

    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         (isClient && 
                          (window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1'));

    return {
      authMode: (storedAuthMode as 'airtable' | 'local') || (process.env.AUTH_MODE as 'airtable' | 'local') || 'local',
      enableDemoMode: isDevelopment || process.env.ENABLE_DEMO_MODE === 'true',
      defaultDatabaseType: process.env.DEFAULT_DATABASE_TYPE || 'mysql',
      airtableConfig: {
        apiKey: process.env.AIRTABLE_API_KEY || '',
        baseId: process.env.AIRTABLE_BASE_ID || ''
      }
    };
  }

  getAuthMode(): 'airtable' | 'local' {
    return this.config.authMode;
  }

  setAuthMode(mode: 'airtable' | 'local') {
    this.config.authMode = mode;
    // Only set localStorage on client side
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app_auth_mode', mode);
      } catch (error) {
        console.warn('Failed to set localStorage:', error);
      }
    }
  }

  isDemoMode(): boolean {
    return this.config.enableDemoMode;
  }

  getDefaultDatabaseType(): string {
    return this.config.defaultDatabaseType;
  }

  getAirtableConfig() {
    return this.config.airtableConfig;
  }

  // Check if we're in a development environment
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' || 
           (typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1'));
  }

  // Get the current environment
  getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  // Check if Airtable is properly configured
  isAirtableConfigured(): boolean {
    return !!(this.config.airtableConfig.apiKey && this.config.airtableConfig.baseId);
  }

  // Get all configuration
  getAllConfig(): AppConfig {
    return { ...this.config };
  }
}

// Create a singleton instance
let configServiceInstance: ConfigService | null = null;

export const configService = (() => {
  if (typeof window === 'undefined') {
    // Server-side: create new instance
    if (!configServiceInstance) {
      configServiceInstance = new ConfigService();
    }
    return configServiceInstance;
  } else {
    // Client-side: create new instance or return existing
    if (!configServiceInstance) {
      configServiceInstance = new ConfigService();
    }
    return configServiceInstance;
  }
})(); 