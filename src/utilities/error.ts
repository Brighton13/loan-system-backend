export class StandardError extends Error {
  override message: string;
  code;
  constructor(message: string | undefined, code = 400) {
    super(message);
    this.code = code;
    this.message = message ?? '';
  }

  toJSON() {
    return {
        status: 1,
        message: this.message
    }
  }
}
