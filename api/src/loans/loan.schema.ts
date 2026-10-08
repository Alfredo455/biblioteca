import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Loan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId;

  @Prop({ required: true })
  dueDate: Date;

  @Prop()
  returnedAt?: Date;
}

export type LoanDocument = HydratedDocument<Loan>;
export const LoanSchema = SchemaFactory.createForClass(Loan);
