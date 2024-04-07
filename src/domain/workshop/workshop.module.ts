import { DynamicModule, Module, Provider } from '@nestjs/common'
import { CarApplicationPort } from './port/application/car.application.port'
import { CarService } from './service/car.service'

const providers: Provider[] = [
  {
    provide: CarApplicationPort,
    useClass: CarService,
  },
]

@Module({
  providers,
  exports: providers,
})
export class WorkshopModule {
  static withInfrastructure(infrastructureModule: DynamicModule): DynamicModule {
    return {
      module: WorkshopModule,
      imports: [infrastructureModule],
    }
  }
}
