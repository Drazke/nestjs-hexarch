import { Module, Provider } from '@nestjs/common'
import { CarInfrastructurePort } from '../../domain/workshop/port/infrastructure/car.infrastructure.port'
import { CarInMemoryStorage } from './car/car.in-memory-storage'
import { RegistrationInfrastructurePort } from '../../domain/workshop/port/infrastructure/registration.infrastructure.port'
import { RegistrationInMemoryStorage } from './registration/registration.in-memory-storage'
import { SseInfrastructurePort } from '../../domain/workshop/port/infrastructure/sse.infrastructure.port'
import { SseInMemoryStorage } from './sse/sse.in-memory-storage'

const providers: Provider[] = [
  {
    provide: CarInfrastructurePort,
    useClass: CarInMemoryStorage,
  },
  {
    provide: RegistrationInfrastructurePort,
    useClass: RegistrationInMemoryStorage,
  },
  {
    provide: SseInfrastructurePort,
    useClass: SseInMemoryStorage,
  },
]

@Module({
  providers,
  exports: providers,
})
export class InMemoryStorageModule {}
