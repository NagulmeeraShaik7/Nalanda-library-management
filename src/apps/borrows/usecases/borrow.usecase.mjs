/**
 * @module BorrowUseCase
 * @description Use case class for handling borrow-related business logic, including borrowing, returning, and querying borrow records.
 */

import mongoose from "mongoose";
import { getPagination, getMeta } from "../../utils/pagination.utils.mjs";
import { buildSearchQuery } from "../../utils/search.utils.mjs";
import Book from "../../books/models/book.model.mjs";

/**
 * @class BorrowUseCase
 * @description Manages borrow operations such as borrowing a book, returning a book, listing borrows, and retrieving borrowing statistics.
 */
class BorrowUseCase {
  /**
   * @constructor
   * @param {Object} borrowRepository - The repository instance for borrow-related database operations.
   */
  constructor(borrowRepository) {
    this.borrowRepository = borrowRepository;
  }

  /**
   * @method borrowBook
   * @description Borrows a book for a user, validating book availability and updating book copies.
   * @param {Object} params - Parameters for borrowing a book.
   * @param {string} params.userId - The ID of the user borrowing the book.
   * @param {string} params.bookId - The ID of the book to borrow.
   * @param {Date} params.dueDate - The due date for returning the book.
   * @returns {Promise<Object>} The created borrow document.
   * @throws {Error} If the book is not found or not available.
   */
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

  /**
   * @method returnBook
   * @description Returns a borrowed book, updating its status and incrementing book copies.
   * @param {string} borrowId - The ID of the borrow record.
   * @param {string} requestingUserId - The ID of the user requesting the return (for authorization).
   * @returns {Promise<Object>} The updated borrow document.
   * @throws {Error} If the borrow record is not found or the book is not currently borrowed.
   */
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

  /**
   * @method listBorrows
   * @description Retrieves a paginated list of borrow records based on query parameters and user role.
   * @param {Object} query - Query parameters for filtering and pagination.
   * @param {string} [query.page] - The page number for pagination (optional).
   * @param {string} [query.limit] - The number of records per page (optional).
   * @param {string} [query.userId] - Filter by user ID (optional, used by Admins).
   * @param {string} [query.bookId] - Filter by book ID (optional).
   * @param {string} [query.status] - Filter by borrow status (optional).
   * @param {Object} currentUser - The authenticated user's details (id, role).
   * @returns {Promise<Object>} An object containing the list of borrow records and pagination metadata.
   * @property {Array<Object>} borrows - The list of borrow documents.
   * @property {Object} meta - Pagination metadata including total count, current page, and limit.
   */
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

  /**
   * @method getMostBorrowed
   * @description Retrieves the most borrowed books, limited to a specified number.
   * @param {Object} options - Options for the query.
   * @param {number} [options.top=10] - Maximum number of books to return.
   * @returns {Promise<Array<Object>>} A list of objects containing book details and their borrow count.
   */
  async getMostBorrowed({ top = 10 }) {
    const data = await this.borrowRepository.mostBorrowedBooks({ top: Number(top) });
    return data;
  }

  /**
   * @method getActiveMembers
   * @description Retrieves the most active members based on borrowing activity, limited to a specified number.
   * @param {Object} options - Options for the query.
   * @param {number} [options.top=10] - Maximum number of users to return.
   * @returns {Promise<Array<Object>>} A list of objects containing user details and their borrow count.
   */
  async getActiveMembers({ top = 10 }) {
    const data = await this.borrowRepository.activeMembers({ top: Number(top) });
    return data;
  }

  /**
   * @method getBookAvailability
   * @description Retrieves a summary of book availability across the system.
   * @returns {Promise<Object>} An object containing per-book availability details and overall totals.
   */
  async getBookAvailability() {
    const data = await this.borrowRepository.bookAvailabilitySummary();
    return data;
  }
}

export default BorrowUseCase;