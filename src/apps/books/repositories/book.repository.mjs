/**
 * @module BookRepository
 * @description Repository class for handling database operations related to books.
 */

import Book from "../models/book.model.mjs";

/**
 * @class BookRepository
 * @description Manages database operations for books, including creating, updating, deleting, and querying books.
 */
class BookRepository {
  /**
   * @method createBook
   * @description Creates a new book in the database.
   * @param {Object} data - The book data to be saved, including title, author, ISBN, publicationDate, genre, and copies.
   * @returns {Promise<Object>} The saved book document.
   */
  async createBook(data) {
    const book = new Book(data);
    //console.log("Book created:-----", book);
    return book.save();
  }

  /**
   * @method updateBook
   * @description Updates an existing book by ID with the provided data.
   * @param {string} id - The ID of the book to update.
   * @param {Object} data - The updated book data.
   * @returns {Promise<Object|null>} The updated book document, or null if not found.
   */
  async updateBook(id, data) {
    return Book.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * @method deleteBook
   * @description Deletes a book from the database by ID.
   * @param {string} id - The ID of the book to delete.
   * @returns {Promise<Object|null>} The deleted book document, or null if not found.
   */
  async deleteBook(id) {
    return Book.findByIdAndDelete(id);
  }

  /**
   * @method findById
   * @description Finds a book by its ID.
   * @param {string} id - The ID of the book to find.
   * @returns {Promise<Object|null>} The book document if found, otherwise null.
   */
  async findById(id) {
    return Book.findById(id);
  }

  /**
   * @method listBooks
   * @description Retrieves a paginated list of books based on filters and search criteria.
   * @param {Object} options - Query options for listing books.
   * @param {number} options.skip - Number of documents to skip for pagination.
   * @param {number} options.limit - Maximum number of documents to return.
   * @param {Object} options.filters - Filters to apply to the query (e.g., genre, author).
   * @param {Object} options.searchQuery - Search query for matching book fields (e.g., title, ISBN).
   * @returns {Promise<Object>} An object containing the list of books and the total count of matching documents.
   * @property {Array<Object>} books - The list of book documents.
   * @property {number} total - The total number of matching books.
   */
  async listBooks({ skip, limit, filters, searchQuery }) {
    const query = { ...filters, ...searchQuery };

    const books = await Book.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    return { books, total };
  }
}

export default BookRepository;