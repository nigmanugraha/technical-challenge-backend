# Technical Challenge: Backend System

This repository contains a microservice-based architecture that solves the given technical challenge, which includes:

- **User Authentication (Login/Register)**
- **User Profile with Horoscope and Zodiac Calculation**
- **Real-time Chat Between Users (via RabbitMQ)**
- **Notification of New Messages**
- **Unit Testing**
- **OOP Design & NoSQL Schema Planning**

---

## 🧱 Project Structure

The repository is structured into **two main services**:

```
.
├── user-service/       # Main gateway service
│   └── src/
│       └── ...
├── chat-service/       # Dedicated microservice for chat processing
│   └── src/
│       └── ...
├── docker-compose.yml  # Combined setup
```

---

## 📡 Services Overview

### 🧑‍💻 `user-service` (Main Service + Gateway)

- Handles authentication (`/login`, `/register`)
- Manages user profile (including horoscope & zodiac)
- Acts as a **gateway** for frontend access
- Sends message requests to `chat-service` via RabbitMQ
- Includes **custom `BaseService<T>`** and `JoiHelper` for reusable logic

### 💬 `chat-service`

- Handles **chat creation**, **storage**, and **retrieval**
- Returns conversation data on request
- Emits socket events or performs RabbitMQ callbacks to notify the `user-service` of new messages
- Includes `ChatGateway` and `ChatController`

---

## 🧰 Custom Implementations

### 🧩 `BaseService<T>` (Custom Built)

A reusable abstract service for MongoDB models that supports:

- Generic CRUD methods
- Optional population
- Mongoose transaction/session support
- Flexible query options
- Code reuse across services

### 📏 `JoiHelper` (Custom Validation Layer)

Reusable Joi schema builder that includes:

- ObjectId validation
- Array of ObjectIds with optional min/max items
- String, number, date validation helpers
- Clean, readable DTO validation logic

---

## 🧪 Unit Testing

Implemented using **Jest**, tests cover:

- Service logic (chat and user services)
- Message send flow
- Profile mapping and utility functions
- All mocks are isolated to preserve independence between services

Run tests in each service directory (e.g., `chat-service/`, `user-service/`) with:

```bash
yarn test
```

---

## 🔗 Microservices Communication

- Implemented using **RabbitMQ** as message broker
- `user-service` sends message payloads to `chat-service` via a defined message pattern (`chat.send.message`)
- `chat-service` processes and stores the message, and responds via `@MessagePattern` handler
- Real-time chat notification is implemented via `ChatGateway` (WebSocket)
- Event-driven design supports future scalability

---

## ⚙️ Technologies

- **NestJS (v11)** – Modular server-side Node.js framework
- **MongoDB (v6)** – NoSQL database
- **RabbitMQ** – For inter-service messaging
- **Docker** – For containerized deployment
- **Socket.IO** – For real-time communication
- **Jest** – For unit testing
- **Custom Helpers** – For OOP and code reuse

---

## ✅ Task Compliance

This project was built according to the task requirements:

- ✅ CRUD implementation with OOP and custom data structure design
- ✅ Microservice separation between user and chat modules
- ✅ Joi validation and DTOs
- ✅ Horoscope and Zodiac logic built from date of birth
- ✅ RabbitMQ-based messaging with response handling
- ✅ Unit tests implemented for core modules

---

## 🐳 Docker Usage

```bash
# Build and start the services
docker-compose up --build

# Then visit the user-service via defined domain or port (e.g., https://test-api.nigmanugraha.my.id)
```

Traefik is configured as the reverse proxy for domain routing.

---

## Notes

- Each service is independently deployable
- Code is modular and ready for production-level scaling
- Fully typed using TypeScript with schema validation at DTO and database levels

---

# 🧱 Custom Exception & Response Handling

## ✅ CustomResponse

All successful responses are wrapped in a unified response format:

```json
{
  "meta": {
    "message": "Data was successfully created!",
    "status_code": 201
  },
  "data": {
    // actual response data
  }
}
```

This format is automatically applied using a reusable response helper, reducing boilerplate and improving consistency for API consumers.

## ❌ CustomException

For error handling, a base CustomException class is used across both services, extended into specific exceptions like BadRequestError, UnauthorizedError, NotFoundError, etc.

These are caught by a global CustomExceptionFilter, which returns errors in the following structure:

```json
{
  "meta": {
    "message": "Receiver not found. Unable to send message.",
    "status_code": 400
  }
}
```

This ensures:

- Consistent error formatting
- Clear, user-friendly error messages
- Easier frontend integration and debugging

---

## Deployment

This project has been successfully deployed to a public cloud server using Docker and Traefik as the reverse proxy.
A custom domain is used for the API gateway:  
**https://test-api.nigmanugraha.my.id**

Both services (`user-service` and `chat-service`) are deployed as isolated containers with dedicated MongoDB and RabbitMQ instances.

## API Documentation

API documentation is available via Postman and includes all endpoints used in the login, profile, and chat modules.
The collection includes:

- Request/Response examples
- JWT Authentication flow
- Chat message delivery via RabbitMQ

Postman collection can be shared upon request or attached to the repository.
