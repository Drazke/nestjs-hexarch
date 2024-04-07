import { connect, Client, Container } from '@dagger.io/dagger'
import { randomUUID } from 'crypto'

async function initNodeEnvironment(client: Client): Promise<Container> {
  const mongo = await client.container().from('mongo:4.2').withExposedPort(27017).asService().start()

  const zookeeper = await client
    .container()
    .from('cp-zookeeper:6.2.7')
    .withEnvVariable('ZOOKEEPER_CLIENT_PORT', '2181')
    .withEnvVariable('ZOOKEEPER_TICK_TIME', '2000')
    .withExposedPort(2181)
    .asService()
    .start()

  const zookeeperIp = await client
    .container()
    .from('node:18-alpine')
    .withServiceBinding('zookeeper', zookeeper)
    .withExec(['sh', '-c', `echo ${randomUUID()} | cat /etc/hosts | grep zookeeper | sed -e "s/\\([0-9.]*\\).*/\\1/"`])
    .stdout()

  const kafkaIp = zookeeperIp
    .trimEnd()
    .split('.')
    .map((n, index) => (index === 3 ? parseInt(n) + 1 : n))
    .join('.')

  const kafka = await client
    .container()
    .from('cp-kafka:6.2.7')
    .withServiceBinding('zookeeper', zookeeper)
    .withEnvVariable('KAFKA_BROKER_ID', '1')
    .withEnvVariable('KAFKA_ZOOKEEPER_CONNECT', 'zookeeper:2181')
    .withEnvVariable('KAFKA_LISTENERS', 'INTERNAL://0.0.0.0:9092,EXTERNAL://0.0.0.0:29092')
    .withEnvVariable('KAFKA_ADVERTISED_LISTENERS', `INTERNAL://localhost:9092,EXTERNAL://${kafkaIp}:29092`)
    .withEnvVariable('KAFKA_LISTENER_SECURITY_PROTOCOL_MAP', 'INTERNAL:PLAINTEXT,EXTERNAL:PLAINTEXT')
    .withEnvVariable('KAFKA_INTER_BROKER_LISTENER_NAME', 'INTERNAL')
    .withEnvVariable('KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR', '1')
    .withEnvVariable('KAFKA_MESSAGE_MAX_BYTES', '200000000')
    .withExposedPort(29092)
    .asService()
    .start()

  const node = client
    .container()
    .from('node:18-alpine')
    .withServiceBinding('mongo', mongo)
    .withServiceBinding('kafka', kafka)
    .withEnvVariable('MONGO_URI', 'mongodb://mongo:27017')
    .withEnvVariable('KAFKA_BOOTSTRAP_SERVERS', `kafka:29092`)

  return node
}

// initialize Dagger client
connect(
  async client => {
    const node = await initNodeEnvironment(client)

    const source = client.host().directory('.', { exclude: ['ci/', 'dist/', '.env'] })

    const runner = node.withDirectory('/app', source).withWorkdir('/app')
    const result = await runner.withExec(['npm', 'run', 'test:integration']).sync()

    console.log(result)
  },
  { LogOutput: process.stdout },
)
