import { Module, Scope } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { ApplicationAdapterModule } from './application/application-adapter.module'
import { mainConfig } from './config/main.config'
import { validationSchemaConfig } from './config/validation.schema.config'
import { DomainModule } from './domain/domain.module'
import { InfrastructureAdapterModule } from './infrastructure/infrastructure-adapter.module'
import { WinstonLogger } from './common/winston.logger'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
      load: [mainConfig],
      cache: true,
      validationSchema: validationSchemaConfig,
    }),
    InfrastructureAdapterModule.use('real'),
    ApplicationAdapterModule.use('real'),
    DomainModule.use('real'),
  ],
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
  exports: [ConfigModule, WinstonLogger],
})
export class AppModule {}
