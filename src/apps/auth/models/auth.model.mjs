/**
 * @module User
 * @description Mongoose schema and model for User entity, handling user data and authentication.
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";

/**
 * @typedef {Object} UserSchema
 * @property {string} name - The user's full name.
 * @property {string} email - The user's email address, must be unique and lowercase.
 * @property {string} password - The user's hashed password.
 * @property {string} role - The user's role, either "Admin" or "Member".
 * @property {Date} createdAt - Timestamp when the user was created.
 * @property {Date} updatedAt - Timestamp when the user was last updated.
 */

/**
 * @constant userSchema
 * @description Mongoose schema for the User model.
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Member"], default: "Member" }
  },
  { timestamps: true }
);

/**
 * @method preSave
 * @description Middleware to hash the user's password before saving to the database.
 * @param {Function} next - Mongoose next middleware function.
 * @returns {Promise<void>}
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * @method comparePassword
 * @description Compares a candidate password with the stored hashed password.
 * @param {string} candidatePassword - The password to compare.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * @constant User
 * @description Mongoose model for the User collection.
 * @type {mongoose.Model}
 */
export default mongoose.model("User", userSchema);