import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from '../books/book.schema';
import { Loan } from './loan.schema';

export const LOAN_DAYS = 14;
export const MAX_ACTIVE_LOANS = 3;

@Injectable()
export class LoansService {
  constructor(
    @InjectModel(Loan.name) private readonly loans: Model<Loan>,
    @InjectModel(Book.name) private readonly books: Model<Book>,
  ) {}

  async borrow(userId: string, bookId: string, now = new Date()) {
    const active = await this.loans.countDocuments({ user: userId, returnedAt: { $exists: false } });
    if (active >= MAX_ACTIVE_LOANS) {
      throw new ConflictException(`Limit of ${MAX_ACTIVE_LOANS} active loans reached`);
    }
    // Atomic decrement: two users cannot take the last copy at the same time.
    const book = await this.books.findOneAndUpdate(
      { _id: bookId, available: { $gt: 0 } },
      { $inc: { available: -1 } },
    );
    if (!book) throw new ConflictException('No copies available');
    const dueDate = new Date(now.getTime() + LOAN_DAYS * 86_400_000);
    return this.loans.create({ user: userId, book: bookId, dueDate });
  }

  async giveBack(userId: string, loanId: string, now = new Date()) {
    const loan = await this.loans.findOneAndUpdate(
      { _id: loanId, user: userId, returnedAt: { $exists: false } },
      { returnedAt: now },
      { new: true },
    );
    if (!loan) throw new NotFoundException('Active loan not found');
    await this.books.updateOne({ _id: loan.book }, { $inc: { available: 1 } });
    return loan;
  }

  mine(userId: string) {
    return this.loans.find({ user: userId }).sort({ createdAt: -1 }).populate('book').lean();
  }

  overdue(now = new Date()) {
    return this.loans.find({ returnedAt: { $exists: false }, dueDate: { $lt: now } }).lean();
  }
}
