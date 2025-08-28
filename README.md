# 📚 Nalanda Library Management System

A robust, modular Node.js RESTful API for managing library operations: user authentication, book inventory, and borrowing workflows. Designed for scalability, maintainability, and ease of use.

---

## 🚀 Features

- **User Authentication & Authorization** (JWT, role-based)
- **Book Management** (CRUD, search, filter, pagination)
- **Borrowing System** (borrow, return, track)
- **Comprehensive Reports** (most borrowed books, active members, availability)
- **Centralized Error Handling**
- **Automated Testing** (unit & integration)
- **Interactive API Docs** (Swagger/OpenAPI)

---

## 🗂️ Project Structure

```
|--coverage
|
|--node_modules
|
src/
│                       # Main entry point
│
├── apps/
│   ├── auth/
│   │   ├── controllers/
│   │   │   ├── auth.controller.mjs
│   │   │   └── auth.controller.test.mjs
│   │   ├── models/
│   │   │   └── auth.model.mjs
│   │   ├── repositories/
│   │   │   ├── auth.repository.mjs
│   │   │   └── auth.repository.test.mjs
│   │   ├── routers/
│   │   │   └── auth.route.mjs
│   │   └── usecases/
│   │       ├── auth.usecase.mjs
│   │       └── auth.usecase.test.mjs
│   │
│   ├── books/
│   │   ├── controllers/
│   │   │   ├── book.controller.mjs
│   │   │   └── book.controller.test.mjs
│   │   ├── models/
│   │   │   └── book.model.mjs
│   │   ├── repositories/
│   │   │   ├── book.repository.mjs
│   │   │   └── book.repository.test.mjs
│   │   ├── routers/
│   │   │   └── book.route.mjs
│   │   └── usecases/
│   │       ├── book.usecase.mjs
│   │       └── book.usecase.test.mjs
│   │
│   ├── borrows/
│   │   ├── controllers/
│   │   │   ├── borrow.controller.mjs
│   │   │   └── borrow.controller.test.mjs
│   │   ├── models/
│   │   │   └── borrow.model.mjs
│   │   ├── repositories/
│   │   │   ├── borrow.repository.mjs
│   │   │   └── borrow.repository.test.mjs
│   │   ├── routers/
│   │   │   └── borrow.route.mjs
│   │   └── usecases/
│   │       ├── borrow.usecase.mjs
│   │       └── borrow.usecase.test.mjs
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.mjs
│   │   └── error.middleware.mjs
│   │
│   └── utils/
│       ├── pagination.utils.mjs
│       └── search.utils.mjs
│
├── infrastructures/
│   └── config/
│       └── swagger.config.mjs
│
└──index.mjs 
|- .env
|-.gitignore
|- jsconfig.json
|- jest.config.js
|- babel.config.json 
|- pacakage-lock.json
|- package.json
|- README.md    

```

- **controllers/**: Handle HTTP requests and responses.
- **models/**: Mongoose schemas and data models.
- **repositories/**: Data access logic (CRUD).
- **routers/**: API route definitions and middleware.
- **usecases/**: Business logic for each domain.
- **middlewares/**: Express middleware (auth, error handling).
- **utils/**: Utility functions (pagination, search, etc).
- **tests/**: Centralized or cross-module tests.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

```sh
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
MONGO_URI=mongodb+srv://shaiknagulmeera9:*****@cluster0.onmkifd.mongodb.net/nalanda-library?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
PORT=3000
```

---

## ▶️ Running the Application

```sh
npm start
```

For development with auto-reload:

```sh
npm run dev
```

### Running Tests

```sh
npm run test
```

---

## 📖 API Documentation

Interactive Swagger docs:  
[http://localhost:3000/api-docs](http://localhost:3000/api-docs) 

Production Swaggerdocs:

[https://nalanda-library-management-g6jn.onrender.com/api-docs]([https://nalanda-library-management-g6jn.onrender.com/api-docs)

---

## 🔗 API Endpoints

### 🧑‍💼 Authentication

| Method | Endpoint             | Description                | Access   |
|--------|----------------------|----------------------------|----------|
| POST   | `/api/auth/register` | Register a new user        | Public   |
| POST   | `/api/auth/login`    | Login and get JWT token    | Public   |

**Register**
- Request body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "yourpassword",
    "role": "Admin"
  }
  ```
- Response: JWT token and user info

**Login**
- Request body:
  ```json
  {
    "email": "john@example.com",
    "password": "yourpassword"
  }
  ```
- Response: JWT token and user info

---

### 📚 Books

| Method | Endpoint           | Description                  | Access         |
|--------|--------------------|------------------------------|----------------|
| GET    | `/api/books`       | List/search books            | Authenticated  |
| GET    | `/api/books/:id`   | Get book by ID               | Authenticated  |
| POST   | `/api/books`       | Add a new book               | Admin only     |
| PUT    | `/api/books/:id`   | Update book details          | Admin only     |
| DELETE | `/api/books/:id`   | Delete a book                | Admin only     |

**List/Search Books**
- Query params: `search`, `author`, `genre`, `skip`, `limit`
- Example: `/api/books?search=history&limit=10`

**Add Book**
- Request body:
  ```json
  {
    "title": "Book Title",
    "author": "Author Name",
    "ISBN": "1234567890",
    "publicationDate": "2024-01-01",
    "genre": "Fiction",
    "copies": 5
  }
  ```

---

### 🔄 Borrows

| Method | Endpoint                           | Description                        | Access         |
|--------|------------------------------------|------------------------------------|----------------|
| POST   | `/api/borrows/borrow`              | Borrow a book                      | Member/Admin   |
| PUT    | `/api/borrows/:borrowId/return`    | Return a borrowed book             | Member/Admin   |
| GET    | `/api/borrows`                     | List borrow records                | Member/Admin   |
| GET    | `/api/borrows/reports/most-borrowed` | Most borrowed books report       | Admin only     |
| GET    | `/api/borrows/reports/active-members` | Most active members report      | Admin only     |
| GET    | `/api/borrows/reports/availability`   | Book availability summary        | Admin only     |

**Borrow a Book**
- Request body:
  ```json
  {
    "bookId": "bookObjectId",
    "dueDate": "2024-09-01"
  }
  ```

**Return a Book**
- Endpoint: `/api/borrows/:borrowId/return`

**Reports**
- `/api/borrows/reports/most-borrowed?top=5`
- `/api/borrows/reports/active-members?top=5`
- `/api/borrows/reports/availability`

---

## ⚠️ Error Handling

All errors are returned in a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🧪 Testing

- All core modules include unit tests (see `*.test.mjs` files).
- To run all tests:
  ```sh
  npm run test or npx jest
  ```
- Coverage reports are generated in the `/coverage` directory.

---
