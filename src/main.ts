// import { ServiceTracing } from '@smt/smt-common-lib/dist/apm'
// import { mainConfig } from './config/main.config'
// import { MS_NAME } from './common/constant'

// const serviceTracing = new ServiceTracing({
//   serviceName: MS_NAME,
//   traceURL: `${mainConfig().tracing.endpoint}/v1/traces`,
//   metricsURL: `${mainConfig().tracing.endpoint}/v1/metrics`,
//   logToConsole: false,
//   diagLogLevel: mainConfig().tracing.logLevel,
//   exportMetrics: true,
// })

// eslint-disable-next-line @typescript-eslint/no-var-requires
const application = require('./application')
// USE THIS NEXT SYNTAX INSTEAD WHEN DYNAMIC IMPORT IS AVAILABLE
// const application = await import('./application')

async function bootstrap(): Promise<void> {
  const [app, config, logger] = await application.initApplication()

  // if (config.tracing.enableOpenTelemetry) {
  //   const otelSDK = serviceTracing.otelSDK
  //   otelSDK.start()
  //   logger.debug(`OTEL started!`)

  //   // gracefully shut down the OpenTelemetry SDK on process exit
  //   process.on('SIGTERM', () => {
  //     otelSDK
  //       .shutdown()
  //       .then(
  //         () => logger.debug('SDK shut down successfully'),
  //         (err: Error) => logger.error('Error shutting down SDK', err.stack),
  //       )
  //       .finally(() => process.exit(0))
  //   })
  // }

  await app.startAllMicroservices()
  await app.listen(config.port)
  logger.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
