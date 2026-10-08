import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true, index: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true, min: 0 })
  copies: number;

  @Prop({ required: true, min: 0 })
  available: number;
}

export type BookDocument = HydratedDocument<Book>;
export const BookSchema = SchemaFactory.createForClass(Book);
