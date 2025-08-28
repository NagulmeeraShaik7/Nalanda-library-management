/**
 * @module AuthUseCase
 * @description Use case class for handling authentication logic, including user registration and login.
 */

import jwt from "jsonwebtoken";

/**
 * @class AuthUseCase
 * @description Manages authentication operations such as user registration and login, interacting with the repository layer.
 */
class AuthUseCase {
  /**
   * @constructor
   * @param {Object} authRepository - The repository instance for database operations.
   */
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * @method register
   * @description Registers a new user with the provided user data.
   * @param {Object} userData - The user data containing name, email, password, and optional role.
   * @param {string} userData.name - The user's full name.
   * @param {string} userData.email - The user's email address.
   * @param {string} userData.password - The user's password.
   * @param {string} [userData.role] - The user's role (optional, defaults to "Member").
   * @returns {Promise<Object>} The created user's details (id, name, email, role).
   * @throws {Error} If a user with the provided email already exists.
   */
  async register(userData) {
    const existingUser = await this.authRepository.findByEmail(userData.email);
    if (existingUser) throw new Error("User already exists");

    const user = await this.authRepository.createUser(userData);
    return { id: user._id, name: user.name, email: user.email, role: user.role };
  }

  /**
   * @method login
   * @description Authenticates a user with their email and password, returning a JWT token and user details.
   * @param {Object} credentials - The login credentials.
   * @param {string} credentials.email - The user's email address.
   * @param {string} credentials.password - The user's password.
   * @returns {Promise<Object>} An object containing the JWT token and user details (id, name, role).
   * @throws {Error} If the email or password is invalid.
   */
  async login({ email, password }) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid email or password");

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    return { token, user: { id: user._id, name: user.name, role: user.role } };
  }
}

export default AuthUseCase;