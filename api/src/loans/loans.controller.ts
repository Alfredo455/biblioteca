import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '../auth/roles';
import { Role } from '../users/user.schema';
import { LoansService } from './loans.service';

type AuthedRequest = { user: { sub: string; role: Role } };

@Controller('loans')
@UseGuards(AuthGuard)
export class LoansController {
  constructor(private readonly loans: LoansService) {}

  @Post('borrow/:bookId')
  borrow(@Req() req: AuthedRequest, @Param('bookId') bookId: string) {
    return this.loans.borrow(req.user.sub, bookId);
  }

  @Post(':id/return')
  giveBack(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.loans.giveBack(req.user.sub, id);
  }

  @Get('mine')
  mine(@Req() req: AuthedRequest) {
    return this.loans.mine(req.user.sub);
  }

  @Get('overdue')
  @Roles(Role.Librarian)
  overdue() {
    return this.loans.overdue();
  }
}
