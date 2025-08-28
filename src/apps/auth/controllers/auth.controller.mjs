/**
 * @module AuthController
 * @description Controller for handling authentication-related HTTP requests.
 */

import AuthUsecase from "../usecases/auth.usecase.mjs";

/**
 * @class AuthController
 * @description Manages authentication operations such as user registration and login.
 */
class AuthController {
  /**
   * @constructor
   * @param {AuthUsecase} authUseCase - The use case instance for authentication logic.
   */
  constructor(authUseCase) {
    this.authUseCase = authUseCase;
  }

  /**
   * @method register
   * @description Handles user registration by processing the request body and invoking the register use case.
   * @param {Object} req - Express request object containing user registration data in req.body.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the registration result or passes errors to the next middleware.
   */
  register = async (req, res, next) => {
    try {
      const result = await this.authUseCase.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @method login
   * @description Handles user login by processing the request body and invoking the login use case.
   * @param {Object} req - Express request object containing user login credentials in req.body.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function for error handling.
   * @returns {Promise<void>} Responds with a JSON object containing the login result or passes errors to the next middleware.
   */
  login = async (req, res, next) => {
    try {
      const result = await this.authUseCase.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;