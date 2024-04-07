import { Inject } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ClientKafka } from '@nestjs/microservices'
import { KAFKA_CLIENT_PRODUCER, TOPICS } from '../../common/constant'
import { mainConfig } from '../../config/main.config'
import { WinstonLogger } from '../../common/winston.logger'

export class InitKafkaProducerService {
  constructor(
    @Inject(KAFKA_CLIENT_PRODUCER) private readonly clientKafka: ClientKafka,
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
    // @Inject(mainConfig.KEY) private readonly config: ConfigType<typeof mainConfig>,
  ) {
    this.logger.setContext(InitKafkaProducerService.name)

    this.clientKafka.subscribeToResponseOf(TOPICS.VERIFY_REGISTRATION)

    this.clientKafka.connect()
    this.logger.debug(`Connecting to kafka`)
  }
}
