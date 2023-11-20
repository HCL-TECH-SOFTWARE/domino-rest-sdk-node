export class SdkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SdkError';
  }
}
