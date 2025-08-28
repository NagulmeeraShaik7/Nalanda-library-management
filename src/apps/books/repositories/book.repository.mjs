import Book from "../models/book.model.mjs";

class BookRepository {
  async createBook(data) {
    const book = new Book(data);
    //console.log("Book created:-----", book);
    return book.save();
  }

  async updateBook(id, data) {
    return Book.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteBook(id) {
    return Book.findByIdAndDelete(id);
  }

  async findById(id) {
    return Book.findById(id);
  }

  async listBooks({ skip, limit, filters, searchQuery }) {
    const query = { ...filters, ...searchQuery };

    const books = await Book.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    return { books, total };
  }
}

export default BookRepository;
