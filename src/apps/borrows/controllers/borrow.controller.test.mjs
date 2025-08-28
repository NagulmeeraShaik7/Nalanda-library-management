import BorrowController from "../controllers/borrow.controller.mjs";

describe("BorrowController", () => {
  let mockUseCase;
  let controller;
  let res;
  let next;

  beforeEach(() => {
    mockUseCase = {
      borrowBook: jest.fn(),
      returnBook: jest.fn(),
      listBorrows: jest.fn(),
      getMostBorrowed: jest.fn(),
      getActiveMembers: jest.fn(),
      getBookAvailability: jest.fn(),
    };
    controller = new BorrowController(mockUseCase);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // ---------------- borrowBook ----------------
  describe("borrowBook", () => {
    it("should return 400 if userId missing", async () => {
      const req = { body: {} };

      await controller.borrowBook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "userId is required" });
    });

    it("should return 400 if bookId or dueDate missing", async () => {
      const req = { user: { id: "u1" }, body: { bookId: "b1" } };

      await controller.borrowBook(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "bookId and dueDate are required" });
    });

    it("should borrow book successfully", async () => {
      const req = { user: { id: "u1" }, body: { bookId: "b1", dueDate: "2025-12-01" } };
      const borrow = { id: "br1" };
      mockUseCase.borrowBook.mockResolvedValue(borrow);

      await controller.borrowBook(req, res, next);

      expect(mockUseCase.borrowBook).toHaveBeenCalledWith({ userId: "u1", bookId: "b1", dueDate: "2025-12-01" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: borrow });
    });

    it("should call next on error", async () => {
      const req = { user: { id: "u1" }, body: { bookId: "b1", dueDate: "2025-12-01" } };
      const error = new Error("fail");
      mockUseCase.borrowBook.mockRejectedValue(error);

      await controller.borrowBook(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ---------------- returnBook ----------------
  describe("returnBook", () => {
    it("should return book successfully", async () => {
      const req = { params: { borrowId: "br1" }, user: { id: "u1" } };
      const updated = { id: "br1", returned: true };
      mockUseCase.returnBook.mockResolvedValue(updated);

      await controller.returnBook(req, res, next);

      expect(mockUseCase.returnBook).toHaveBeenCalledWith("br1", "u1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: updated });
    });

    it("should call next on error", async () => {
      const req = { params: { borrowId: "br1" }, user: { id: "u1" } };
      const error = new Error("oops");
      mockUseCase.returnBook.mockRejectedValue(error);

      await controller.returnBook(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ---------------- listBorrows ----------------
  describe("listBorrows", () => {
    it("should list borrows successfully", async () => {
      const req = { query: { page: 1 }, user: { id: "u1" } };
      const result = [{ id: "br1" }];
      mockUseCase.listBorrows.mockResolvedValue(result);

      await controller.listBorrows(req, res, next);

      expect(mockUseCase.listBorrows).toHaveBeenCalledWith(req.query, req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: result });
    });

    it("should call next on error", async () => {
      const req = { query: {}, user: {} };
      const error = new Error("bad");
      mockUseCase.listBorrows.mockRejectedValue(error);

      await controller.listBorrows(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ---------------- mostBorrowed ----------------
  describe("mostBorrowed", () => {
    it("should return most borrowed books", async () => {
      const req = { query: { top: 3 } };
      const data = [{ book: "b1" }];
      mockUseCase.getMostBorrowed.mockResolvedValue(data);

      await controller.mostBorrowed(req, res, next);

      expect(mockUseCase.getMostBorrowed).toHaveBeenCalledWith({ top: 3 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    it("should default top to 10", async () => {
      const req = { query: {} };
      mockUseCase.getMostBorrowed.mockResolvedValue([]);

      await controller.mostBorrowed(req, res, next);

      expect(mockUseCase.getMostBorrowed).toHaveBeenCalledWith({ top: 10 });
    });
  });

  // ---------------- activeMembers ----------------
  describe("activeMembers", () => {
    it("should return active members", async () => {
      const req = { query: { top: 5 } };
      const data = [{ user: "u1" }];
      mockUseCase.getActiveMembers.mockResolvedValue(data);

      await controller.activeMembers(req, res, next);

      expect(mockUseCase.getActiveMembers).toHaveBeenCalledWith({ top: 5 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    it("should default top to 10", async () => {
      const req = { query: {} };
      mockUseCase.getActiveMembers.mockResolvedValue([]);

      await controller.activeMembers(req, res, next);

      expect(mockUseCase.getActiveMembers).toHaveBeenCalledWith({ top: 10 });
    });
  });

  // ---------------- availability ----------------
  describe("availability", () => {
    it("should return availability data", async () => {
      const req = {};
      const data = { available: 5 };
      mockUseCase.getBookAvailability.mockResolvedValue(data);

      await controller.availability(req, res, next);

      expect(mockUseCase.getBookAvailability).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    it("should call next on error", async () => {
      const req = {};
      const error = new Error("fail");
      mockUseCase.getBookAvailability.mockRejectedValue(error);

      await controller.availability(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
