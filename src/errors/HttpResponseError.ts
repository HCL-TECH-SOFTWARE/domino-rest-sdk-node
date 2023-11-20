import { SdkError } from './SdkError';

export type ErrorResponse = {
  statusCode: number;
  message: string;
  errorId: number;
};

export class HttpResponseError extends SdkError {
  statusCode: number;
  errorId: number;

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.statusCode = errorResponse.statusCode;
    this.errorId = errorResponse.errorId;
    this.name = 'HttpResponseError';
  }
}
