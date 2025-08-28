import BorrowUseCase from "../usecases/borrow.usecase.mjs";
import Book from "../../books/models/book.model.mjs";
import { getPagination, getMeta } from "../../utils/pagination.utils.mjs";
import { buildSearchQuery } from "../../utils/search.utils.mjs";

// Mock modules
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => id), // Mock ObjectId
  },
  Schema: jest.fn().mockImplementation(() => ({
    // Mock schema methods if needed (e.g., for Book model)
  })),
  model: jest.fn().mockReturnValue({
    findById: jest.fn(), // Mock the methods used by Book model
    // Add other model methods if needed
  }),
}));
jest.mock("../../books/models/book.model.mjs");
jest.mock("../../utils/pagination.utils.mjs");
jest.mock("../../utils/search.utils.mjs");

describe("BorrowUseCase", () => {
  let borrowRepository;
  let useCase;

  beforeEach(() => {
    borrowRepository = {
      createBorrow: jest.fn(),
      findById: jest.fn(),
      updateBorrow: jest.fn(),
      listBorrows: jest.fn(),
      mostBorrowedBooks: jest.fn(),
      activeMembers: jest.fn(),
      bookAvailabilitySummary: jest.fn()
    };
    useCase = new BorrowUseCase(borrowRepository);

    jest.clearAllMocks();
  });

  describe("borrowBook", () => {
    it("should throw if book not found", async () => {
      Book.findById.mockResolvedValue(null);
      await expect(useCase.borrowBook({ userId: "u1", bookId: "b1", dueDate: new Date() }))
        .rejects.toThrow("Book not found");
    });

    it("should throw if no copies left", async () => {
      Book.findById.mockResolvedValue({ copies: 0 });
      await expect(useCase.borrowBook({ userId: "u1", bookId: "b1", dueDate: new Date() }))
        .rejects.toThrow("Book not available");
    });

    it("should decrement copies, save, and create borrow", async () => {
      const mockBook = { _id: "b1", copies: 2, save: jest.fn().mockResolvedValue(true) };
      Book.findById.mockResolvedValue(mockBook);

      const mockBorrow = { _id: "br1", userId: "u1", bookId: "b1" };
      borrowRepository.createBorrow.mockResolvedValue(mockBorrow);

      const result = await useCase.borrowBook({ userId: "u1", bookId: "b1", dueDate: new Date() });

      expect(Book.findById).toHaveBeenCalledWith("b1");
      expect(mockBook.copies).toBe(1); // decremented
      expect(mockBook.save).toHaveBeenCalled();
      expect(borrowRepository.createBorrow).toHaveBeenCalledWith(expect.objectContaining({ userId: "u1", bookId: "b1" }));
      expect(result).toBe(mockBorrow);
    });
  });

  describe("returnBook", () => {
    it("should throw if borrow not found", async () => {
      borrowRepository.findById.mockResolvedValue(null);
      await expect(useCase.returnBook("br1", "u1")).rejects.toThrow("Borrow record not found");
    });

    it("should throw if borrow not currently borrowed", async () => {
      borrowRepository.findById.mockResolvedValue({ status: "returned" });
      await expect(useCase.returnBook("br1", "u1")).rejects.toThrow("This book is not currently borrowed");
    });

    it("should update borrow and increment book copies", async () => {
      const borrowDoc = { _id: "br1", status: "borrowed", bookId: "b1" };
      const updatedBorrow = { ...borrowDoc, status: "returned" };

      borrowRepository.findById.mockResolvedValue(borrowDoc);
      borrowRepository.updateBorrow.mockResolvedValue(updatedBorrow);

      const mockBook = { _id: "b1", copies: 3, save: jest.fn().mockResolvedValue(true) };
      Book.findById.mockResolvedValue(mockBook);

      const result = await useCase.returnBook("br1", "u1");

      expect(borrowRepository.findById).toHaveBeenCalledWith("br1");
      expect(borrowRepository.updateBorrow).toHaveBeenCalledWith(
        "br1",
        expect.objectContaining({ status: "returned", returnDate: expect.any(Date) })
      );
      expect(Book.findById).toHaveBeenCalledWith("b1");
      expect(mockBook.copies).toBe(4); // incremented
      expect(result).toBe(updatedBorrow);
    });
  });

  describe("listBorrows", () => {
    it("should apply filters and return borrows with meta", async () => {
      getPagination.mockReturnValue({ page: 1, limit: 10, skip: 0 });
      buildSearchQuery.mockReturnValue({ status: "borrowed" });
      getMeta.mockReturnValue({ page: 1, limit: 10, total: 2 });

      const borrowsData = [{ _id: "br1" }];
      borrowRepository.listBorrows.mockResolvedValue({ borrows: borrowsData, total: 2 });

      const currentUser = { id: "u1", role: "Admin" };
      const query = { status: "borrowed" };

      const result = await useCase.listBorrows(query, currentUser);

      expect(borrowRepository.listBorrows).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, limit: 10, query: expect.objectContaining({ status: "borrowed" }) })
      );
      expect(result).toEqual({ borrows: borrowsData, meta: { page: 1, limit: 10, total: 2 } });
    });

    it("should restrict member to own borrows", async () => {
      getPagination.mockReturnValue({ page: 1, limit: 5, skip: 0 });
      buildSearchQuery.mockReturnValue({});
      getMeta.mockReturnValue({ page: 1, limit: 5, total: 1 });

      const borrowsData = [{ _id: "br1" }];
      borrowRepository.listBorrows.mockResolvedValue({ borrows: borrowsData, total: 1 });

      const currentUser = { id: "uX", role: "Member" };
      const query = {};

      const result = await useCase.listBorrows(query, currentUser);

      expect(borrowRepository.listBorrows).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ userId: "uX" }),
          skip: 0,
          limit: 5,
        })
      );
      expect(result).toEqual({
        borrows: borrowsData,
        meta: { page: 1, limit: 5, total: 1 },
      });
    });
  });

  describe("getMostBorrowed", () => {
    it("should return most borrowed books", async () => {
      const data = [{ bookId: "b1", count: 5 }];
      borrowRepository.mostBorrowedBooks.mockResolvedValue(data);

      const result = await useCase.getMostBorrowed({ top: 3 });
      expect(borrowRepository.mostBorrowedBooks).toHaveBeenCalledWith({ top: 3 });
      expect(result).toBe(data);
    });
  });

  describe("getActiveMembers", () => {
    it("should return active members", async () => {
      const data = [{ userId: "u1", count: 4 }];
      borrowRepository.activeMembers.mockResolvedValue(data);

      const result = await useCase.getActiveMembers({ top: 2 });
      expect(borrowRepository.activeMembers).toHaveBeenCalledWith({ top: 2 });
      expect(result).toBe(data);
    });
  });

  describe("getBookAvailability", () => {
    it("should return availability summary", async () => {
      const summary = { perBook: [], totals: { totalBooks: 10 } };
      borrowRepository.bookAvailabilitySummary.mockResolvedValue(summary);

      const result = await useCase.getBookAvailability();
      expect(borrowRepository.bookAvailabilitySummary).toHaveBeenCalled();
      expect(result).toBe(summary);
    });
  });
});