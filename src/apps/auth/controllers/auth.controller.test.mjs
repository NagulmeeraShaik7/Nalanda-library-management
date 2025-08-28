import AuthController from "./auth.controller.mjs";

describe("AuthController", () => {
  let mockAuthUsecase;
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockAuthUsecase = {
      register: jest.fn(),
      login: jest.fn()
    };

    controller = new AuthController(mockAuthUsecase);

    mockReq = { body: { email: "test@example.com", password: "123456" } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe("register", () => {
    it("should call authUseCase.register and respond with 201", async () => {
      const fakeResult = { id: "123", email: "test@example.com" };
      mockAuthUsecase.register.mockResolvedValue(fakeResult);

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockAuthUsecase.register).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: fakeResult
      });
    });

    it("should call next(error) if register throws", async () => {
      const error = new Error("Registration failed");
      mockAuthUsecase.register.mockRejectedValue(error);

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("login", () => {
    it("should call authUseCase.login and respond with 200", async () => {
      const fakeResult = { token: "jwt-token" };
      mockAuthUsecase.login.mockResolvedValue(fakeResult);

      await controller.login(mockReq, mockRes, mockNext);

      expect(mockAuthUsecase.login).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: fakeResult
      });
    });

    it("should call next(error) if login throws", async () => {
      const error = new Error("Invalid credentials");
      mockAuthUsecase.login.mockRejectedValue(error);

      await controller.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
