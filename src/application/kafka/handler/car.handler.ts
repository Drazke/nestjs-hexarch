import { Controller } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { Payload, RpcException, Transport } from '@nestjs/microservices'
import { WinstonLogger } from '../../../common/winston.logger'
import {
  AddCarInput,
  CarApplicationPort,
  RemoveCarInput,
  SearchCarsInput,
} from '../../../domain/workshop/port/application/car.application.port'
import { match, P } from 'ts-pattern'
import { TOPICS } from '../../../common/constant'
import { mainConfig } from '../../../config/main.config'
import { Car } from '../../../domain/workshop/entity/car.entity'
import { CarAlreadyExistError } from '../../../domain/workshop/error/car-already-exist.error'
import { CarRegistrationRefusedError } from '../../../domain/workshop/error/car-registration-refused.error'
import { CarNotFoundError } from '../../../domain/workshop/error/car-not-found.error'
import { EventPatternSuffixed, MessagePatternSuffixed } from '../../../common/helper'

@Controller()
export class CarHandler {
  constructor(
    private readonly carApplicationPort: CarApplicationPort,
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
  ) {
    this.logger.setContext(CarHandler.name)
  }

  @MessagePatternSuffixed(TOPICS.ADD_CAR, Transport.KAFKA)
  public async addCar(@Payload() input: AddCarInput): Promise<Car | string> {
    this.logger.log(`addCar: ${JSON.stringify(input)}`)
    const result = await this.carApplicationPort.addCar(input)

    return match(result)
      .with(P.instanceOf(CarAlreadyExistError), error => error.message)
      .with(P.instanceOf(CarRegistrationRefusedError), error => error.message)
      .with({ registrationNumber: P.string }, car => car)
      .exhaustive()
  }

  @MessagePatternSuffixed(TOPICS.SEARCH_CARS, Transport.KAFKA)
  public async searchCars(@Payload() input: SearchCarsInput): Promise<Car[]> {
    this.logger.log(`searchCars: ${JSON.stringify(input)}`)
    return this.carApplicationPort.searchCars(input)
  }

  @EventPatternSuffixed(TOPICS.REMOVE_CAR, Transport.KAFKA)
  public async removeCar(@Payload() { registrationNumber }: RemoveCarInput): Promise<void> {
    this.logger.log(`removeCar: ${registrationNumber}`)
    const result = await this.carApplicationPort.removeCar({ registrationNumber })

    match(result)
      .with(P.instanceOf(CarNotFoundError), error => {
        throw new RpcException(error.message)
      })
      .with({ registrationNumber: P.string }, car => car)
      .exhaustive()
  }
}
