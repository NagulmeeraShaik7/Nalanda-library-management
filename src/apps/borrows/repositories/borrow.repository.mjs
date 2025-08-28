/**
 * @module BorrowRepository
 * @description Repository class for handling database operations related to book borrowing.
 */

import Borrow from "../models/borrow.model.mjs";
import Book from "../../books/models/book.model.mjs";
import mongoose from "mongoose";

/**
 * @class BorrowRepository
 * @description Manages database operations for borrow records, including creating, updating, querying, and aggregating borrow data.
 */
class BorrowRepository {
  /**
   * @method createBorrow
   * @description Creates a new borrow record in the database.
   * @param {Object} data - The borrow data including userId, bookId, and dueDate.
   * @returns {Promise<Object>} The saved borrow document.
   */
  async createBorrow(data) {
    const borrow = new Borrow(data);
    return borrow.save();
  }

  /**
   * @method findById
   * @description Finds a borrow record by its ID, populating user and book details.
   * @param {string} id - The ID of the borrow record to find.
   * @returns {Promise<Object|null>} The borrow document with populated user (name, email) and book (title, author, ISBN) fields, or null if not found.
   */
  async findById(id) {
    return Borrow.findById(id).populate("userId", "name email").populate("bookId", "title author ISBN");
  }

  /**
   * @method updateBorrow
   * @description Updates a borrow record by ID with the provided data, populating user and book details.
   * @param {string} id - The ID of the borrow record to update.
   * @param {Object} update - The updated borrow data.
   * @returns {Promise<Object|null>} The updated borrow document with populated user (name, email) and book (title, author, ISBN) fields, or null if not found.
   */
  async updateBorrow(id, update) {
    return Borrow.findByIdAndUpdate(id, update, { new: true }).populate("userId", "name email").populate("bookId", "title author ISBN");
  }

  /**
   * @method listBorrows
   * @description Retrieves a paginated list of borrow records based on query parameters.
   * @param {Object} options - Query options for listing borrow records.
   * @param {number} [options.skip=0] - Number of documents to skip for pagination.
   * @param {number} [options.limit=10] - Maximum number of documents to return.
   * @param {Object} [options.query={}] - Additional query filters for borrow records.
   * @returns {Promise<Object>} An object containing the list of borrow records and the total count of matching documents.
   * @property {Array<Object>} borrows - The list of borrow documents with populated user and book fields.
   * @property {number} total - The total number of matching borrow records.
   */
  async listBorrows({ skip = 0, limit = 10, query = {} }) {
    const borrows = await Borrow.find(query)
      .populate("userId", "name email")
      .populate("bookId", "title author ISBN")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Borrow.countDocuments(query);
    return { borrows, total };
  }

  /**
   * @method mostBorrowedBooks
   * @description Aggregates and retrieves the most borrowed books, limited to a specified number.
   * @param {Object} options - Options for the aggregation query.
   * @param {number} [options.top=10] - Maximum number of books to return.
   * @returns {Promise<Array<Object>>} A list of objects containing book details (bookId, title, author, ISBN) and their borrow count, sorted by borrow count in descending order.
   */
  async mostBorrowedBooks({ top = 10 }) {
    const pipeline = [
      { $group: { _id: "$bookId", borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: top },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" },
      {
        $project: {
          _id: 0,
          bookId: "$book._id",
          title: "$book.title",
          author: "$book.author",
          ISBN: "$book.ISBN",
          borrowCount: 1
        }
      }
    ];

    return Borrow.aggregate(pipeline);
  }

  /**
   * @method activeMembers
   * @description Aggregates and retrieves the most active members based on borrowing activity, limited to a specified number.
   * @param {Object} options - Options for the aggregation query.
   * @param {number} [options.top=10] - Maximum number of users to return.
   * @returns {Promise<Array<Object>>} A list of objects containing user details (userId, name, email) and their borrow count, sorted by borrow count in descending order.
   */
  async activeMembers({ top = 10 }) {
    const pipeline = [
      { $group: { _id: "$userId", borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: top },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          borrowCount: 1
        }
      }
    ];

    return Borrow.aggregate(pipeline);
  }

  /**
   * @method bookAvailabilitySummary
   * @description Aggregates and retrieves a summary of book availability, including total, borrowed, and available copies.
   * @returns {Promise<Object>} An object containing per-book availability details and overall totals.
   * @property {Array<Object>} perBook - List of book details with total, borrowed, and available copies.
   * @property {Object} totals - Summary of total books, borrowed books, and available books across the system.
   */
  async bookAvailabilitySummary() {
    // total books (sum of copies), borrowed copies (count of active borrows), available = total - borrowed
    // We'll use the books collection to sum copies and borrows collection to count borrowed copies per book
    const booksSummary = await Book.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          ISBN: 1,
          copies: 1
        }
      },
      {
        $lookup: {
          from: "borrows",
          let: { bookId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$bookId", "$$bookId"] }, { $eq: ["$status", "borrowed"] }] } } },
            { $count: "borrowedCount" }
          ],
          as: "borrowInfo"
        }
      },
      {
        $addFields: {
          borrowedCount: { $ifNull: [{ $arrayElemAt: ["$borrowInfo.borrowedCount", 0] }, 0] },
          availableCopies: { $subtract: ["$copies", { $ifNull: [{ $arrayElemAt: ["$borrowInfo.borrowedCount", 0] }, 0] }] }
        }
      },
      {
        $project: {
          _id: 0,
          bookId: "$_id",
          title: 1,
          author: 1,
          ISBN: 1,
          totalCopies: "$copies",
          borrowedCopies: "$borrowedCount",
          availableCopies: 1
        }
      }
    ]);

    const totals = booksSummary.reduce(
      (acc, b) => {
        acc.totalBooks += b.totalCopies;
        acc.borrowedBooks += b.borrowedCopies;
        acc.availableBooks += Math.max(0, b.availableCopies);
        return acc;
      },
      { totalBooks: 0, borrowedBooks: 0, availableBooks: 0 }
    );

    return { perBook: booksSummary, totals };
  }
}

export default BorrowRepository;