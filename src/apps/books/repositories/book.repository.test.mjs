import BookRepository from "../repositories/book.repository.mjs";
import Book from "../models/book.model.mjs";

// Mock Book model
jest.mock("../models/book.model.mjs");

describe("BookRepository", () => {
  let bookRepository;

  beforeEach(() => {
    bookRepository = new BookRepository();
    jest.clearAllMocks();
  });

  // ------------------ createBook ------------------
  describe("createBook", () => {
    it("should create and save a new book", async () => {
      const bookData = { title: "Test Book", author: "Author" };
      const mockSave = jest.fn().mockResolvedValue({ _id: "1", ...bookData });

      Book.mockImplementation(() => ({ save: mockSave }));

      const result = await bookRepository.createBook(bookData);

      expect(Book).toHaveBeenCalledWith(bookData);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ _id: "1", ...bookData });
    });
  });

  // ------------------ updateBook ------------------
  describe("updateBook", () => {
    it("should call findByIdAndUpdate with correct args", async () => {
      const id = "123";
      const updateData = { title: "Updated" };
      const mockBook = { _id: id, ...updateData };

      Book.findByIdAndUpdate.mockResolvedValue(mockBook);

      const result = await bookRepository.updateBook(id, updateData);

      expect(Book.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
      expect(result).toEqual(mockBook);
    });
  });

  // ------------------ deleteBook ------------------
  describe("deleteBook", () => {
    it("should call findByIdAndDelete with correct id", async () => {
      const id = "123";
      const mockBook = { _id: id, title: "Deleted Book" };

      Book.findByIdAndDelete.mockResolvedValue(mockBook);

      const result = await bookRepository.deleteBook(id);

      expect(Book.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockBook);
    });
  });

  // ------------------ findById ------------------
  describe("findById", () => {
    it("should call findById with correct id", async () => {
      const id = "123";
      const mockBook = { _id: id, title: "Some Book" };

      Book.findById.mockResolvedValue(mockBook);

      const result = await bookRepository.findById(id);

      expect(Book.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockBook);
    });
  });

  // ------------------ listBooks ------------------
  describe("listBooks", () => {
    it("should return books and total count", async () => {
      const options = { skip: 0, limit: 10, filters: { genre: "Fiction" }, searchQuery: { title: /Test/i } };
      const query = { ...options.filters, ...options.searchQuery };

      const mockBooks = [{ _id: "1", title: "Test Book" }];
      const mockExecFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockBooks),
      };

      Book.find.mockReturnValue(mockExecFind);
      Book.countDocuments.mockResolvedValue(1);

      const result = await bookRepository.listBooks(options);

      expect(Book.find).toHaveBeenCalledWith(query);
      expect(mockExecFind.skip).toHaveBeenCalledWith(0);
      expect(mockExecFind.limit).toHaveBeenCalledWith(10);
      expect(mockExecFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Book.countDocuments).toHaveBeenCalledWith(query);

      expect(result).toEqual({ books: mockBooks, total: 1 });
    });
  });
});
