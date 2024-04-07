import { MongooseModule } from '@nestjs/mongoose'
import { Module, Provider } from '@nestjs/common'
import { CarInfrastructurePort } from '../../../domain/workshop/port/infrastructure/car.infrastructure.port'
import { CarMongoRepository } from './car.mongo-repository'
import { CarForSchema, CarSchema } from './car.schema'

const providers: Provider[] = [
  {
    provide: CarInfrastructurePort,
    useClass: CarMongoRepository,
  },
]

@Module({
  imports: [MongooseModule.forFeature([{ name: CarForSchema.name, schema: CarSchema }])],
  providers,
  exports: providers,
})
export class CarMongoRepositoryModule {}
