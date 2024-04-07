import { DynamicModule, Module } from '@nestjs/common'
import { WorkshopModule } from './workshop/workshop.module'
import { InfrastructureAdapterModule } from '../infrastructure/infrastructure-adapter.module'

@Module({})
export class DomainModule {
  static use(driver: 'real' | 'in-memory'): DynamicModule {
    const modules = [WorkshopModule.withInfrastructure(InfrastructureAdapterModule.use(driver))]

    return {
      module: DomainModule,
      imports: modules,
      exports: modules,
    }
  }
}
