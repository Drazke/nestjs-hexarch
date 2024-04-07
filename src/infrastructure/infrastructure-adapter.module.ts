import { DynamicModule, Module } from '@nestjs/common'
import { MongoRepositoryModule } from './mongo-repository/mongo-repository.module'
import { InMemoryStorageModule } from './in-memory-storage/in-memory-storage.module'
import { KafkaBrokerModule } from './kafka-broker/kafka-broker.module'

@Module({})
export class InfrastructureAdapterModule {
  static use(driver: 'real' | 'in-memory'): DynamicModule {
    const modules = driver === 'real' ? [MongoRepositoryModule, KafkaBrokerModule] : [InMemoryStorageModule]

    return {
      module: InfrastructureAdapterModule,
      imports: modules,
      exports: modules,
    }
  }
}
