import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.customError) {
      return response.status(exception.meta.status_code).json({
        meta: exception.meta,
      });
    }
    // handle mongoose duplicate error
    if (exception.code === 11000) {
      const fieldMatch = exception.message.match(
        /index:\s+([^\s]+)\s+dup\s+key:\s+{.*:(.*)}/,
      );
      const errors: any[] = [];
      if (fieldMatch) {
        const field = fieldMatch[1].split('_')[0]; // Extract field name from index
        const value = fieldMatch[2].trim().replace(/\"/g, ''); // Clean up the escaped quotes and trim
        errors.push({ [`${field}`]: value });
      }

      const metaException = new ValidationError(`Duplicate Record`, {
        message: exception.message,
        errors,
        status_code: 422,
        error_code: ErrorCodeEnum.DUPLICATE_RECORD,
      });
      return response.status(422).json({
        meta: metaException.meta,
      });
    }

    // handle unauthorized error
    if (exception.status === 401) {
      const metaException = new UnauthorizedError('Unauthorized', {
        message: exception.message,
        status_code: exception.status,
        error_code: ErrorCodeEnum.AUTHORIZATION_ERROR,
      });
      return response.status(exception.status).json({
        meta: metaException.meta,
      });
    }

    // handle not found error
    if (exception.status === 404) {
      const metaException = new NotFoundError('Not Found', {
        message: exception.message,
        status_code: exception.status,
        error_code: ErrorCodeEnum.NOT_FOUND_ERROR,
      });
      return response.status(exception.status).json({
        meta: metaException.meta,
      });
    }

    // handle forbidden access
    if (exception.status === 403) {
      const metaException = new ForbiddenError();
      return response
        .status(exception.status)
        .json({ meta: metaException.meta });
    }

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json({
        meta: {
          message: exception.message,
          status_code: exception.getStatus(),
        },
      });
    }

    // handle any error with status start with 4**, return it with bad request error
    if (`${exception.status}`.substring(0, 1) === '4') {
      const metaException = new BadRequestError('Bad Request', {
        message: exception.message,
        status_code: exception.status,
        error_code: ErrorCodeEnum.BAD_REQUEST_ERROR,
      });
      return response.status(exception.status).json({
        meta: metaException.meta,
      });
    }
    console.error(exception);
    // throw unhandled exception as internal server error
    response.status(exception.status || 500).json({
      meta: {
        message: exception.message,
        error: exception.error || 'Internal Server Error',
        status_code: exception.status || 500,
        error_code: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
      },
    });
  }
}

//

export enum ErrorCodeEnum {
  AUTHORIZATION_ERROR = 'authorization_error',
  VALIDATION_ERROR = 'validation_error',
  FORBIDDEN_ERROR = 'forbidden_error',
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  BAD_REQUEST_ERROR = 'bad_request_error',
  NOT_FOUND_ERROR = 'not_found_error',
  DUPLICATE_RECORD = 'duplicate_record',
  NOTIFICATION_CHANNEL_RESEND_ERROR = 'NOTIFICATION_CHANNEL_RESEND_ERROR',
  // OTP
  ERROR_OTP_INVALID = 'ERROR_OTP_INVALID',
  ERROR_OTP_EXPIRED = 'ERROR_OTP_EXPIRED',
  // User
  ERROR_USER_EXISTED = 'ERROR_USER_EXISTED',
  ERROR_USER_NOT_FOUND = 'ERROR_USER_NOT_FOUND',

  PAYMENT_GATEWAY_NOT_AVAILABLE_ERROR = 'PAYMENT_GATEWAY_NOT_AVAILABLE_ERROR',
  PAYMENT_CHANNEL_NOT_AVAILABLE_ERROR = 'PAYMENT_CHANNEL_NOT_AVAILABLE_ERROR',
}

export interface CustomError {
  customError: boolean;
  meta: {
    errors?: Array<object>;
    message?: string;
    status_code?: number;
    error_code?: ErrorCodeEnum;
  };
}

export class InternalServerError implements CustomError {
  customError = true;
  meta: {
    errors: Array<object>;
    message: string;
    status_code: number;
    error_code: ErrorCodeEnum;
  };
  constructor(
    message: string = 'Internal Server Error',
    meta?: CustomError['meta'],
  ) {
    this.meta = {
      message,
      errors: meta?.errors || [],
      status_code: meta?.status_code || 500,
      error_code: meta?.error_code || ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    };
  }
}

export class UnauthorizedError implements CustomError {
  customError = true;
  meta: {
    errors: Array<object>;
    message: string;
    status_code: number;
    error_code: ErrorCodeEnum;
  };
  constructor(
    message: string = 'Unauthorized access. Please ensure you are logged in with the correct credentials',
    meta?: CustomError['meta'],
  ) {
    this.meta = {
      message,
      errors: meta?.errors || [],
      status_code: meta?.status_code || 401,
      error_code: meta?.error_code || ErrorCodeEnum.AUTHORIZATION_ERROR,
    };
  }
}

export class ForbiddenError implements CustomError {
  customError = true;
  meta: {
    errors: Array<object>;
    message: string;
    status_code: number;
    error_code: ErrorCodeEnum;
  };
  constructor(message: string = 'Forbidden', meta?: CustomError['meta']) {
    const text = `You don't have permission to access this route / on this server!`;
    this.meta = {
      message: message || text,
      errors: meta?.errors || [],
      status_code: meta?.status_code || 403,
      error_code: meta?.error_code || ErrorCodeEnum.FORBIDDEN_ERROR,
    };
  }
}

export class ValidationError implements CustomError {
  customError = true;
  meta: {
    errors: Array<object>;
    message: string;
    status_code: number;
    error_code: ErrorCodeEnum;
  };
  constructor(
    message: string = 'Validation error',
    meta?: CustomError['meta'],
  ) {
    this.meta = {
      message,
      errors: meta?.errors || [],
      status_code: meta?.status_code || 422,
      error_code: meta?.error_code || ErrorCodeEnum.VALIDATION_ERROR,
    };
  }
}

export class BadRequestError implements CustomError {
  customError = true;
  meta: {
    errors: Array<object>;
    message: string;
    status_code: number;
    error_code: ErrorCodeEnum;
  };
  constructor(message: string = 'Bad Request', meta?: CustomError['meta']) {
    this.meta = {
      message,
      errors: meta?.errors || [],
      status_code: meta?.status_code || 400,
      error_code: meta?.error_code || ErrorCodeEnum.BAD_REQUEST_ERROR,
    };
  }
}

export class NotFoundError implements CustomError {
  customError = true;
  meta: {
    errors: Array<object>;
    message: string;
    status_code: number;
    error_code: ErrorCodeEnum;
  };
  constructor(message: string = 'Not Found', meta?: CustomError['meta']) {
    this.meta = {
      message,
      errors: meta?.errors || [],
      status_code: meta?.status_code || 404,
      error_code: meta?.error_code || ErrorCodeEnum.NOT_FOUND_ERROR,
    };
  }
}
