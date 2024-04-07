import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { WinstonLogger } from '../../../common/winston.logger'
import { mainConfig } from '../../../config/main.config'
import { Car } from '../../../domain/workshop/entity/car.entity'
import { CarAlreadyExistError } from '../../../domain/workshop/error/car-already-exist.error'
import { CarNotFoundError } from '../../../domain/workshop/error/car-not-found.error'
import { CarRegistrationRefusedError } from '../../../domain/workshop/error/car-registration-refused.error'
import {
  AddCarInput,
  CarApplicationPort,
  RemoveCarInput,
  SearchCarsInput,
} from '../../../domain/workshop/port/application/car.application.port'
import { match, P } from 'ts-pattern'

@Controller('car')
export class CarController {
  constructor(
    private readonly carApplicationPort: CarApplicationPort,
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
  ) {
    this.logger.setContext(CarController.name)
  }

  @Post()
  public async addCar(@Body() input: AddCarInput): Promise<Car> {
    this.logger.log(`addCar: ${JSON.stringify(input)}`)
    const result = await this.carApplicationPort.addCar(input)

    return match(result)
      .with(P.instanceOf(CarAlreadyExistError), error => {
        throw new ConflictException(error.message)
      })
      .with(P.instanceOf(CarRegistrationRefusedError), error => {
        throw new BadRequestException(error.message)
      })
      .with({ registrationNumber: P.string }, car => car)
      .exhaustive()
  }

  @Get()
  public async searchCars(@Body() input: SearchCarsInput): Promise<Car[]> {
    this.logger.log(`searchCars: ${JSON.stringify(input)}`)
    return this.carApplicationPort.searchCars(input)
  }

  @Delete()
  public async removeCar(@Body() { registrationNumber }: RemoveCarInput): Promise<Car> {
    this.logger.log(`removeCar: ${registrationNumber}`)
    const result = await this.carApplicationPort.removeCar({ registrationNumber })

    return match(result)
      .with(P.instanceOf(CarNotFoundError), error => {
        throw new NotFoundException(error.message)
      })
      .with({ registrationNumber: P.string }, car => car)
      .exhaustive()
  }
}
