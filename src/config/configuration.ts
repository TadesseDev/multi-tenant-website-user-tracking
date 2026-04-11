export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    accessTokenExpiration: string;
    refreshSecret: string;
    refreshTokenExpiration: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tracking_db',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    accessTokenExpiration: process.env.JWT_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
});
