import { SdkError } from './SdkError';

export class ApiNotAvailable extends SdkError {
  constructor(api: string) {
    super(`API '${api}' not available on this server.`);
    this.name = 'ApiNotAvailable';
  }
}
