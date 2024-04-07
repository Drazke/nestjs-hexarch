import { WinstonLogger } from '../../../common/winston.logger'
import { ConfigType } from '@nestjs/config'
import { mainConfig } from '../../../config/main.config'

export class UnknownError extends Error {
  matchCode = 'UnknownError'

  constructor(private readonly logger: WinstonLogger<ConfigType<typeof mainConfig>>) {
    const message = `Unknown Error`
    super(message)
    this.logger.error(message)
  }
}
