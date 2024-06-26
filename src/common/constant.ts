export const MS_NAME = 'nestjs-hexarch-example'

export const MILAGE_SEARCH_RANGE = 10000

export const KAFKA_CLIENT_PRODUCER = Symbol('KAFKA_CLIENT_PRODUCER')
export const TOPICS = {
  //// LISTEN TO
  ADD_CAR: 'ADD_CAR',
  SEARCH_CARS: 'SEARCH_CARS',
  REMOVE_CAR: 'REMOVE_CAR',
  //// MESSAGE TO
  VERIFY_REGISTRATION: 'VERIFY_REGISTRATION',
  //// EMIT TO
  SSE_EVENT: 'SSE_EVENT',
}
export const KAFKA_MESSAGE_PATTERN_SUFFIXED_METADATA = Symbol('KAFKA_MESSAGE_PATTERN_SUFFIXED_METADATA')
export const KAFKA_EVENT_PATTERN_SUFFIXED_METADATA = Symbol('KAFKA_EVENT_PATTERN_SUFFIXED_METADATA')

export const MONGO_CONNECTION_NAME = 'DBConnection'
export const MONGO_COLLECTIONS = {
  CAR: 'cars',
}
