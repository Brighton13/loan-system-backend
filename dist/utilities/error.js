"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardError = void 0;
class StandardError extends Error {
    constructor(message, code = 400) {
        super(message);
        this.code = code;
        this.message = message ?? '';
    }
    toJSON() {
        return {
            status: 1,
            message: this.message
        };
    }
}
exports.StandardError = StandardError;
//# sourceMappingURL=error.js.map