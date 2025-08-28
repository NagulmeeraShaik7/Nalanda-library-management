import BorrowRepository from "../repositories/borrow.repository.mjs";
import Borrow from "../models/borrow.model.mjs";
import Book from "../../books/models/book.model.mjs";

// Mock Mongoose models
jest.mock("../models/borrow.model.mjs");
jest.mock("../../books/models/book.model.mjs");

describe("BorrowRepository", () => {
  let repo;

  beforeEach(() => {
    repo = new BorrowRepository();
    jest.clearAllMocks();
  });

  describe("createBorrow", () => {
    it("should save a new borrow", async () => {
      const mockData = { userId: "u1", bookId: "b1", dueDate: "2025-09-01" };
      const mockSave = jest.fn().mockResolvedValue({ _id: "123", ...mockData });
      Borrow.mockImplementation(() => ({ save: mockSave }));

      const result = await repo.createBorrow(mockData);

      expect(Borrow).toHaveBeenCalledWith(mockData);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ _id: "123", ...mockData });
    });
  });

  describe("findById", () => {
    it("should call Borrow.findById with populate", async () => {
      const mockPopulate2 = jest.fn().mockResolvedValue("populatedBorrow");
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Borrow.findById.mockReturnValue({ populate: mockPopulate1 });

      const result = await repo.findById("123");

      expect(Borrow.findById).toHaveBeenCalledWith("123");
      expect(mockPopulate1).toHaveBeenCalledWith("userId", "name email");
      expect(mockPopulate2).toHaveBeenCalledWith("bookId", "title author ISBN");
      expect(result).toBe("populatedBorrow");
    });
  });

  describe("updateBorrow", () => {
    it("should update borrow and populate", async () => {
      const mockPopulate2 = jest.fn().mockResolvedValue("updatedBorrow");
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Borrow.findByIdAndUpdate.mockReturnValue({ populate: mockPopulate1 });

      const result = await repo.updateBorrow("123", { status: "returned" });

      expect(Borrow.findByIdAndUpdate).toHaveBeenCalledWith("123", { status: "returned" }, { new: true });
      expect(mockPopulate1).toHaveBeenCalledWith("userId", "name email");
      expect(mockPopulate2).toHaveBeenCalledWith("bookId", "title author ISBN");
      expect(result).toBe("updatedBorrow");
    });
  });

  describe("listBorrows", () => {
    it("should return paginated borrows and total", async () => {
      const borrowsData = [{ _id: "b1" }, { _id: "b2" }];

      const mockLimit = jest.fn().mockResolvedValue(borrowsData);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      const mockPopulate2 = jest.fn().mockReturnValue({ sort: mockSort });
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Borrow.find.mockReturnValue({ populate: mockPopulate1 });

      Borrow.countDocuments.mockResolvedValue(2);

      const result = await repo.listBorrows({ skip: 0, limit: 2, query: {} });

      expect(Borrow.find).toHaveBeenCalledWith({});
      expect(result).toEqual({ borrows: borrowsData, total: 2 });
    });
  });

  describe("mostBorrowedBooks", () => {
    it("should aggregate most borrowed books", async () => {
      const mockResult = [{ bookId: "b1", title: "Book1", borrowCount: 5 }];
      Borrow.aggregate.mockResolvedValue(mockResult);

      const result = await repo.mostBorrowedBooks({ top: 5 });

      expect(Borrow.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toBe(mockResult);
    });
  });

  describe("activeMembers", () => {
    it("should aggregate most active members", async () => {
      const mockResult = [{ userId: "u1", name: "Alice", borrowCount: 3 }];
      Borrow.aggregate.mockResolvedValue(mockResult);

      const result = await repo.activeMembers({ top: 3 });

      expect(Borrow.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toBe(mockResult);
    });
  });

  describe("bookAvailabilitySummary", () => {
    it("should return per-book summary and totals", async () => {
      const mockBooks = [
        { bookId: "b1", title: "Book1", totalCopies: 5, borrowedCopies: 2, availableCopies: 3 },
        { bookId: "b2", title: "Book2", totalCopies: 4, borrowedCopies: 1, availableCopies: 3 }
      ];
      Book.aggregate.mockResolvedValue(mockBooks);

      const result = await repo.bookAvailabilitySummary();

      expect(Book.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result.perBook).toBe(mockBooks);
      expect(result.totals).toEqual({ totalBooks: 9, borrowedBooks: 3, availableBooks: 6 });
    });
  });
});
