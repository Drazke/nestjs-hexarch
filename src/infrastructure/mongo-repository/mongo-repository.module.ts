import { Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { mainConfig } from '../../config/main.config'
import { CarMongoRepositoryModule } from './car/car.mongo-repository.module'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigType<typeof mainConfig>) => ({
        uri: config.database.mongoUri,
      }),
      inject: [mainConfig.KEY],
    }),
    CarMongoRepositoryModule,
  ],
  exports: [CarMongoRepositoryModule],
})
export class MongoRepositoryModule {}
