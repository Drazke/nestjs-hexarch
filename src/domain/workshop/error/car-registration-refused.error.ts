import { WinstonLogger } from '../../../common/winston.logger'
import { Car } from '../entity/car.entity'
import { ConfigType } from '@nestjs/config'
import { mainConfig } from '../../../config/main.config'

export class CarRegistrationRefusedError extends Error {
  matchCode = 'CarRegistrationRefusedError'

  constructor(
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
    car: Pick<Car, 'registrationNumber'>,
  ) {
    const message = `Car with registration not allowed for: ${car.registrationNumber}`
    super(message)
    this.logger.warn(message)
  }
}
