export type DatabaseType = 'mysql' | 'mongodb' | 'postgresql';

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  options?: {
    ssl?: boolean;
    connectionLimit?: number;
    charset?: string;
    [key: string]: any;
  };
}
