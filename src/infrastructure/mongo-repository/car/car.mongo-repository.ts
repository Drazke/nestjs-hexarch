import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model } from 'mongoose'
import { CarDocument, CarForSchema } from './car.schema'
import {
  CarInfrastructurePort,
  CreateCarInput,
  CreateCarResult,
  DeleteCarInput,
  DeleteCarResult,
  FindCarByRegistrationNumberInput,
  FindCarByRegistrationNumberResult,
  FindCarsByFiltersInput,
  FindCarsByFiltersResult,
} from '../../../domain/workshop/port/infrastructure/car.infrastructure.port'
import { Car } from '../../../domain/workshop/entity/car.entity'
import { ConfigType } from '@nestjs/config'
import { mainConfig } from '../../../config/main.config'
import { WinstonLogger } from '../../../common/winston.logger'

@Injectable()
export class CarMongoRepository implements CarInfrastructurePort {
  constructor(
    @InjectModel(CarForSchema.name) private carModel: Model<CarDocument>,
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
  ) {
    this.logger.setContext(CarMongoRepository.name)
  }

  async createCar(input: CreateCarInput): CreateCarResult {
    this.logger.debug(`createCar: ${JSON.stringify(input)}`)

    try {
      return this.carModel.create(input)
    } catch (err) {
      this.logger.error(err)
      return null
    }
  }

  async findCarByRegistrationNumber({
    registrationNumber,
  }: FindCarByRegistrationNumberInput): FindCarByRegistrationNumberResult {
    this.logger.debug(`findCarByRegistrationNumber: ${registrationNumber}`)
    const car = await this.carModel.findOne({ registrationNumber }).lean()

    if (!car) {
      return null
    }

    return car
  }

  async findCarsByFilters({ mileageFrom, mileageTo, ...rest }: FindCarsByFiltersInput): FindCarsByFiltersResult {
    this.logger.debug(`findCarsByFilters: ${JSON.stringify({ mileageFrom, mileageTo, ...rest })}`)
    const where: FilterQuery<Car> = {
      ...rest,
      ...(mileageFrom ? { mileage: { $gte: mileageFrom } } : {}),
      ...(mileageTo ? { mileage: { $lte: mileageTo } } : {}),
    }

    return this.carModel.find(where).lean()
  }

  async deleteCar({ registrationNumber }: DeleteCarInput): DeleteCarResult {
    this.logger.debug(`deleteCar: ${registrationNumber}`)
    await this.carModel.deleteOne({ registrationNumber })
  }
}
