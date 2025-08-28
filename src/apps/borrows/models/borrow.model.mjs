/**
 * @module Borrow
 * @description Mongoose schema and model for the Borrow entity, handling book borrowing records in the database.
 */

import mongoose from "mongoose";

/**
 * @typedef {Object} BorrowSchema
 * @property {mongoose.Schema.Types.ObjectId} userId - Reference to the user who borrowed the book.
 * @property {mongoose.Schema.Types.ObjectId} bookId - Reference to the borrowed book.
 * @property {Date} borrowDate - The date when the book was borrowed (defaults to current date).
 * @property {Date} dueDate - The date by which the book must be returned.
 * @property {Date} [returnDate] - The date when the book was returned (optional).
 * @property {string} status - The status of the borrow record (either "borrowed", "returned", or "overdue").
 * @property {Date} createdAt - Timestamp when the borrow record was created.
 * @property {Date} updatedAt - Timestamp when the borrow record was last updated.
 */

/**
 * @constant borrowSchema
 * @description Mongoose schema for the Borrow model.
 * @type {mongoose.Schema}
 */
const borrowSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue"],
      default: "borrowed"
    }
  },
  { timestamps: true }
);

/**
 * @constantborrowSchema
 * @description Mongoose model for the Borrow collection.
 * @type {mongoose.Model}
 */
export default mongoose.model("Borrow", borrowSchema);