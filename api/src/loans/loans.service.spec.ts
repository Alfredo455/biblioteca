import { ConflictException, NotFoundException } from '@nestjs/common';
import { LOAN_DAYS, LoansService, MAX_ACTIVE_LOANS } from './loans.service';

function setup(overrides: { active?: number; book?: unknown; loan?: unknown } = {}) {
  const loans = {
    countDocuments: jest.fn().mockResolvedValue(overrides.active ?? 0),
    create: jest.fn().mockImplementation((d) => Promise.resolve(d)),
    findOneAndUpdate: jest.fn().mockResolvedValue(overrides.loan ?? null),
  };
  const books = {
    findOneAndUpdate: jest
      .fn()
      .mockResolvedValue(overrides.book === undefined ? { id: 'b1' } : overrides.book),
    updateOne: jest.fn().mockResolvedValue({}),
  };
  return { loans, books, service: new LoansService(loans as never, books as never) };
}

describe('LoansService', () => {
  it('creates a loan due in LOAN_DAYS days', async () => {
    const { service, books } = setup();
    const now = new Date('2026-01-01T00:00:00Z');
    const loan = (await service.borrow('u1', 'b1', now)) as unknown as { dueDate: Date };
    expect(loan.dueDate.getTime() - now.getTime()).toBe(LOAN_DAYS * 86_400_000);
    expect(books.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'b1', available: { $gt: 0 } },
      { $inc: { available: -1 } },
    );
  });

  it('rejects when the user hit the active-loan limit', async () => {
    const { service, books } = setup({ active: MAX_ACTIVE_LOANS });
    await expect(service.borrow('u1', 'b1')).rejects.toBeInstanceOf(ConflictException);
    expect(books.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects when no copies are available', async () => {
    const { service, loans } = setup({ book: null });
    await expect(service.borrow('u1', 'b1')).rejects.toBeInstanceOf(ConflictException);
    expect(loans.create).not.toHaveBeenCalled();
  });

  it('returns a book and restores the copy', async () => {
    const { service, books } = setup({ loan: { book: 'b1' } });
    await service.giveBack('u1', 'l1');
    expect(books.updateOne).toHaveBeenCalledWith({ _id: 'b1' }, { $inc: { available: 1 } });
  });

  it('404s when returning a loan that is not active', async () => {
    const { service } = setup({ loan: null });
    await expect(service.giveBack('u1', 'l1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
