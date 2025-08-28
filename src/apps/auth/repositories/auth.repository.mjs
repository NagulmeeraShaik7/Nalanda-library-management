/**
 * @module AuthRepository
 * @description Repository class for handling database operations related to user authentication.
 */

import User from "../models/auth.model.mjs";

/**
 * @class AuthRepository
 * @description Manages database operations for user authentication, including creating users and querying by email or ID.
 */
class AuthRepository {
  /**
   * @method createUser
   * @description Creates a new user in the database.
   * @param {Object} userData - The user data to be saved, including name, email, password, and role.
   * @returns {Promise<Object>} The saved user document.
   */
  async createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  /**
   * @method findByEmail
   * @description Finds a user by their email address.
   * @param {string} email - The email address to search for.
   * @returns {Promise<Object|null>} The user document if found, otherwise null.
   */
  async findByEmail(email) {
    return User.findOne({ email });
  }

  /**
   * @method findById
   * @description Finds a user by their ID, excluding the password field.
   * @param {string} id - The ID of the user to find.
   * @returns {Promise<Object|null>} The user document without the password field if found, otherwise null.
   */
  async findById(id) {
    return User.findById(id).select("-password");
  }
}

export default AuthRepository;