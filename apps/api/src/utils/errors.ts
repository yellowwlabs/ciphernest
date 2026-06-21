export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", code = "BAD_REQUEST", details?: unknown) {
    super(400, message, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(401, message, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(403, message, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found", code = "NOT_FOUND") {
    super(404, message, code);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", code = "INTERNAL_SERVER_ERROR") {
    super(500, message, code);
  }
}
