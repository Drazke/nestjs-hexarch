import { Test, TestingModule } from '@nestjs/testing'
import { CarService } from './car.service'
import { CarInfrastructurePort } from '../port/infrastructure/car.infrastructure.port'
import { generateCar } from 'test/mock/car.mock'
import { Car } from '../entity/car.entity'
import { CarNotFoundError } from '../error/car-not-found.error'
import { CarAlreadyExistError } from '../error/car-already-exist.error'
import { InfrastructureAdapterModule } from '../../../infrastructure/infrastructure-adapter.module'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { mainConfig } from '../../../config/main.config'
import { WinstonLogger } from '../../../common/winston.logger'
import { CarInMemoryStorage } from '../../../infrastructure/in-memory-storage/car/car.in-memory-storage'
import { Scope } from '@nestjs/common'
import { RegistrationInMemoryStorage } from '../../../infrastructure/in-memory-storage/registration/registration.in-memory-storage'
import { RegistrationInfrastructurePort } from '../port/infrastructure/registration.infrastructure.port'
import { CarRegistrationRefusedError } from '../error/car-registration-refused.error'

describe('ProfileService', () => {
  let carService: CarService
  let carInMemoryStorage: CarInMemoryStorage
  let registrationInMemoryStorage: RegistrationInMemoryStorage

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [mainConfig], isGlobal: true }),
        {
          module: TestingModule,
          providers: [
            {
              provide: WinstonLogger,
              scope: Scope.TRANSIENT,
              useFactory(config: ConfigType<typeof mainConfig>) {
                return new WinstonLogger(config)
              },
              inject: [mainConfig.KEY],
            },
          ],
          exports: [WinstonLogger],
          global: true,
        },
        InfrastructureAdapterModule.use('in-memory'),
      ],
      providers: [CarService],
    }).compile()

    carService = module.get<CarService>(CarService)
    carInMemoryStorage = module.get<CarInMemoryStorage>(CarInfrastructurePort)
    registrationInMemoryStorage = module.get<RegistrationInMemoryStorage>(RegistrationInfrastructurePort)
  })

  it('initialization', () => {
    expect(carService).toBeDefined()
  })

  describe('addCar', () => {
    let cars: Car[]

    beforeEach(async () => {
      cars = [generateCar({ registrationNumber: '1234' })]
      carInMemoryStorage.cars.push(...cars)
      registrationInMemoryStorage.allowedRegistrations.push(cars[0].registrationNumber)
    })

    it('should throw error when car already exist', async () => {
      const result = await carService.addCar(generateCar({ registrationNumber: cars[0].registrationNumber }))
      expect(result).toBeInstanceOf(CarAlreadyExistError)
    })

    it('should throw error when registrationNumber is not allowed', async () => {
      const result = await carService.addCar(generateCar({ registrationNumber: '12345678' }))
      expect(result).toBeInstanceOf(CarRegistrationRefusedError)
    })

    it('should add car', async () => {
      const car1 = generateCar({ brand: 'Peugeot' })
      registrationInMemoryStorage.allowedRegistrations.push(car1.registrationNumber)
      const result = await carService.addCar(car1)

      expect(result).toMatchObject(car1)
      expect(carInMemoryStorage.cars.find(car => car.brand === 'Peugeot')).toBeDefined()
    })
  })

  describe('searchCars', () => {
    let cars: Car[]

    beforeEach(async () => {
      cars = [generateCar({ brand: 'Tesla' }), generateCar({ brand: 'Toyota' })]
      carInMemoryStorage.cars.push(...cars)
    })

    it('should find cars with exact brand', async () => {
      const result = await carService.searchCars({ brand: 'Tesla' })

      expect(result.length).toBe(1)
      expect(result).toMatchObject([cars[0]])
    })
  })

  describe('removeCar', () => {
    let cars: Car[]

    beforeEach(async () => {
      cars = [generateCar({ brand: 'Ford' })]
      carInMemoryStorage.cars.push(...cars)
    })

    it('should throw error when not found', async () => {
      const result = await carService.removeCar({ registrationNumber: 'UNKNOWN' })

      expect(result).toBeInstanceOf(CarNotFoundError)
    })

    it('should remove car', async () => {
      const result = await carService.removeCar({ registrationNumber: cars[0].registrationNumber })

      expect(result).toMatchObject(cars[0])
      expect(carInMemoryStorage.cars.find(car => car.brand === 'Ford')).toBeUndefined()
    })
  })
})
