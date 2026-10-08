import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksModule } from '../books/books.module';
import { Loan, LoanSchema } from './loan.schema';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

@Module({
  imports: [BooksModule, MongooseModule.forFeature([{ name: Loan.name, schema: LoanSchema }])],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}
