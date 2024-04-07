import { DynamicModule, Module, Type } from '@nestjs/common'
import { CarHandler } from './handler/car.handler'
import { WinstonLogger } from '../../common/winston.logger'
import { mainConfig } from '../../config/main.config'
import { ConfigType } from '@nestjs/config'
import { KafkaDecoratorProcessorService } from './kafka-decorator-processor.service'

const handlers: Type[] = [CarHandler]

@Module({
  controllers: handlers,
  providers: [
    {
      provide: KafkaDecoratorProcessorService,
      useFactory(logger: WinstonLogger<ConfigType<typeof mainConfig>>, config: ConfigType<typeof mainConfig>) {
        const instance = new KafkaDecoratorProcessorService(logger, config)
        instance.process(handlers)
        return instance
      },
      inject: [WinstonLogger, mainConfig.KEY],
    },
  ],
})
export class KafkaModule {
  static withDomain(domainModule: DynamicModule): DynamicModule {
    return {
      module: KafkaModule,
      imports: [domainModule],
    }
  }
}
