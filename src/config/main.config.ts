import { registerAs } from '@nestjs/config'
import { MS_NAME } from '../common/constant'

export const mainConfig = registerAs('mainConfig', () => ({
  isDev: process.env.NODE_ENV !== 'production',
  port: process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 3000,
  cors: process.env.CORS_ORIGINS ?? '*',
  logger: {
    console: process.env.ENABLE_LOGGER_CONSOLE === 'true' || process.env.ENABLE_LOGGER_CONSOLE === '1',
    loggerLevel: process.env.LOG_LEVEL ?? 'info',
  },
  tracing: {
    enableOpenTelemetry: !(process.env.ENABLE_OPEN_TELEMETRY === 'false' || process.env.ENABLE_OPEN_TELEMETRY === '0'),
    endpoint: process.env.OPEN_TELEMETRY_ENDPOINT ?? 'localhost:4318',
    logLevel: process.env.OPEN_TELEMETRY_LOG_LEVEL ?? 'WARN',
  },
  database: {
    mongoUri: process.env.MONGO_URL ?? 'mongodb://localhost:27017',
    mongooseModuleOptions: {
      dbName: process.env.MONGO_DB_NAME ?? 'DBName',
      replicaSet: process.env.MONGO_REPLICA_SET,
    },
  },
  kafka: {
    brokers: process.env.KAFKA_BOOTSTRAP_SERVERS ? process.env.KAFKA_BOOTSTRAP_SERVERS.split(',') : ['localhost:29092'],
    topicSuffix: process.env.KAKFA_TOPIC_SUFFIX ?? '',
    topicSuffixIgnorePattern: process.env.KAKFA_TOPIC_SUFFIX_IGNORE_PATTERN ?? '',
    producerId: process.env.KAFKA_PRODUCER_ID ?? `${MS_NAME}-producer`,
    consumerId: process.env.KAFKA_CONSUMER_ID ?? MS_NAME,
  },
}))
