import { WinstonLogger } from '../../../common/winston.logger'
import { Car } from '../entity/car.entity'
import { ConfigType } from '@nestjs/config'
import { mainConfig } from '../../../config/main.config'

export class CarAlreadyExistError extends Error {
  matchCode = 'CarAlreadyExistError'

  constructor(
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
    car: Pick<Car, 'registrationNumber'>,
  ) {
    const message = `Car with registrationNumber ${car.registrationNumber} already exist`
    super(message)
    this.logger.warn(message)
  }
}
