import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ClientKafka } from '@nestjs/microservices'
import { catchError, firstValueFrom, of } from 'rxjs'
import { KAFKA_CLIENT_PRODUCER, TOPICS } from '../../../common/constant'
import { WinstonLogger } from '../../../common/winston.logger'
import { mainConfig } from '../../../config/main.config'
import { UnknownError } from '../../../domain/workshop/error/unknown.error'
import {
  RegistrationInfrastructurePort,
  VerifyRegistrationInput,
  VerifyRegistrationResult,
} from '../../../domain/workshop/port/infrastructure/registration.infrastructure.port'
import { topicSuffixed } from '../../../common/helper'

@Injectable()
export class RegistrationKafkaBroker implements RegistrationInfrastructurePort {
  constructor(
    @Inject(KAFKA_CLIENT_PRODUCER) private readonly clientKafka: ClientKafka,
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
    @Inject(mainConfig.KEY) private readonly config: ConfigType<typeof mainConfig>,
  ) {
    this.logger.setContext(RegistrationKafkaBroker.name)
  }

  async verifyRegistration({ registrationNumber }: VerifyRegistrationInput): VerifyRegistrationResult {
    this.logger.debug(`verifyRegistration: ${registrationNumber}`)
    return firstValueFrom(
      this.clientKafka.send(topicSuffixed(TOPICS.VERIFY_REGISTRATION, this.config), { registrationNumber }).pipe(
        catchError(error => {
          this.logger.error(`Error when verifyRegistration`, error.stack)
          return of(new UnknownError(this.logger))
        }),
      ),
    )
  }
}
