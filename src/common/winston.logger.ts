import { ConsoleLogger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { mainConfig } from '../config/main.config'

export class WinstonLogger<T extends ConfigType<typeof mainConfig>> extends ConsoleLogger {
  constructor(private readonly config: T) {
    super()

    this.log(this.config.logger.console)
  }
}
