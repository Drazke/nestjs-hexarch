import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { ConfigService, ConfigType } from '@nestjs/config'
import { mainConfig } from './config/main.config'
import { AppModule } from './app.module'
import { KafkaOptions, Transport } from '@nestjs/microservices'
import { MS_NAME } from './common/constant'
import { WinstonLogger } from './common/winston.logger'

export async function initApplication(): Promise<
  [INestApplication, ConfigType<typeof mainConfig>, WinstonLogger<ConfigType<typeof mainConfig>>]
> {
  const app = await NestFactory.create(AppModule)
  const configModule = app.get(ConfigService)
  const config = configModule.get<ConfigType<typeof mainConfig>>('mainConfig')
  if (!config) {
    throw new Error('config not found')
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      enableDebugMessages: config.isDev,
    }),
  )

  const logger = new WinstonLogger(config)
  app.useLogger(logger)

  app.use(helmet())
  app.enableCors({
    origin: config.cors.split(','),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'HEAD', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Content-Disposition'],
  })

  const microservice = app.connectMicroservice<KafkaOptions>(
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: `${MS_NAME}-consumer`,
          brokers: config.kafka.brokers,
        },
        consumer: {
          groupId: config.kafka.consumerId,
        },
        subscribe: { fromBeginning: true },
      },
    },
    { inheritAppConfig: true },
  )
  microservice.useLogger(logger)

  return [app, config, logger]
}
