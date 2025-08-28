import AuthUseCase from "../usecases/auth.usecase.mjs";
import jwt from "jsonwebtoken";

// Mock jwt
jest.mock("jsonwebtoken");

describe("AuthUseCase", () => {
  let mockAuthRepository;
  let authUseCase;

  beforeEach(() => {
    mockAuthRepository = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    };
    authUseCase = new AuthUseCase(mockAuthRepository);
    jest.clearAllMocks();
    process.env.JWT_SECRET = "testsecret";
  });

  // ------------------ REGISTER ------------------
  describe("register", () => {
    it("should throw error if user already exists", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue({ id: "123" });

      await expect(
        authUseCase.register({ email: "john@example.com", name: "John", password: "123" })
      ).rejects.toThrow("User already exists");

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith("john@example.com");
    });

    it("should create and return new user details if email not taken", async () => {
      const userData = { name: "John Doe", email: "john@example.com", password: "hashed", role: "Member" };
      const mockUser = { _id: "123", ...userData };

      mockAuthRepository.findByEmail.mockResolvedValue(null);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      const result = await authUseCase.register(userData);

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual({
        id: "123",
        name: "John Doe",
        email: "john@example.com",
        role: "Member",
      });
    });
  });

  // ------------------ LOGIN ------------------
  describe("login", () => {
    it("should throw error if user not found", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authUseCase.login({ email: "john@example.com", password: "123" })
      ).rejects.toThrow("Invalid email or password");

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith("john@example.com");
    });

    it("should throw error if password does not match", async () => {
      const mockUser = {
        _id: "123",
        name: "John",
        role: "Member",
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authUseCase.login({ email: "john@example.com", password: "wrongpass" })
      ).rejects.toThrow("Invalid email or password");

      expect(mockUser.comparePassword).toHaveBeenCalledWith("wrongpass");
    });

    it("should return token and user details if login successful", async () => {
      const mockUser = {
        _id: "123",
        name: "John",
        role: "Member",
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      const fakeToken = "faketoken";

      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue(fakeToken);

      const result = await authUseCase.login({ email: "john@example.com", password: "correctpass" });

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith("john@example.com");
      expect(mockUser.comparePassword).toHaveBeenCalledWith("correctpass");
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "123", role: "Member" },
        "testsecret",
        { expiresIn: "1h" }
      );

      expect(result).toEqual({
        token: fakeToken,
        user: { id: "123", name: "John", role: "Member" },
      });
    });
  });
});
