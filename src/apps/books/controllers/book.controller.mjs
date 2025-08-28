/**
 * @module BookController
 * @description Controller for handling book-related HTTP requests.
 */

import BookUseCase from "../usecases/book.usecase.mjs";

/**
 * @class BookController
 * @description Manages book operations such as adding, updating, deleting, and listing books.
 */
class BookController {
  /**
   * @constructor
   * @param {Object} bookUseCase - The use case instance for book-related business logic.
   */
  constructor(bookUseCase) {
    this.bookUseCase = bookUseCase;
  }

  /**
   * @method addBook
   * @description Handles the addition of a new book by processing the request body and invoking the addBook use case.
   * @param {Object} req - Express request object containing book data in req.body.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the created book or passes errors to the next middleware.
   */
  addBook = async (req, res, next) => {
    try {
      const book = await this.bookUseCase.addBook(req.body);
      //console.log("Book added:-----", book);
      res.status(201).json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @method updateBook
   * @description Handles updating an existing book by processing the book ID and request body, invoking the updateBook use case.
   * @param {Object} req - Express request object containing book ID in req.params.id and update data in req.body.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the updated book or passes errors to the next middleware.
   */
  updateBook = async (req, res, next) => {
    try {
      const book = await this.bookUseCase.updateBook(req.params.id, req.body);
      res.status(200).json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @method deleteBook
   * @description Handles the deletion of a book by invoking the deleteBook use case with the provided book ID.
   * @param {Object} req - Express request object containing book ID in req.params.id.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a success message or passes errors to the next middleware.
   */
  deleteBook = async (req, res, next) => {
    try {
      await this.bookUseCase.deleteBook(req.params.id);
      res.status(200).json({ success: true, message: "Book deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @method listBooks
   * @description Handles retrieving a list of books based on query parameters, invoking the listBooks use case.
   * @param {Object} req - Express request object containing query parameters in req.query.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the list of books or passes errors to the next middleware.
   */
  listBooks = async (req, res, next) => {
    try {
      const result = await this.bookUseCase.listBooks(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default BookController;