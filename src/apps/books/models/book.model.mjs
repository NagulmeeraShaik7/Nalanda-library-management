/**
 * @module Book
 * @description Mongoose schema and model for the Book entity, handling book data in the database.
 */

import mongoose from "mongoose";

/**
 * @typedef {Object} BookSchema
 * @property {string} title - The title of the book.
 * @property {string} author - The author of the book.
 * @property {string} ISBN - The unique ISBN identifier for the book.
 * @property {Date} publicationDate - The publication date of the book.
 * @property {string} genre - The genre of the book.
 * @property {number} copies - The number of available copies of the book (must be non or positive).
 * @property {Date} createdAt - Timestamp when the book record was created.
 * @property {Date} updatedAt - Timestamp when the book record was last updated.
 */

/**
 * @constant bookSchema
 * @description Mongoose schema for the Book model.
 * @type {mongoose.Schema}
 */
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    ISBN: { type: String, required: true, unique: true },
    publicationDate: { type: Date, required: true },
    genre: { type: String, required: true },
    copies: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

/**
 * @constant Book
 * @description Mongoose model for the Book collection.
 * @type {mongoose.Model}
 */
export default mongoose.model("Book", bookSchema);