import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthGuard, Roles } from '../auth/roles';
import { Role } from '../users/user.schema';
import { CreateBookDto } from './books.dto';
import { Book } from './book.schema';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Controller('books')
@UseGuards(AuthGuard)
export class BooksController {
  constructor(@InjectModel(Book.name) private readonly books: Model<Book>) {}

  @Get()
  list(@Query('q') q?: string) {
    const filter = q ? { title: { $regex: escapeRegex(q), $options: 'i' } } : {};
    return this.books.find(filter).limit(50).lean();
  }

  @Post()
  @Roles(Role.Librarian)
  create(@Body() dto: CreateBookDto) {
    return this.books.create({ ...dto, available: dto.copies });
  }
}
