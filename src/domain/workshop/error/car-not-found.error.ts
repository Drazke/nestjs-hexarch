import { WinstonLogger } from '../../../common/winston.logger'
import { Car } from '../entity/car.entity'
import { ConfigType } from '@nestjs/config'
import { mainConfig } from '../../../config/main.config'

export class CarNotFoundError extends Error {
  matchCode = 'CarNotFoundError'

  constructor(
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
    car: Partial<Car>,
  ) {
    const message = `Could not find car with: ${JSON.stringify(car)}`
    super(message)
    this.logger.error(message)
  }
}
