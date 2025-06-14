import { Request, Response } from 'express';
import User from '../models/User';
interface AuthRequest extends Request {
    user?: User;
}
export declare const createLoan: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCollateralImage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLoans: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLoanById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const approveLoan: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const AdminDashBoard: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateLoanNumber: () => string;
export {};
//# sourceMappingURL=loanController.d.ts.map