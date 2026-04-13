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
    accessTokenExpiration: number;
    refreshSecret: string;
    refreshTokenExpiration: number;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/tracking_db',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    accessTokenExpiration: process.env.JWT_EXPIRATION
      ? parseInt(process.env.JWT_EXPIRATION, 10)
      : 900, // 15 minutes in seconds
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION
      ? parseInt(process.env.JWT_REFRESH_EXPIRATION, 10)
      : 604800, // 7 days in seconds
  },
});
