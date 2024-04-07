import { ConfigType } from '@nestjs/config'
import { WinstonLogger } from '../../common/winston.logger'
import { mainConfig } from '../../config/main.config'
import { KAFKA_EVENT_PATTERN_SUFFIXED_METADATA, KAFKA_MESSAGE_PATTERN_SUFFIXED_METADATA } from '../../common/constant'
import { EventPattern, MessagePattern } from '@nestjs/microservices'
import { topicSuffixed } from '../../common/helper'
import { Type } from '@nestjs/common'

export class KafkaDecoratorProcessorService {
  constructor(
    private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>,
    private readonly config: ConfigType<typeof mainConfig>,
  ) {}

  process(types: Type[]): void {
    for (const type of types) {
      const propNames = Object.getOwnPropertyNames(type.prototype)
      for (const prop of propNames) {
        const messagePatternValue = Reflect.getMetadata(
          KAFKA_MESSAGE_PATTERN_SUFFIXED_METADATA,
          Reflect.get(type.prototype, prop),
        )
        const eventPatternValue = Reflect.getMetadata(
          KAFKA_EVENT_PATTERN_SUFFIXED_METADATA,
          Reflect.get(type.prototype, prop),
        )

        if (messagePatternValue || eventPatternValue) {
          const patternFunction = messagePatternValue ? MessagePattern : EventPattern
          const { pattern, transport } = messagePatternValue ?? eventPatternValue
          const newPattern = topicSuffixed(pattern, this.config)

          this.logger.log(`Setting topic ${newPattern} for ${type.name}#${prop}`)
          Reflect.decorate(
            [patternFunction(newPattern, transport)],
            type.prototype,
            prop,
            Reflect.getOwnPropertyDescriptor(type.prototype, prop),
          )
        }
      }
    }
  }
}
