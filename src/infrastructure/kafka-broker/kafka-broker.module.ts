import { Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ClientsModule, KafkaOptions, Transport } from '@nestjs/microservices'
import { KAFKA_CLIENT_PRODUCER, MS_NAME } from '../../common/constant'
import { mainConfig } from '../../config/main.config'
import { InitKafkaProducerService } from './init-kafka-producer.service'
import { SseInfrastructurePort } from '../../domain/workshop/port/infrastructure/sse.infrastructure.port'
import { SseKafkaBroker } from './sse/sse.kafka-broker'
import { RegistrationInfrastructurePort } from '../../domain/workshop/port/infrastructure/registration.infrastructure.port'
import { RegistrationKafkaBroker } from './registration/registration.kafka-broker'

const providers = [
  {
    provide: SseInfrastructurePort,
    useClass: SseKafkaBroker,
  },
  {
    provide: RegistrationInfrastructurePort,
    useClass: RegistrationKafkaBroker,
  },
]

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        inject: [mainConfig.KEY],
        name: KAFKA_CLIENT_PRODUCER,
        useFactory: (config: ConfigType<typeof mainConfig>): KafkaOptions => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: `${MS_NAME}-producer`,
              brokers: config.kafka.brokers,
            },
            consumer: {
              groupId: config.kafka.producerId,
            },
            subscribe: { fromBeginning: true },
            producer: { idempotent: true },
          },
        }),
      },
    ]),
  ],
  providers: [InitKafkaProducerService, ...providers],
  exports: providers,
})
export class KafkaBrokerModule {}
