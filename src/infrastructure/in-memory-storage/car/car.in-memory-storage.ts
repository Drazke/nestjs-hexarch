import { Injectable } from '@nestjs/common'
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

@Injectable()
export class CarInMemoryStorage implements CarInfrastructurePort {
  public cars: Car[]

  constructor() {
    this.cars = []
  }

  async createCar({ registrationNumber, ...rest }: CreateCarInput): CreateCarResult {
    if (this.cars.find(car => car.registrationNumber === registrationNumber)) {
      return null
    }

    const length = this.cars.push({ registrationNumber, ...rest })
    return this.cars[length - 1]
  }

  async findCarByRegistrationNumber({
    registrationNumber,
  }: FindCarByRegistrationNumberInput): FindCarByRegistrationNumberResult {
    return this.cars.find(car => car.registrationNumber === registrationNumber) ?? null
  }

  async findCarsByFilters({
    mileageFrom,
    mileageTo,
    brand,
    color,
    registrationNumber,
  }: FindCarsByFiltersInput): FindCarsByFiltersResult {
    return this.cars
      .filter(car => {
        if (mileageFrom) {
          return car.mileage >= mileageFrom
        }
        return true
      })
      .filter(car => {
        if (mileageTo) {
          return car.mileage <= mileageTo
        }
        return true
      })
      .filter(car => {
        if (brand) {
          return car.brand === brand
        }
        return true
      })
      .filter(car => {
        if (color) {
          return car.color === color
        }
        return true
      })
      .filter(car => {
        if (registrationNumber) {
          return car.registrationNumber === registrationNumber
        }
        return true
      })
  }

  async deleteCar({ registrationNumber }: DeleteCarInput): DeleteCarResult {
    const index = this.cars.findIndex(car => car.registrationNumber === registrationNumber)

    if (index !== -1) {
      this.cars.splice(index, 1)
    }
  }
}
