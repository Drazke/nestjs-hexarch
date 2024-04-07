import { DynamicModule, Module } from '@nestjs/common'
import { RestModule } from './rest/rest.module'
import { KafkaModule } from './kafka/kafka.module'
import { DomainModule } from '../domain/domain.module'

@Module({})
export class ApplicationAdapterModule {
  static use(driver: 'real' | 'in-memory'): DynamicModule {
    const modules = [KafkaModule.withDomain(DomainModule.use(driver)), RestModule.withDomain(DomainModule.use(driver))]

    return {
      module: ApplicationAdapterModule,
      imports: modules,
      exports: modules,
    }
  }
}
