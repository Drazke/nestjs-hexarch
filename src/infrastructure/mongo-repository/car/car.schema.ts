import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { MONGO_COLLECTIONS } from '../../../common/constant'
import { Car } from '../../../domain/workshop/entity/car.entity'

export type CarDocument = HydratedDocument<Car>

@Schema({ collection: MONGO_COLLECTIONS.CAR })
export class CarForSchema implements Car {
  @Prop()
  registrationNumber!: string
  @Prop()
  mileage!: number
  @Prop()
  color!: string
  @Prop()
  brand!: string
}

export const CarSchema = SchemaFactory.createForClass(CarForSchema)
