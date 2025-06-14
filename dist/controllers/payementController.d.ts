import { Request, Response } from 'express';
import User from '../models/User';
interface AuthRequest extends Request {
    user?: User;
}
export declare const make_payment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=payementController.d.ts.map