import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Nalanda Library Management API",
    version: "1.0.0",
    description: "API documentation for the Nalanda Library Management System",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://nalanda-library-management-g6jn.onrender.com",
      description: "Production server"
    }
    
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["Admin", "Member"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Book: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          author: { type: "string" },
          ISBN: { type: "string" },
          publicationDate: { type: "string", format: "date" },
          genre: { type: "string" },
          copies: { type: "integer", minimum: 0 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Borrow: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          bookId: { type: "string" },
          borrowDate: { type: "string", format: "date-time" },
          dueDate: { type: "string", format: "date-time" },
          returnDate: { type: "string", format: "date-time", nullable: true },
          status: { type: "string", enum: ["borrowed", "returned", "overdue"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    "./src/apps/auth/routers/*.mjs",
    "./src/apps/books/routers/*.mjs",
    "./src/apps/borrows/routers/*.mjs",
  ],
};

export default swaggerJSDoc(options);