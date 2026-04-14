export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
  };
  aws: {
    region: string;
    endpointUrl: string;
    accessKeyId: string;
    secretAccessKey: string;
    sqs: {
      queueUrl: string;
      queueName: string;
    };
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
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    endpointUrl: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    sqs: {
      queueUrl:
        process.env.SQS_QUEUE_URL ||
        'http://localhost:4566/000000000000/event-ingestion',
      queueName: process.env.SQS_QUEUE_NAME || 'event-ingestion',
    },
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
