import { ErrorCodes, type ErrorCode } from './error-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly translatedMessage: string;
  public readonly field: string | undefined;
  public readonly isOperational: boolean;

  constructor(errorCode: ErrorCode) {
    const entry = ErrorCodes[errorCode];
    super(entry.message);
    this.statusCode = entry.statusCode;
    this.code = errorCode;
    this.translatedMessage = entry.translatedMessage;
    this.field = entry.field;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
