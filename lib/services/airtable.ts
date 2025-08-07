// Airtable service for user authentication and database management

interface UserData {
  username: string;
  email: string;
  password: string; // In real app, this should be hashed
  databaseType: string;
  databaseConfig: Record<string, string>;
  createdAt: string;
  lastLogin?: string;
}

interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableName: string;
}

class AirtableService {
  private config: AirtableConfig;

  constructor() {
    // In production, these would come from environment variables
    this.config = {
      apiKey: process.env.AIRTABLE_API_KEY || '',
      baseId: process.env.AIRTABLE_BASE_ID || '',
      tableName: 'Users'
    };
  }

  // Create a new user account
  async createUser(userData: UserData): Promise<boolean> {
    try {
      // In a real implementation, you would make an API call to Airtable
      // For now, we'll simulate the API call
      console.log('Creating user in Airtable:', {
        fields: {
          Username: userData.username,
          Email: userData.email,
          Password: userData.password, // In real app, hash this
          DatabaseType: userData.databaseType,
          DatabaseConfig: JSON.stringify(userData.databaseConfig),
          CreatedAt: userData.createdAt
        }
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store in localStorage for demo purposes
      const users = JSON.parse(localStorage.getItem('airtable_users') || '[]');
      users.push(userData);
      localStorage.setItem('airtable_users', JSON.stringify(users));

      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  }

  // Verify user credentials
  async verifyUser(email: string, password: string): Promise<UserData | null> {
    try {
      // In a real implementation, you would query Airtable
      // For now, we'll check localStorage
      const users = JSON.parse(localStorage.getItem('airtable_users') || '[]');
      const user = users.find((u: UserData) => u.email === email && u.password === password);

      if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        const updatedUsers = users.map((u: UserData) => 
          u.email === email ? user : u
        );
        localStorage.setItem('airtable_users', JSON.stringify(updatedUsers));

        return user;
      }

      return null;
    } catch (error) {
      console.error('Error verifying user:', error);
      return null;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<UserData | null> {
    try {
      const users = JSON.parse(localStorage.getItem('airtable_users') || '[]');
      return users.find((u: UserData) => u.email === email) || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Update user database configuration
  async updateUserDatabaseConfig(email: string, databaseConfig: Record<string, string>): Promise<boolean> {
    try {
      const users = JSON.parse(localStorage.getItem('airtable_users') || '[]');
      const updatedUsers = users.map((u: UserData) => 
        u.email === email 
          ? { ...u, databaseConfig, updatedAt: new Date().toISOString() }
          : u
      );
      localStorage.setItem('airtable_users', JSON.stringify(updatedUsers));
      return true;
    } catch (error) {
      console.error('Error updating user config:', error);
      return false;
    }
  }

  // Get all users (for admin purposes)
  async getAllUsers(): Promise<UserData[]> {
    try {
      return JSON.parse(localStorage.getItem('airtable_users') || '[]');
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Delete user account
  async deleteUser(email: string): Promise<boolean> {
    try {
      const users = JSON.parse(localStorage.getItem('airtable_users') || '[]');
      const filteredUsers = users.filter((u: UserData) => u.email !== email);
      localStorage.setItem('airtable_users', JSON.stringify(filteredUsers));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

// Real Airtable API implementation (commented out for demo)
/*
class RealAirtableService {
  private config: AirtableConfig;

  constructor() {
    this.config = {
      apiKey: process.env.AIRTABLE_API_KEY || '',
      baseId: process.env.AIRTABLE_BASE_ID || '',
      tableName: 'Users'
    };
  }

  async createUser(userData: UserData): Promise<boolean> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${this.config.baseId}/${this.config.tableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            Username: userData.username,
            Email: userData.email,
            Password: userData.password, // Hash this in production
            DatabaseType: userData.databaseType,
            DatabaseConfig: JSON.stringify(userData.databaseConfig),
            CreatedAt: userData.createdAt
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  }

  async verifyUser(email: string, password: string): Promise<UserData | null> {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${this.config.baseId}/${this.config.tableName}?filterByFormula={Email}='${email}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const user = data.records[0];

      if (user && user.fields.Password === password) {
        return {
          username: user.fields.Username,
          email: user.fields.Email,
          password: user.fields.Password,
          databaseType: user.fields.DatabaseType,
          databaseConfig: JSON.parse(user.fields.DatabaseConfig),
          createdAt: user.fields.CreatedAt,
          lastLogin: new Date().toISOString()
        };
      }

      return null;
    } catch (error) {
      console.error('Error verifying user:', error);
      return null;
    }
  }
}
*/

export const airtableService = new AirtableService();
export type { UserData }; 