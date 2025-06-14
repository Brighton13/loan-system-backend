export declare class StandardError extends Error {
    message: string;
    code: number;
    constructor(message: string | undefined, code?: number);
    toJSON(): {
        status: number;
        message: string;
    };
}
//# sourceMappingURL=error.d.ts.map