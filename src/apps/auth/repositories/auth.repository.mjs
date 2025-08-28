import User from "../models/auth.model.mjs";

class AuthRepository {
  async createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async findById(id) {
    return User.findById(id).select("-password");
  }
}

export default AuthRepository;