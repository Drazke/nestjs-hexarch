import { Injectable } from '@nestjs/common'
import {
  RegistrationInfrastructurePort,
  VerifyRegistrationInput,
  VerifyRegistrationResult,
} from '../../../domain/workshop/port/infrastructure/registration.infrastructure.port'

@Injectable()
export class RegistrationInMemoryStorage implements RegistrationInfrastructurePort {
  public allowedRegistrations: string[]

  constructor() {
    this.allowedRegistrations = []
  }

  async verifyRegistration({ registrationNumber }: VerifyRegistrationInput): VerifyRegistrationResult {
    if (this.allowedRegistrations.includes(registrationNumber)) {
      return { result: 'allow' }
    }

    return { result: 'block' }
  }
}
