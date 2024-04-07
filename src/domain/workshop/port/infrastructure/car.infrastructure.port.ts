import { Car } from '../../entity/car.entity'

export type CreateCarInput = Car
export type FindCarsByFiltersInput = Partial<Omit<Car, 'mileage'>> & {
  mileageFrom?: number
  mileageTo?: number
}
export type FindCarByRegistrationNumberInput = Pick<Car, 'registrationNumber'>
export type DeleteCarInput = Pick<Car, 'registrationNumber'>

export type CreateCarResult = Promise<Car | null>
export type FindCarsByFiltersResult = Promise<Car[]>
export type FindCarByRegistrationNumberResult = Promise<Car | null>
export type DeleteCarResult = Promise<void | null>

export abstract class CarInfrastructurePort {
  abstract createCar(input: CreateCarInput): CreateCarResult
  abstract findCarsByFilters(input: FindCarsByFiltersInput): FindCarsByFiltersResult
  abstract findCarByRegistrationNumber(input: FindCarByRegistrationNumberInput): FindCarByRegistrationNumberResult
  abstract deleteCar(input: DeleteCarInput): DeleteCarResult
}
