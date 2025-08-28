/**
 * @module BorrowController
 * @description Controller for handling borrow-related HTTP requests.
 */

import BorrowUseCase from "../usecases/borrow.usecase.mjs";

/**
 * @class BorrowController
 * @description Manages borrow operations such as borrowing, returning, listing borrows, and retrieving statistics.
 */
class BorrowController {
  /**
   * @constructor
   * @param {Object} borrowUseCase - The use case instance for borrow-related business logic.
   */
  constructor(borrowUseCase) {
    this.borrowUseCase = borrowUseCase;
  }

  /**
   * @method borrowBook
   * @description Handles the borrowing of a book by a user, validating user ID, book ID, and due date.
   * @param {Object} req - Express request object containing user ID (from token or body), book ID, and due date in req.body.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the borrow details or an error message if validation fails.
   */
  borrowBook = async (req, res, next) => {
    try {
      // userId can come from token (preferred) or body (if admin)
      const userId = req.user?.id || req.body.userId;
      if (!userId) return res.status(400).json({ success: false, message: "userId is required" });

      const { bookId, dueDate } = req.body;
      if (!bookId || !dueDate) return res.status(400).json({ success: false, message: "bookId and dueDate are required" });

      const borrow = await this.borrowUseCase.borrowBook({ userId, bookId, dueDate });
      res.status(201).json({ success: true, data: borrow });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @method returnBook
   * @description Handles the return of a borrowed book by its borrow ID, ensuring the user is authorized.
   * @param {Object} req - Express request object containing borrow ID in req.params and user ID in req.user.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the updated borrow details or passes errors to the next middleware.
   */
  returnBook = async (req, res, next) => {
    try {
      const { borrowId } = req.params;
      // optionally ensure the user is the borrower or admin - route should check role
      const updated = await this.borrowUseCase.returnBook(borrowId, req.user?.id);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @method listBorrows
   * @description Retrieves a list of borrow records based on query parameters and user context.
   * @param {Object} req - Express request object containing query parameters in req.query and user details in req.user.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the list of borrow records or passes errors to the next middleware.
   */
  listBorrows = async (req, res, next) => {
    try {
      const result = await this.borrowUseCase.listBorrows(req.query, req.user);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @method mostBorrowed
   * @description Retrieves a list of the most borrowed books, with an optional limit on the number of results.
   * @param {Object} req - Express request object containing an optional top query parameter in req.query.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the most borrowed books or passes errors to the next middleware.
   */
  mostBorrowed = async (req, res, next) => {
    try {
      const top = req.query.top || 10;
      const data = await this.borrowUseCase.getMostBorrowed({ top });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @method activeMembers
   * @description Retrieves a list of the most active members based on borrowing activity, with an optional limit on the number of results.
   * @param {Object} req - Express request object containing an optional top query parameter in req.query.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the most active members or passes errors to the next middleware.
   */
  activeMembers = async (req, res, next) => {
    try {
      const top = req.query.top || 10;
      const data = await this.borrowUseCase.getActiveMembers({ top });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @method availability
   * @description Retrieves the availability status of books in the system.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing book availability data or passes errors to the next middleware.
   */
  availability = async (req, res, next) => {
    try {
      const data = await this.borrowUseCase.getBookAvailability();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}

export default BorrowController;