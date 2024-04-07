import { ConfigType } from '@nestjs/config'
import { initApplication } from '../src/application'
import { mainConfig } from '../src/config/main.config'
import { MONGO_CONNECTION_NAME, MS_NAME, TOPICS } from '../src/common/constant'
import { Admin, Kafka } from 'kafkajs'
import { randomUUID } from 'crypto'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { INestApplication } from '@nestjs/common'
import { isUUID } from 'class-validator'
import { Connection } from 'mongoose'
import { getConnectionToken } from '@nestjs/mongoose'
import { topicSuffixed } from '../src/common/helper'

dayjs.extend(customParseFormat)

const UUID = randomUUID()
const date = dayjs().format('DD-MM-YYYY')
process.env.NODE_ENV = 'test'
process.env.PORT = '4042'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.KAFKA_PRODUCER_ID = `test-producer_${date}_${UUID}`
process.env.KAFKA_CONSUMER_ID = `test_${date}_${UUID}`
process.env.KAKFA_TOPIC_SUFFIX = `.test_${date}_${UUID}`
process.env.DB_NAME_SMT = `DB-Test_${date}_${UUID}`

let appConfiguration: {
  application: INestApplication
  config: ConfigType<typeof mainConfig>
  cleanDB: () => Promise<void>
  cleanKafka: () => Promise<void>
}

export async function setup(): Promise<void> {
  const [app, config, logger] = await initApplication()

  await createTopics(config)

  appConfiguration = {
    application: app,
    config,
    cleanDB: cleanDB(app),
    cleanKafka: cleanKafka(config),
  }

  await app.startAllMicroservices()
  await app.listen(config.port)
  logger.log(`Application is running on: ${await app.getUrl()}`)
}

export async function teardown(): Promise<void> {
  const { application: app, cleanDB, cleanKafka } = appConfiguration

  // ORDER IS IMPORTANT
  await cleanDB()
  await app.close()
  await cleanKafka()
}

async function createTopics(config: ConfigType<typeof mainConfig>): Promise<void> {
  const kafkaAdmin = await getKafkaAdmin(config)

  const topics = Object.values(TOPICS)
    .map(topic => topicSuffixed(topic, config))
    .concat(Object.values(TOPICS).map(topic => `${topicSuffixed(topic, config)}.reply`))

  await kafkaAdmin.createTopics({
    waitForLeaders: true,
    topics: topics.map(topic => ({
      topic,
      numPartitions: 1,
      replicationFactor: 1,
    })),
  })
  await kafkaAdmin.disconnect()
}

async function getKafkaAdmin(config: ConfigType<typeof mainConfig>): Promise<Admin> {
  const kafka = new Kafka({
    brokers: config.kafka.brokers,
    clientId: `${MS_NAME}-admin`,
  })
  const kafkaAdmin = kafka.admin()
  await kafkaAdmin.connect()
  return kafkaAdmin
}

const cleanKafka = (config: ConfigType<typeof mainConfig>) => async (): Promise<void> => {
  const kafkaAdmin = await getKafkaAdmin(config)

  const topics = await kafkaAdmin.listTopics()
  const topicsTodelete = topics.filter(topic => {
    if (topic.includes(UUID)) {
      return true
    }

    // remove old topic that wasn't cleaned up
    const split = topic.split('_')
    if (split.length === 3 && split[0].includes('.test')) {
      const uuid = split[2].split('.')
      if (isUUID(uuid[0]) && dayjs(split[1], 'DD-MM-YYYY').isBefore(dayjs().subtract(1, 'day'))) {
        return true
      }
    }
    return false
  })
  await kafkaAdmin.deleteTopics({
    topics: topicsTodelete,
  })

  const result = await kafkaAdmin.listGroups()
  const groupsTodelete = result.groups
    .filter(group => {
      if (group.groupId.includes(UUID)) {
        return true
      }

      // remove old groupId that wasn't cleaned up
      const split = group.groupId.split('_')
      if (split.length === 4 && isUUID(split[2])) {
        if (dayjs(split[1], 'DD-MM-YYYY').isBefore(dayjs().subtract(1, 'day'))) {
          return true
        }
      }
      return false
    })
    .map(group => group.groupId)
  await kafkaAdmin.deleteGroups(groupsTodelete)

  await kafkaAdmin.disconnect()
}

const cleanDB = (app: INestApplication) => async (): Promise<void> => {
  const connection = app.get<Connection>(getConnectionToken(MONGO_CONNECTION_NAME))

  if (connection.db.databaseName.includes(UUID)) {
    await connection.db.dropDatabase()
  }

  // remove old DB that wasn't cleaned up
  const dbs = await connection.db.admin().listDatabases()
  for (const database of dbs.databases) {
    const split = database.name.split('_')
    if (split.length === 3 && split[0] === 'DB-Test' && isUUID(split[2])) {
      if (dayjs(split[1], 'DD-MM-YYYY').isBefore(dayjs().subtract(1, 'day'))) {
        const newConnection = connection.useDb(database.name)
        await newConnection.db.dropDatabase()
      }
    }
  }

  await connection.close()
}
