import AuthRepository from "../repositories/auth.repository.mjs";
import User from "../models/auth.model.mjs";

// Mock User model
jest.mock("../models/auth.model.mjs");

describe("AuthRepository", () => {
  let authRepository;

  beforeEach(() => {
    authRepository = new AuthRepository();
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create and save a new user", async () => {
      const userData = { name: "John Doe", email: "john@example.com", password: "hashed", role: "user" };

      // mock save
      const mockSave = jest.fn().mockResolvedValue({ _id: "123", ...userData });
      User.mockImplementation(() => ({ save: mockSave }));

      const result = await authRepository.createUser(userData);

      expect(User).toHaveBeenCalledWith(userData);
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ _id: "123", ...userData });
    });
  });

  describe("findByEmail", () => {
    it("should call User.findOne with correct email", async () => {
      const email = "john@example.com";
      const mockUser = { _id: "123", name: "John Doe", email };

      User.findOne.mockResolvedValue(mockUser);

      const result = await authRepository.findByEmail(email);

      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });
  });

  describe("findById", () => {
    it("should call User.findById and exclude password field", async () => {
      const id = "123";
      const mockSelect = jest.fn().mockResolvedValue({ _id: id, name: "John Doe", email: "john@example.com" });

      // chainable mongoose query: User.findById().select()
      User.findById.mockReturnValue({ select: mockSelect });

      const result = await authRepository.findById(id);

      expect(User.findById).toHaveBeenCalledWith(id);
      expect(mockSelect).toHaveBeenCalledWith("-password");
      expect(result).toEqual({ _id: id, name: "John Doe", email: "john@example.com" });
    });
  });
});
