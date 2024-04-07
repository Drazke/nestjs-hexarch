import { Injectable } from '@nestjs/common'
import {
  SendSseInput,
  SendSseResult,
  SseInfrastructurePort,
} from '../../../domain/workshop/port/infrastructure/sse.infrastructure.port'

@Injectable()
export class SseInMemoryStorage implements SseInfrastructurePort {
  public events: SendSseInput[]

  constructor() {
    this.events = []
  }

  async sendSse(input: SendSseInput): SendSseResult {
    this.events.push(input)
    return
  }
}
