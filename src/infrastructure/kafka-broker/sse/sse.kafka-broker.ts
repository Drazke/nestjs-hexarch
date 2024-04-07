import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ClientKafka } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { KAFKA_CLIENT_PRODUCER, TOPICS } from '../../../common/constant'
import { WinstonLogger } from '../../../common/winston.logger'
import { mainConfig } from '../../../config/main.config'
import {
  SendSseInput,
  SendSseResult,
  SseInfrastructurePort,
} from '../../../domain/workshop/port/infrastructure/sse.infrastructure.port'
import { topicSuffixed } from '../../../common/helper'

@Injectable()
export class SseKafkaBroker implements SseInfrastructurePort {
  constructor(
    @Inject(KAFKA_CLIENT_PRODUCER) private readonly clientKafka: ClientKafka,
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
    @Inject(mainConfig.KEY) private readonly config: ConfigType<typeof mainConfig>,
  ) {
    this.logger.setContext(SseKafkaBroker.name)
  }

  async sendSse(input: SendSseInput): SendSseResult {
    this.logger.debug(`sendSse ${JSON.stringify(input)}`)
    return firstValueFrom(this.clientKafka.emit(topicSuffixed(TOPICS.SSE_EVENT, this.config), input))
  }
}
