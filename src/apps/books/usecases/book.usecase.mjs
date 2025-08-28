/**
 * @module BookUseCase
 * @description Use case class for handling book-related business logic.
 */

import { getPagination, getMeta } from "../../utils/pagination.utils.mjs";
import { buildSearchQuery } from "../../utils/search.utils.mjs";

/**
 * @class BookUseCase
 * @description Manages book operations such as adding, updating, deleting, and listing books, interacting with the repository layer.
 */
class BookUseCase {
  /**
   * @constructor
   * @param {Object} bookRepository - The repository instance for book-related database operations.
   */
  constructor(bookRepository) {
    this.bookRepository = bookRepository;
  }

  /**
   * @method addBook
   * @description Adds a new book to the database.
   * @param {Object} data - The book data containing title, author, ISBN, publicationDate, genre, and copies.
   * @returns {Promise<Object>} The created book document.
   */
  async addBook(data) {
    return this.bookRepository.createBook(data);
  }

  /**
   * @method updateBook
   * @description Updates an existing book by ID with the provided data.
   * @param {string} id - The ID of the book to update.
   * @param {Object} data - The updated book data.
   * @returns {Promise<Object>} The updated book document.
   * @throws {Error} If the book with the specified ID is not found.
   */
  async updateBook(id, data) {
    const book = await this.bookRepository.updateBook(id, data);
    if (!book) throw new Error("Book not found");
    return book;
  }

  /**
   * @method deleteBook
   * @description Deletes a book from the database by ID.
   * @param {string} id - The ID of the book to delete.
   * @returns {Promise<Object>} The deleted book document.
   * @throws {Error} If the book with the specified ID is not found.
   */
  async deleteBook(id) {
    const book = await this.bookRepository.deleteBook(id);
    if (!book) throw new Error("Book not found");
    return book;
  }

  /**
   * @method listBooks
   * @description Retrieves a paginated list of books based on query parameters, filters, and search criteria.
   * @param {Object} query - Query parameters for pagination, filtering, and searching.
   * @param {string} [query.page] - The page number for pagination (optional).
   * @param {string} [query.limit] - The number of books per page (optional).
   * @param {string} [query.genre] - Filter books by genre (optional).
   * @param {string} [query.author] - Filter books by author (optional).
   * @param {string} [query.search] - Search term for title, author, genre, or ISBN (optional).
   * @returns {Promise<Object>} An object containing the list of books and metadata for pagination.
   * @property {Array<Object>} books - The list of book documents.
   * @property {Object} meta - Pagination metadata including total count, current page, and limit.
   */
  async listBooks(query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {};
    if (query.genre) filters.genre = query.genre;
    if (query.author) filters.author = query.author;

    const searchQuery = buildSearchQuery(query, ["title", "author", "genre", "ISBN"]);

    const { books, total } = await this.bookRepository.listBooks({
      skip,
      limit,
      filters,
      searchQuery
    });

    return { books, meta: getMeta(total, page, limit) };
  }
}

export default BookUseCase;