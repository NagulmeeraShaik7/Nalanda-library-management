import Borrow from "../models/borrow.model.mjs";
import Book from "../../books/models/book.model.mjs";
import mongoose from "mongoose";

class BorrowRepository {
  async createBorrow(data) {
    const borrow = new Borrow(data);
    return borrow.save();
  }

  async findById(id) {
    return Borrow.findById(id).populate("userId", "name email").populate("bookId", "title author ISBN");
  }

  async updateBorrow(id, update) {
    return Borrow.findByIdAndUpdate(id, update, { new: true }).populate("userId", "name email").populate("bookId", "title author ISBN");
  }

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

  // Aggregation: most borrowed books
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

  // Aggregation: active members
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

  // Aggregation: book availability summary
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
