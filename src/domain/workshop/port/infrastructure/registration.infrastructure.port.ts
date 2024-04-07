import { Car } from '../../entity/car.entity'
import { UnknownError } from '../../error/unknown.error'

export type VerifyRegistrationInput = Pick<Car, 'registrationNumber'>

export type VerifyRegistrationResult = Promise<{ result: 'allow' | 'block' } | UnknownError>

export abstract class RegistrationInfrastructurePort {
  abstract verifyRegistration(input: VerifyRegistrationInput): VerifyRegistrationResult
}
