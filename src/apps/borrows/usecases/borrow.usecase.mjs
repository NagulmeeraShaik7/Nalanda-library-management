import mongoose from "mongoose";
import { getPagination, getMeta } from "../../utils/pagination.utils.mjs";
import { buildSearchQuery } from "../../utils/search.utils.mjs";
import Book from "../../books/models/book.model.mjs";

class BorrowUseCase {
  constructor(borrowRepository) {
    this.borrowRepository = borrowRepository;
  }

  async borrowBook({ userId, bookId, dueDate }) {
    // Validate book
    const book = await Book.findById(bookId);
    if (!book) throw new Error("Book not found");
    if (book.copies <= 0) throw new Error("Book not available");

    // Decrement copies in transaction-like flow
    // Using mongoose sessions would be better in production — simple approach here:
    book.copies -= 1;
    await book.save();

    const borrow = await this.borrowRepository.createBorrow({ userId, bookId, dueDate });
    return borrow;
  }

  async returnBook(borrowId, requestingUserId) {
    const borrow = await this.borrowRepository.findById(borrowId);
    if (!borrow) throw new Error("Borrow record not found");
    if (borrow.status !== "borrowed") throw new Error("This book is not currently borrowed");

    // Optional: ensure only borrower or admin can return - enforcement happens in controller/route via auth middleware
    borrow.status = "returned";
    borrow.returnDate = new Date();
    const updated = await this.borrowRepository.updateBorrow(borrowId, { status: borrow.status, returnDate: borrow.returnDate });

    // increment book copies
    const book = await Book.findById(borrow.bookId._id || borrow.bookId);
    if (book) {
      book.copies += 1;
      await book.save();
    }

    return updated;
  }

  async listBorrows(query, currentUser) {
    const { page, limit, skip } = getPagination(query);

    const filters = {};
    // If user is member and didn't request specific userId, restrict to self
    if (query.userId) {
      filters.userId = mongoose.Types.ObjectId(query.userId);
    } else if (currentUser && currentUser.role === "Member") {
      filters.userId = mongoose.Types.ObjectId(currentUser.id);
    }

    // allow filtering by bookId, status
    if (query.bookId) filters.bookId = mongoose.Types.ObjectId(query.bookId);
    if (query.status) filters.status = query.status;

    // build search (search on book title or user name via $lookup isn't trivial here for find; keep simple search on ObjectId or status)
    const searchQuery = buildSearchQuery(query, []); // not using fields here because borrows references; keep for future extension

    const { borrows, total } = await this.borrowRepository.listBorrows({ skip, limit, query: { ...filters, ...searchQuery } });
    return { borrows, meta: getMeta(total, page, limit) };
  }

  async getMostBorrowed({ top = 10 }) {
    const data = await this.borrowRepository.mostBorrowedBooks({ top: Number(top) });
    return data;
  }

  async getActiveMembers({ top = 10 }) {
    const data = await this.borrowRepository.activeMembers({ top: Number(top) });
    return data;
  }

  async getBookAvailability() {
    const data = await this.borrowRepository.bookAvailabilitySummary();
    return data;
  }
}

export default BorrowUseCase;
