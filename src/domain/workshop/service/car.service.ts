import { Injectable } from '@nestjs/common'
import {
  AddCarResult,
  CarApplicationPort,
  RemoveCarInput,
  RemoveCarResult,
  SearchCarsResult,
} from '../port/application/car.application.port'
import { CarInfrastructurePort } from '../port/infrastructure/car.infrastructure.port'
import { Car } from '../entity/car.entity'
import { CarNotFoundError } from '../error/car-not-found.error'
import { MILAGE_SEARCH_RANGE } from '../../../common/constant'
import { CarAlreadyExistError } from '../error/car-already-exist.error'
import { WinstonLogger } from '../../../common/winston.logger'
import { ConfigType } from '@nestjs/config'
import { mainConfig } from '../../../config/main.config'
import { SseInfrastructurePort } from '../port/infrastructure/sse.infrastructure.port'
import { RegistrationInfrastructurePort } from '../port/infrastructure/registration.infrastructure.port'
import { UnknownError } from '../error/unknown.error'
import { CarRegistrationRefusedError } from '../error/car-registration-refused.error'

@Injectable()
export class CarService implements CarApplicationPort {
  constructor(
    private readonly carInfrastructurePort: CarInfrastructurePort,
    private readonly sseInfrastructurePort: SseInfrastructurePort,
    private readonly registrationInfrastructurePort: RegistrationInfrastructurePort,
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
  ) {
    this.logger.setContext(CarService.name)
  }

  async addCar({ registrationNumber, ...rest }: Car): AddCarResult {
    this.logger.debug(`addCar: ${JSON.stringify({ registrationNumber, ...rest })}`)

    const car = await this.carInfrastructurePort.findCarByRegistrationNumber({ registrationNumber })
    if (car) {
      return new CarAlreadyExistError(this.logger, { registrationNumber })
    }

    const verifyResult = await this.registrationInfrastructurePort.verifyRegistration({ registrationNumber })
    if (verifyResult instanceof UnknownError || verifyResult.result === 'block') {
      return new CarRegistrationRefusedError(this.logger, { registrationNumber })
    }

    const result = await this.carInfrastructurePort.createCar({ ...rest, registrationNumber })
    if (!result) {
      return new CarAlreadyExistError(this.logger, { registrationNumber })
    }

    await this.sseInfrastructurePort.sendSse({ type: 'create', car: result })

    return result
  }

  async searchCars({ mileage, ...rest }: Partial<Car>): SearchCarsResult {
    this.logger.debug(`searchCars: ${JSON.stringify({ mileage, ...rest })}`)

    return this.carInfrastructurePort.findCarsByFilters({
      ...rest,
      ...(mileage ? { mileageFrom: mileage - MILAGE_SEARCH_RANGE, mileageTo: mileage + MILAGE_SEARCH_RANGE } : {}),
    })
  }

  async removeCar({ registrationNumber }: RemoveCarInput): RemoveCarResult {
    this.logger.debug(`removeCar: ${registrationNumber}`)
    const car = await this.carInfrastructurePort.findCarByRegistrationNumber({ registrationNumber })

    if (!car) {
      return new CarNotFoundError(this.logger, { registrationNumber })
    }

    await this.carInfrastructurePort.deleteCar({ registrationNumber })

    await this.sseInfrastructurePort.sendSse({ type: 'delete', car })

    return car
  }
}
