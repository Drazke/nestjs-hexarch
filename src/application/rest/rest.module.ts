import { DynamicModule, Module } from '@nestjs/common'
import { CarController } from './controller/car.controller'

@Module({
  controllers: [CarController],
})
export class RestModule {
  static withDomain(domainModule: DynamicModule): DynamicModule {
    return {
      module: RestModule,
      imports: [domainModule],
    }
  }
}
