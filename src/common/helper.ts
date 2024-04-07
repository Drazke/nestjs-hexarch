import { ConfigType } from '@nestjs/config'
import { mainConfig } from '../config/main.config'
import { Transport } from '@nestjs/microservices'
import { KAFKA_EVENT_PATTERN_SUFFIXED_METADATA, KAFKA_MESSAGE_PATTERN_SUFFIXED_METADATA } from './constant'

export const topicSuffixed = (topic: string, config: ConfigType<typeof mainConfig>): string => {
  const regex = RegExp(config.kafka.topicSuffixIgnorePattern)
  return config.kafka.topicSuffixIgnorePattern !== '' && regex.test(topic)
    ? topic
    : `${topic}${config.kafka.topicSuffix}`
}

export const MessagePatternSuffixed =
  (pattern: string, transport?: Transport) =>
  (_: object, __: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
    Reflect.defineMetadata(KAFKA_MESSAGE_PATTERN_SUFFIXED_METADATA, { pattern, transport }, descriptor.value)
    return descriptor
  }

export const EventPatternSuffixed =
  (pattern: string, transport?: Transport) =>
  (_: object, __: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
    Reflect.defineMetadata(KAFKA_EVENT_PATTERN_SUFFIXED_METADATA, { pattern, transport }, descriptor.value)
    return descriptor
  }
