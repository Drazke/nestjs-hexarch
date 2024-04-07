import { randomInt, randomUUID } from 'crypto'
import { Car } from 'src/domain/workshop/entity/car.entity'

export function generateCar(car: Partial<Car> = {}): Car {
  return {
    registrationNumber: randomUUID(),
    brand: 'test',
    color: 'test',
    mileage: randomInt(1, 100000),
    ...car,
  }
}
