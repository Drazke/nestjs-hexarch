import joi from 'joi'

export const validationSchemaConfig = joi.object({
  NODE_ENV: joi.string().valid('develop', 'production', 'test').required(),
  NODE_PORT: joi.string().optional().allow(''),

  CORS_ORIGINS: joi.string().optional().allow(''),

  ENABLE_LOGGER_CONSOLE: joi.string().valid('true', 'false', '1', '0').optional().allow(''),
  LOG_LEVEL: joi.string().valid('error', 'warn', 'info', 'verbose', 'debug', 'silly').optional().allow(''),

  ENABLE_OPEN_TELEMETRY: joi.string().valid('true', 'false', '1', '0').optional().allow(''),
  OPEN_TELEMETRY_ENDPOINT: joi.string().required(),
  OPEN_TELEMETRY_LOG_LEVEL: joi
    .string()
    .valid('NONE', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'VERBOSE', 'ALL')
    .optional()
    .allow(''),

  MONGO_URL: joi.string().required(),
  MONGO_DB_NAME: joi.string().optional().allow(''),
  MONGO_REPLICA_SET: joi.string().optional().allow(''),

  KAFKA_BOOTSTRAP_SERVERS: joi.string().required(),
  KAKFA_TOPIC_SUFFIX: joi.string().optional().allow(''),
  KAKFA_TOPIC_SUFFIX_IGNORE_PATTERN: joi.string().optional().allow(''),
  KAFKA_PRODUCER_ID: joi.string().optional().allow(''),
  KAFKA_CONSUMER_ID: joi.string().optional().allow(''),
})
