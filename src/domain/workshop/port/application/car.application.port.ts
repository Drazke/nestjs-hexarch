import { Car } from '../../entity/car.entity'
import { CarAlreadyExistError } from '../../error/car-already-exist.error'
import { CarNotFoundError } from '../../error/car-not-found.error'
import { CarRegistrationRefusedError } from '../../error/car-registration-refused.error'

export type AddCarInput = Car
export type SearchCarsInput = Partial<Car>
export type RemoveCarInput = Pick<Car, 'registrationNumber'>

export type AddCarResult = Promise<Car | CarAlreadyExistError | CarRegistrationRefusedError>
export type SearchCarsResult = Promise<Car[]>
export type RemoveCarResult = Promise<Car | CarNotFoundError>

export abstract class CarApplicationPort {
  abstract addCar(input: AddCarInput): AddCarResult
  abstract searchCars(input: SearchCarsInput): SearchCarsResult
  abstract removeCar(input: RemoveCarInput): RemoveCarResult
}
