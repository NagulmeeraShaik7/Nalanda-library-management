import jwt from "jsonwebtoken";

class AuthUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async register(userData) {
    const existingUser = await this.authRepository.findByEmail(userData.email);
    if (existingUser) throw new Error("User already exists");

    const user = await this.authRepository.createUser(userData);
    return { id: user._id, name: user.name, email: user.email, role: user.role };
  }

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
