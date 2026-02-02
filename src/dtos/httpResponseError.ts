export default class HttpResponseError extends Error {
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpResponseError.prototype);
  }
  statusCode: number;
}
