import { Car } from '../../entity/car.entity'

export type SendSseInput = { type: 'create' | 'update' | 'delete'; car: Car }

export type SendSseResult = Promise<void>

export abstract class SseInfrastructurePort {
  abstract sendSse(input: SendSseInput): SendSseResult
}
