
// // src/controllers/loanController.ts
// import { Request, Response } from 'express';
// import Joi from 'joi';
// import Loan, { LoanStatus, LoanAttributes } from '../models/Loan';
// import User, { UserRole } from '../models/User';
// import Payment from '../models/Payment';
// import fs from 'fs';
// import path from 'path';
// import { Op } from 'sequelize';
// import { generateApprovalEmail, generateRejectionEmail, sendLoanApplicationEmail } from '../services/email';

// export interface AuthRequest extends Request {
//   user?: User;
// }

// const createLoanSchema = Joi.object({
//   amount: Joi.number().min(200).max(1000000).required()
//     .messages({
//       'number.min': 'Loan amount must be at least ZMW 200',
//       'number.max': 'Loan amount cannot exceed ZMW 1,000,000',
//       'any.required': 'Loan amount is required'
//     }),

//   termWeeks: Joi.number().min(1).max(4).required()
//     .messages({
//       'number.min': 'Loan term must be at least 1 week',
//       'number.max': 'Loan term cannot exceed 4 weeks',
//       'any.required': 'Loan term is required'
//     }),

//   purpose: Joi.string().min(3).max(500).required()
//     .messages({
//       'string.min': 'Purpose must be at least 10 characters long',
//       'string.max': 'Purpose cannot exceed 500 characters',
//       'any.required': 'Loan purpose is required'
//     }),

//   collateralImages: Joi.array()
//     .items(
//       Joi.string()
//         .pattern(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)
//         .message('Each image must be a valid base64 encoded image (JPEG, PNG, GIF, or WebP)')
//     )
//     .min(1)
//     .max(10)
//     .required()
//     .messages({
//       'array.min': 'At least 1 collateral image is required',
//       'array.max': 'Maximum of 10 collateral images allowed',
//       'any.required': 'Collateral images are required'
//     }),

//   // Optional fields that might be included
//   userId: Joi.string().optional(),
//   monthlyIncome: Joi.number().min(0).optional(),
//   employmentStatus: Joi.string().optional(),
//   employer: Joi.string().optional(),
//   collateralType: Joi.string().optional(),
//   collateralValue: Joi.number().min(0).optional(),
//   collateralDescription: Joi.string().max(1000).optional()
// });

// const approveLoanSchema = Joi.object({
//   status: Joi.string().valid(LoanStatus.APPROVED, LoanStatus.REJECTED).required(),
//   reason: Joi.string().optional(),
// });

// // export const createLoan = async (req: AuthRequest, res: Response) => {
// //   try {
// //     const { error, value } = createLoanSchema.validate(req.body);
// //     if (error) {
// //       // Clean up uploaded files if validation fails
// //       if (req.files) {
// //         const files = req.files as Express.Multer.File[];
// //         files.forEach(file => {
// //           fs.unlinkSync(file.path);
// //         });
// //       }
// //        res.status(400).json({
// //         status: 0,
// //         message: error.details[0].message,
// //         data: null
// //       });
// //       return;
// //     }

// //     // Check for existing active loans
// //     const activeLoan = await Loan.findOne({
// //       where: {
// //         userId: req.user?.id,
// //         status: {
// //           [Op.in]: [LoanStatus.ACTIVE, LoanStatus.PENDING, LoanStatus.DEFAULTED, LoanStatus.APPROVED]
// //         }
// //       }
// //     });

// //     if (activeLoan) {
// //       // Clean up uploaded files if loan exists
// //       if (req.files) {
// //         const files = req.files as Express.Multer.File[];
// //         files.forEach(file => {
// //           fs.unlinkSync(file.path);
// //         });
// //       }
// //       return res.status(200).json({
// //         status: 1,
// //         message: "You cannot have multiple unsettled loans",
// //         data: null
// //       });
// //     }

// //     const { amount, termWeeks, purpose } = value;

// //     // Calculate interest rate based on term
// //     let interestRate: number;
// //     switch (termWeeks) {
// //       case 1: interestRate = 0.15; break;
// //       case 2: interestRate = 0.25; break;
// //       case 3: interestRate = 0.35; break;
// //       case 4: interestRate = 0.45; break;
// //       default:
// //         // Clean up uploaded files if term is invalid
// //         if (req.files) {
// //           const files = req.files as Express.Multer.File[];
// //           files.forEach(file => {
// //             fs.unlinkSync(file.path);
// //           });
// //         }
// //         return res.status(400).json({
// //           status: 0,
// //           message: 'Invalid term. Only 1–4 weeks are allowed.',
// //           data: null
// //         });
// //     }

// //     // Process uploaded collateral images
// //     const collateralImages: string[] = [];
// //     if (req.files && Array.isArray(req.files)) {
// //       const files = req.files as Express.Multer.File[];
// //       files.forEach(file => {
// //         collateralImages.push(`/uploads/collateral/${file.filename}`);
// //       });
// //     }

// //     // Create the loan with proper typing
// //     const loan = await Loan.create({
// //       userId: req.user!.id,
// //       loan_number: generateLoanNumber(),
// //       amount,
// //       interestRate,
// //       termWeeks,
// //       purpose,
// //       collateralImages,
// //       status: LoanStatus.PENDING
// //     } as unknown as LoanAttributes);

// //     // Return success response
// //     res.status(201).json({
// //       status: 0,
// //       message: 'Loan application submitted successfully',
// //       data: {
// //         ...loan.get({ plain: true }),
// //         collateralImages: loan.collateralImages || []
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Create loan error:', error);

// //     // Clean up uploaded files if error occurs
// //     if (req.files) {
// //       const files = req.files as Express.Multer.File[];
// //       files.forEach(file => {
// //         if (fs.existsSync(file.path)) {
// //           fs.unlinkSync(file.path);
// //         }
// //       });
// //     }

// //     res.status(500).json({
// //       status: 0,
// //       message: 'Internal server error',
// //       data: null
// //     });
// //   }
// // };

// // New endpoint to serve collateral images


// export const createLoan = async (req: AuthRequest, res: Response) => {
//   try {
//     const { error, value } = createLoanSchema.validate(req.body);
//     if (error) {
//       // Clean up uploaded files if validation fails
//       if (req.files) {
//         const files = req.files as Express.Multer.File[];
//         files.forEach(file => {
//           fs.unlinkSync(file.path);
//         });
//       }
//        res.status(400).json({
//         status: 0,
//         message: error.details[0].message,
//         data: null
//       });
//       return;
//     }

//     // Check for existing active loans
//     const activeLoan = await Loan.findOne({
//       where: {
//         userId: req.user?.id,
//         status: {
//           [Op.in]: [LoanStatus.ACTIVE, LoanStatus.PENDING, LoanStatus.DEFAULTED, LoanStatus.APPROVED]
//         }
//       }
//     });

//     if (activeLoan) {
//       // Clean up uploaded files if loan exists
//       if (req.files) {
//         const files = req.files as Express.Multer.File[];
//         files.forEach(file => {
//           fs.unlinkSync(file.path);
//         });
//       }
//       return res.status(200).json({
//         status: 1,
//         message: "You cannot have multiple unsettled loans",
//         data: null
//       });
//     }

//     const { amount, termWeeks, purpose } = value;

//     // Calculate interest rate based on term
//     let interestRate: number;
//     switch (termWeeks) {
//       case 1: interestRate = 0.15; break;
//       case 2: interestRate = 0.25; break;
//       case 3: interestRate = 0.35; break;
//       case 4: interestRate = 0.45; break;
//       default:
//         // Clean up uploaded files if term is invalid
//         if (req.files) {
//           const files = req.files as Express.Multer.File[];
//           files.forEach(file => {
//             fs.unlinkSync(file.path);
//           });
//         }
//         return res.status(400).json({
//           status: 0,
//           message: 'Invalid term. Only 1–4 weeks are allowed.',
//           data: null
//         });
//     }

//     // Process uploaded collateral images
//     const collateralImages: string[] = [];
//     if (req.files && Array.isArray(req.files)) {
//       const files = req.files as Express.Multer.File[];
//       files.forEach(file => {
//         collateralImages.push(`/uploads/collateral/${file.filename}`);
//       });
//     }

//     // Create the loan with proper typing
//     const loan = await Loan.create({
//       userId: req.user!.id,
//       loan_number: generateLoanNumber(),
//       amount,
//       interestRate,
//       termWeeks,
//       purpose,
//       collateralImages,
//       status: LoanStatus.PENDING
//     } as unknown as LoanAttributes);

//     // Send email notification after successful loan creation
//     try {
      
//       await sendLoanApplicationEmail(loan.get({ plain: true }), req.user);
//     } catch (emailError) {
//       // Log email error but don't fail the loan creation
//       console.error('Email notification failed:', emailError);
//       // Optionally, you could store this failure in a queue for retry later
//     }

//     // Return success response
//     res.status(201).json({
//       status: 0,
//       message: 'Loan application submitted successfully',
//       data: {
//         ...loan.get({ plain: true }),
//         collateralImages: loan.collateralImages || []
//       }
//     });

//   } catch (error) {
//     console.error('Create loan error:', error);

//     // Clean up uploaded files if error occurs
//     if (req.files) {
//       const files = req.files as Express.Multer.File[];
//       files.forEach(file => {
//         if (fs.existsSync(file.path)) {
//           fs.unlinkSync(file.path);
//         }
//       });
//     }

//     res.status(500).json({
//       status: 0,
//       message: 'Internal server error',
//       data: null
//     });
//   }
// };

// export const getCollateralImage = async (req: Request, res: Response) => {
//   try {
//     const { filename } = req.params;
//     const imagePath = path.join(__dirname, '../../uploads/collateral', filename);

//     // Check if file exists
//     if (!fs.existsSync(imagePath)) {
//       return res.status(404).json({ error: 'Image not found' });
//     }

//     // Set appropriate headers
//     const ext = path.extname(filename).toLowerCase();
//     const contentType = {
//       '.jpg': 'image/jpeg',
//       '.jpeg': 'image/jpeg',
//       '.png': 'image/png',
//       '.gif': 'image/gif',
//       '.webp': 'image/webp'
//     }[ext] || 'application/octet-stream';

//     res.setHeader('Content-Type', contentType);
//     res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

//     // Stream the file
//     const fileStream = fs.createReadStream(imagePath);
//     fileStream.pipe(res);
//   } catch (error) {
//     console.error('Get collateral image error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Updated getLoans to include image URLs
// export const getLoans = async (req: AuthRequest, res: Response) => {
//   try {
//     const { page = 1, limit = 10, status } = req.query;
//     const offset = (Number(page) - 1) * Number(limit);

//     let whereClause: any = {};

//     if (req.user!.role === UserRole.USER) {
//       whereClause.userId = req.user!.id;
//     }

//     if (status) {
//       whereClause.status = status;
//     }

//     const loans = await Loan.findAndCountAll({
//       where: whereClause,
//       include: [
//         {
//           model: User,
//           as: 'user',
//           attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
//         },
//         {
//           model: User,
//           as: 'approver',
//           attributes: ['id', 'firstName', 'lastName'],
//           required: false,
//         },
//         {
//           model: Payment,
//           as: "payments",
//           required: false,
//         }
//       ],
//       limit: Number(limit),
//       offset,
//       order: [['createdAt', 'DESC']],
//     });

//     // Add image URLs to response
//     const loansWithImageUrls = loans.rows.map(loan => ({
//       ...loan.toJSON(),
//       collateralImages: loan.collateralImages?.map((filename: string) => ({
//         filename,
//         url: `/api/loans/collateral/${filename}`
//       })) || []
//     }));

//     res.json({
//       status: 0,
//       message: 'Loans retrieved successfully',
//       data: {
//         loans: loansWithImageUrls,
//         pagination: {
//           page: Number(page),
//           limit: Number(limit),
//           total: loans.count,
//           pages: Math.ceil(loans.count / Number(limit)),
//         },
//       }


//     });
//   } catch (error) {
//     console.error('Get loans error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Updated getLoanById to include image URLs
// export const getLoanById = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;

//     let whereClause: any = { id };

//     if (req.user!.role === UserRole.USER) {
//       whereClause.userId = req.user!.id;
//     }

//     const loan = await Loan.findOne({
//       where: whereClause,
//       include: [
//         {
//           model: User,
//           as: 'user',
//           attributes: ['id', 'firstName', 'lastName', 'email'],
//         },
//         {
//           model: User,
//           as: 'approver',
//           attributes: ['id', 'firstName', 'lastName'],
//           required: false,
//         },
//         {
//           model: Payment,
//           as: 'payments',
//           order: [['paymentDate', 'DESC']],
//         },
//       ],
//     });

//     if (!loan) {
//       return res.status(404).json({ error: 'Loan not found' });
//     }

//     // Add image URLs to response
//     const loanWithImageUrls = {
//       ...loan.toJSON(),
//       collateralImages: loan.collateralImages?.map((filename: string) => ({
//         filename,
//         url: `/api/loans/collateral/${filename}`
//       })) || []
//     };

//     res.json({ loan: loanWithImageUrls });
//   } catch (error) {
//     console.error('Get loan error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Keep existing functions unchanged
// // export const approveLoan = async (req: AuthRequest, res: Response) => {
// //   try {
// //     const { id } = req.params;
// //     const { error, value } = approveLoanSchema.validate(req.body);

// //     if (error) {
// //       return res.status(400).json({ error: error.details[0].message });
// //     }

// //     const { status } = value;

// //     const loan = await Loan.findByPk(id);
// //     if (!loan) {
// //       return res.status(404).json({ error: 'Loan not found' });
// //     }

// //     if (loan.status !== LoanStatus.PENDING) {
// //       return res.status(400).json({ error: 'Loan has already been processed' });
// //     }

// //     if (status === LoanStatus.APPROVED) {
// //       const amount = Number(loan.amount);
// //       const interestRate = Number(loan.interestRate);
// //       const interestAmount = amount * interestRate;
// //       const totalAmount = amount + interestAmount;
// //       const startDate = new Date();
// //       const endDate = new Date();
// //       endDate.setDate(startDate.getDate() + loan.termWeeks * 7);

// //       const loan_data =await loan.update({
// //         status: LoanStatus.ACTIVE,
// //         approvedBy: req.user!.id,
// //         approvedAt: new Date(),
// //         approval_reason: value.reason || null,
// //         startDate,
// //         endDate,
// //         totalAmount: Math.round(totalAmount * 100) / 100,
// //         remainingAmount: Math.round(totalAmount * 100) / 100,
// //       });

// //     await  generateApprovalEmail(loan_data);
// //     } else {
// //       const loan_data=await loan.update({
// //         status,
// //         approvedBy: req.user!.id,
// //         approval_reason: value.reason || null,
// //         approvedAt: new Date(),
// //       });
// //     await  generateRejectionEmail(loan_data)
// //     }

// //     res.json({
// //       message: `Loan ${status} successfully`,
// //       loan,
// //     });
// //   } catch (error) {
// //     console.error('Approve loan error:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // };


// export const approveLoan = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { error, value } = approveLoanSchema.validate(req.body);

//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }

//     const { status } = value;

//     const loan = await Loan.findByPk(id);
//     if (!loan) {
//       return res.status(404).json({ error: 'Loan not found' });
//     }

//     if (loan.status !== LoanStatus.PENDING) {
//       return res.status(400).json({ error: 'Loan has already been processed' });
//     }

//     // Get borrower information
//     const borrower = await User.findByPk(loan.userId); // Assuming userId field exists on loan
//     if (!borrower) {
//       return res.status(404).json({ error: 'Borrower not found' });
//     }

//     let totalAmount = 0;
//     let startDate: Date | undefined;
//     let endDate: Date | undefined;

//     if (status === LoanStatus.APPROVED) {
//       const amount = Number(loan.amount);
//       const interestRate = Number(loan.interestRate);
//       const interestAmount = amount * interestRate;
//       totalAmount = amount + interestAmount;
//       startDate = new Date();
//       endDate = new Date();
//       endDate.setDate(startDate.getDate() + loan.termWeeks * 7);

//       await loan.update({
//         status: LoanStatus.ACTIVE,
//         approvedBy: req.user!.id,
//         approvedAt: new Date(),
//         approval_reason: value.reason || null,
//         startDate,
//         endDate,
//         totalAmount: Math.round(totalAmount * 100) / 100,
//         remainingAmount: Math.round(totalAmount * 100) / 100,
//       });

//       // Send approval email
//       try {
//         const emailData = {
//           borrowerName: `${borrower.firstName} ${borrower.lastName}`.trim(),
//           borrowerEmail: borrower.email,
//           loanId: loan.loan_number.toString(),
//           amount: Number(loan.amount),
//           interestRate: Number(loan.interestRate),
//           termWeeks: loan.termWeeks,
//           totalAmount: Math.round(totalAmount * 100) / 100,
//           startDate,
//           endDate,
//           companyName: 'Quickcash Ltd',
//           contactEmail: 'bbtechnologies01@gmail.com',
//           contactPhone: '0973849272',
//         };
        
//         await generateApprovalEmail(emailData);
//         console.log(`Approval email sent successfully to ${borrower.email} for loan ${loan.id}`);
//       } catch (emailError) {
//         console.error('Failed to send approval email:', emailError);
//       }
//     } else {
//       await loan.update({
//         status,
//         approvedBy: req.user!.id,
//         approval_reason: value.reason || null,
//         approvedAt: new Date(),
//       });

//       // Send rejection email
//       try {
//         const emailData = {
//           borrowerName: `${borrower.firstName} ${borrower.lastName}`.trim(),
//           borrowerEmail: borrower.email,
//           loanId: loan.loan_number.toString(),
//           amount: Number(loan.amount),
//           reason: value.reason || 'Unfortunately, we cannot approve your loan application at this time.',
//           companyName: 'Quickcash Ltd',
//           contactEmail: 'bbtechnologies01@gmail.com',
//           contactPhone: '0973849272',
//         };
        
//         await generateRejectionEmail(emailData);
//         console.log(`Rejection email sent successfully to ${borrower.email} for loan ${loan.id}`);
//       } catch (emailError) {
//         console.error('Failed to send rejection email:', emailError);
//       }
//     }

//     res.json({
//       message: `Loan ${status} successfully`,
//       loan,
//     });
//   } catch (error) {
//     console.error('Approve loan error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const AdminDashBoard = async (req: AuthRequest, res: Response) => {
//   try {
//     // Current date and setup for monthly calculations
//     const now = new Date();
//     const currentYear = now.getFullYear();
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//     // Function to get monthly data
//     const getMonthlyData = async (model: any, whereClause: any = {}, sumField: string | null = null) => {
//       const monthlyData = [];

//       for (let month = 0; month < 12; month++) {
//         const startDate = new Date(currentYear, month, 1);
//         const endDate = new Date(currentYear, month + 1, 0);

//         const monthWhere = {
//           ...whereClause,
//           createdAt: {
//             [Op.between]: [startDate, endDate]
//           }
//         };

//         if (sumField) {
//           const value = await model.sum(sumField, { where: monthWhere }) || 0;
//           monthlyData.push(Number(value).toFixed(2));
//         } else {
//           const count = await model.count({ where: monthWhere });
//           monthlyData.push(count);
//         }
//       }

//       return monthlyData;
//     };

//     // Loan statistics
//     const totalLoans = await Loan.count();
//     const totalActiveLoans = await Loan.count({ where: { status: LoanStatus.ACTIVE } });
//     const totalCompletedLoans = await Loan.count({ where: { status: LoanStatus.COMPLETED } });
//     const totalDefaultedLoans = await Loan.count({ where: { status: LoanStatus.DEFAULTED } });
//     const totalPendingLoans = await Loan.count({ where: { status: LoanStatus.PENDING } });
//     const totalRejectedLoans = await Loan.count({ where: { status: LoanStatus.REJECTED } });
//     const totalApprovedLoans = await Loan.count({
//       where: {
//         status: {
//           [Op.in]: [
//             LoanStatus.APPROVED,
//             LoanStatus.ACTIVE,
//             LoanStatus.DEFAULTED,
//             LoanStatus.COMPLETED
//           ]
//         }
//       }
//     });

//     // Monthly loan statistics
//     const monthlyLoans = await getMonthlyData(Loan);
//     const monthlyApprovedLoans = await getMonthlyData(Loan, {
//       status: {
//         [Op.in]: [
//           LoanStatus.APPROVED,
//           LoanStatus.COMPLETED,
//           LoanStatus.DEFAULTED,
//           LoanStatus.ACTIVE
//         ]
//       }
//     });
//     const monthlyDisbursedAmount = await getMonthlyData(
//       Loan,
//       { status: { [Op.in]: [LoanStatus.ACTIVE, LoanStatus.COMPLETED, LoanStatus.DEFAULTED] } },
//       'amount'
//     );

//     // User statistics
//     const totalUsers = await User.count({ where: { role: UserRole.USER } });
//     const totalAdmins = await User.count({ where: { role: UserRole.ADMIN } });

//     // Monthly user onboarding
//     const monthlyNewUsers = await getMonthlyData(User, { role: UserRole.USER });

//     // Financial statistics
//     const totalAmountLoaned = await Loan.sum('amount',{
//       where:{
//         status:{
//            [Op.in]: [LoanStatus.ACTIVE, LoanStatus.COMPLETED, LoanStatus.DEFAULTED]
//         }
//       }
//     }) || 0;
//     const totalAmountRepaid = await Payment.sum('amount') || 0;

//     // Calculate total amount disbursed (only for active and completed loans)
//     const totalAmountDisbursed = await Loan.sum('amount', {
//       where: {
//         status: {
//           [Op.in]: [LoanStatus.ACTIVE, LoanStatus.COMPLETED, LoanStatus.DEFAULTED]
//         }
//       }
//     }) || 0;

//     // Calculate total interest earned
//     const totalInterestAmount = await Loan.sum('totalAmount') || 0;
//     const totalInterestEarned = Number(totalInterestAmount) - Number(totalAmountDisbursed);

//     // Payment statistics
//     const totalPayments = await Payment.count();
//     const totalPaymentAmount = await Payment.sum('amount') || 0;
//     const totalPendingPayments = await Payment.count({ where: { status: 'pending' } });
//     const totalCompletedPayments = await Payment.count({ where: { status: 'completed' } });
//     const totalFailedPayments = await Payment.count({ where: { status: 'failed' } });

//     // Monthly collection statistics
//     const monthlyCollections = await getMonthlyData(Payment, { status: 'completed' }, 'amount');
//     const monthlyPaymentsCount = await getMonthlyData(Payment, { status: 'completed' });

//     // Recent loans (last 7 days)
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//     const recentLoans = await Loan.count({
//       where: {
//         createdAt: {
//           [Op.gte]: sevenDaysAgo
//         }
//       }
//     });

//     // Calculate loan approval rate
//     const totalProcessedLoans = totalApprovedLoans + totalRejectedLoans;
//     const loanApprovalRate = totalProcessedLoans > 0
//       ? ((totalApprovedLoans / totalProcessedLoans) * 100).toFixed(2)
//       : 0;

//     // Calculate average loan amount
//     const averageLoanAmount = totalLoans > 0
//       ? (Number(totalAmountLoaned) / totalLoans).toFixed(2)
//       : 0;

//     // Calculate collection rate (payments vs expected)
//     const collectionRate = Number(totalAmountDisbursed) > 0
//       ? ((Number(totalAmountRepaid) / Number(totalAmountDisbursed)) * 100).toFixed(2)
//       : 0;

//     // Outstanding amount (total disbursed - total repaid)
//     const outstandingAmount = Number(totalAmountDisbursed) - Number(totalAmountRepaid);

//     const dashboardData = {
//       loans: {
//         total: totalLoans,
//         active: totalActiveLoans,
//         completed: totalCompletedLoans,
//         defaulted: totalDefaultedLoans,
//         pending: totalPendingLoans,
//         rejected: totalRejectedLoans,
//         approved: totalApprovedLoans,
//         recent: recentLoans,
//         approvalRate: `${loanApprovalRate}%`,
//         averageAmount: averageLoanAmount,
//         monthly: {
//           labels: months,
//           total: monthlyLoans,
//           approved: monthlyApprovedLoans,
//           disbursedAmount: monthlyDisbursedAmount
//         }
//       },
//       users: {
//         total: totalUsers,
//         admins: totalAdmins,
//         customers: totalUsers,
//         monthly: {
//           labels: months,
//           newCustomers: monthlyNewUsers
//         }
//       },
//       financial: {
//         totalAmountLoaned: Number(totalAmountLoaned).toFixed(2),
//         totalAmountDisbursed: Number(totalAmountDisbursed).toFixed(2),
//         totalAmountRepaid: Number(totalAmountRepaid).toFixed(2),
//         totalInterestEarned: totalInterestEarned.toFixed(2),
//         outstandingAmount: outstandingAmount.toFixed(2),
//         collectionRate: `${collectionRate}%`,
//         monthly: {
//           labels: months,
//           collections: monthlyCollections,
//           paymentsCount: monthlyPaymentsCount
//         }
//       },
//       payments: {
//         total: totalPayments,
//         totalAmount: Number(totalPaymentAmount).toFixed(2),
//         pending: totalPendingPayments,
//         completed: totalCompletedPayments,
//         failed: totalFailedPayments
//       },
//       summary: {
//         totalRevenue: totalInterestEarned.toFixed(2),
//         totalCustomers: totalUsers,
//         totalActiveLoans: totalActiveLoans,
//         collectionEfficiency: `${collectionRate}%`
//       },
//       trends: {
//         months: months,
//         customerOnboarding: monthlyNewUsers,
//         loansApproved: monthlyApprovedLoans,
//         collections: monthlyCollections
//       }
//     };

//     res.json({
//       success: true,
//       message: 'Admin dashboard data retrieved successfully',
//       data: dashboardData
//     });

//   } catch (error) {
//     console.error('Admin dashboard error:', error);
//     return res.status(500).json({
//       success: false,
//       error: 'Internal server error',
//       message: 'Failed to retrieve dashboard data'
//     });
//   }
// };
// // Helper function to generate a unique loan number
// export const generateLoanNumber = (): string => {
//   const now = new Date();
//   const pad = (n: number): string => n.toString().padStart(2, '0');

//   const day = pad(now.getDate());
//   const month = pad(now.getMonth() + 1);
//   const hour = pad(now.getHours());
//   const minute = pad(now.getMinutes());

//   const randomSuffix = Math.floor(1000 + Math.random() * 9000);

//   return `LN-${day}${month}${hour}${minute}-${randomSuffix}`;
// };



// src/controllers/loanController.ts
import { Request, Response } from 'express';
import Joi from 'joi';
import Loan, { LoanStatus, LoanAttributes } from '../models/Loan';
import User, { UserRole } from '../models/User';
import Payment from '../models/Payment';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { generateApprovalEmail, generateRejectionEmail, sendLoanApplicationEmail } from '../services/email';
import crypto from 'crypto';

export interface AuthRequest extends Request {
  user?: User;
}

const createLoanSchema = Joi.object({
  amount: Joi.number().min(200).max(1000000).required()
    .messages({
      'number.min': 'Loan amount must be at least ZMW 200',
      'number.max': 'Loan amount cannot exceed ZMW 1,000,000',
      'any.required': 'Loan amount is required'
    }),

  termWeeks: Joi.number().min(1).max(4).required()
    .messages({
      'number.min': 'Loan term must be at least 1 week',
      'number.max': 'Loan term cannot exceed 4 weeks',
      'any.required': 'Loan term is required'
    }),

  purpose: Joi.string().min(3).max(500).required()
    .messages({
      'string.min': 'Purpose must be at least 3 characters long',
      'string.max': 'Purpose cannot exceed 500 characters',
      'any.required': 'Loan purpose is required'
    }),

     collateral_details: Joi.string().min(10).max(500).required()
    .messages({
      'string.min': 'Collateral details must be at least 3 characters long',
      'string.max': 'Collateral details cannot exceed 500 characters',
      'any.required': 'Loan Collateral details are required'
    }),



  collateralImages: Joi.array()
    .items(
      Joi.string()
        .pattern(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)
        .message('Each image must be a valid base64 encoded image (JPEG, PNG, GIF, or WebP)')
    )
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'At least 1 collateral image is required',
      'array.max': 'Maximum of 10 collateral images allowed',
      'any.required': 'Collateral images are required'
    }),

  // Optional fields that might be included
  userId: Joi.string().optional(),
  monthlyIncome: Joi.number().min(0).optional(),
  employmentStatus: Joi.string().optional(),
  employer: Joi.string().optional(),
  collateralType: Joi.string().optional(),
  collateralValue: Joi.number().min(0).optional(),
  collateralDescription: Joi.string().max(1000).optional()
});

const approveLoanSchema = Joi.object({
  status: Joi.string().valid(LoanStatus.APPROVED, LoanStatus.REJECTED).required(),
  reason: Joi.string().optional(),
});

// Helper function to ensure upload directory exists
const ensureUploadDirectory = (): void => {
  const uploadDir = path.join(__dirname, '../../uploads/collateral');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// Helper function to save base64 image to file system
const saveBase64Image = async (base64String: string, userId: string): Promise<string> => {
  try {
    // Ensure upload directory exists
    ensureUploadDirectory();

    // Extract image format and data
    const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image format');
    }

    const imageType = matches[1].toLowerCase();
    const imageData = matches[2];

    // Validate image type
    const allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    if (!allowedTypes.includes(imageType)) {
      throw new Error(`Unsupported image type: ${imageType}`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const filename = `${userId}_${timestamp}_${randomId}.${imageType === 'jpeg' ? 'jpg' : imageType}`;

    // Save image to file system
    const filepath = path.join(__dirname, '../../uploads/collateral', filename);
    const buffer = Buffer.from(imageData, 'base64');

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxSize) {
      throw new Error('Image size cannot exceed 5MB');
    }

    await fs.promises.writeFile(filepath, buffer);

    return filename;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    throw error;
  }
};

// Helper function to clean up saved images
const cleanupImages = async (filenames: string[]): Promise<void> => {
  for (const filename of filenames) {
    try {
      const filepath = path.join(__dirname, '../../uploads/collateral', filename);
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
      }
    } catch (error) {
      console.error(`Error deleting image ${filename}:`, error);
    }
  }
};

export const createLoan = async (req: AuthRequest, res: Response) => {
  let savedImageFilenames: string[] = [];

  try {
    const { error, value } = createLoanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 0,
        message: error.details[0].message,
        data: null
      });
    }

    // Check for existing active loans
    const activeLoan = await Loan.findOne({
      where: {
        userId: req.user?.id,
        status: {
          [Op.in]: [LoanStatus.ACTIVE, LoanStatus.PENDING, LoanStatus.DEFAULTED, LoanStatus.APPROVED]
        }
      }
    });

    if (activeLoan) {
      return res.status(200).json({
        status: 1,
        message: "You cannot have multiple unsettled loans",
        data: null
      });
    }

    const { amount, termWeeks, purpose, collateralImages,collateral_details } = value;

    // Calculate interest rate based on term
    let interestRate: number;
    switch (termWeeks) {
      case 1: interestRate = 0.15; break;
      case 2: interestRate = 0.25; break;
      case 3: interestRate = 0.35; break;
      case 4: interestRate = 0.45; break;
      default:
        return res.status(400).json({
          status: 0,
          message: 'Invalid term. Only 1–4 weeks are allowed.',
          data: null
        });
    }

    // Process and save base64 images
    try {
      for (const base64Image of collateralImages) {
        const filename = await saveBase64Image(base64Image, req.user!.id.toString());
        savedImageFilenames.push(filename);
      }
    } catch (imageError) {
      // Clean up any images that were saved before the error
      if (savedImageFilenames.length > 0) {
        await cleanupImages(savedImageFilenames);
      }
      
      return res.status(400).json({
        status: 0,
        message: `Image processing error: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`,
        data: null
      });
    }

    // Create the loan with proper typing
    const loan = await Loan.create({
      userId: req.user!.id,
      loan_number: generateLoanNumber(),
      amount,
      interestRate,
      termWeeks,
      purpose,
      collateralImages: savedImageFilenames, // Store filenames, not paths
      collateral_details,
      status: LoanStatus.PENDING
    } as unknown as LoanAttributes);

    // Send email notification after successful loan creation
    try {
      await sendLoanApplicationEmail(loan.get({ plain: true }), req.user);
    } catch (emailError) {
      // Log email error but don't fail the loan creation
      console.error('Email notification failed:', emailError);
    }

    // Return success response
    res.status(201).json({
      status: 0,
      message: 'Loan application submitted successfully',
      data: {
        ...loan.get({ plain: true }),
        collateralImages: loan.collateralImages || []
      }
    });

  } catch (error) {
    console.error('Create loan error:', error);

    // Clean up uploaded images if loan creation fails
    if (savedImageFilenames.length > 0) {
      await cleanupImages(savedImageFilenames);
    }

    res.status(500).json({
      status: 0,
      message: 'Internal server error',
      data: null
    });
  }
};

export const getCollateralImage = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal attacks
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const imagePath = path.join(__dirname, '../../uploads/collateral', filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Content-Security-Policy', "default-src 'none'"); // Security header

    // Stream the file
    const fileStream = fs.createReadStream(imagePath);
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });
    
    fileStream.pipe(res);
  } catch (error) {
    console.error('Get collateral image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Updated getLoans to include image URLs
export const getLoans = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause: any = {};

    if (req.user!.role === UserRole.USER) {
      whereClause.userId = req.user!.id;
    }

    if (status) {
      whereClause.status = status;
    }

    const loans = await Loan.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
        },
        {
          model: Payment,
          as: "payments",
          required: false,
        }
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Add image URLs to response
    const loansWithImageUrls = loans.rows.map(loan => ({
      ...loan.toJSON(),
      collateralImages: loan.collateralImages?.map((filename: string) => ({
        filename,
        url: `${req.protocol}://${req.get('host')}/api/loans/collateral/${filename}`
      })) || []
    }));

    res.json({
      status: 0,
      message: 'Loans retrieved successfully',
      data: {
        loans: loansWithImageUrls,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: loans.count,
          pages: Math.ceil(loans.count / Number(limit)),
        },
      }
    });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Updated getLoanById to include image URLs
export const getLoanById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let whereClause: any = { id };

    if (req.user!.role === UserRole.USER) {
      whereClause.userId = req.user!.id;
    }

    const loan = await Loan.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
        },
        {
          model: Payment,
          as: 'payments',
          order: [['paymentDate', 'DESC']],
        },
      ],
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Add image URLs to response
    const loanWithImageUrls = {
      ...loan.toJSON(),
      collateralImages: loan.collateralImages?.map((filename: string) => ({
        filename,
        url: `${req.protocol}://${req.get('host')}/api/loans/collateral/${filename}`
      })) || []
    };

    res.json({ 
      status: 0,
      message: 'Loan retrieved successfully',
      data: { loan: loanWithImageUrls }
    });
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveLoan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = approveLoanSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { status } = value;

    const loan = await Loan.findByPk(id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.status !== LoanStatus.PENDING) {
      return res.status(400).json({ error: 'Loan has already been processed' });
    }

    // Get borrower information
    const borrower = await User.findByPk(loan.userId);
    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    let totalAmount = 0;
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (status === LoanStatus.APPROVED) {
      const amount = Number(loan.amount);
      const interestRate = Number(loan.interestRate);
      const interestAmount = amount * interestRate;
      totalAmount = amount + interestAmount;
      startDate = new Date();
      endDate = new Date();
      endDate.setDate(startDate.getDate() + loan.termWeeks * 7);

      await loan.update({
        status: LoanStatus.ACTIVE,
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        approval_reason: value.reason || null,
        startDate,
        endDate,
        totalAmount: Math.round(totalAmount * 100) / 100,
        remainingAmount: Math.round(totalAmount * 100) / 100,
      });

      // Send approval email
      try {
        const emailData = {
          borrowerName: `${borrower.firstName} ${borrower.lastName}`.trim(),
          borrowerEmail: borrower.email,
          loanId: loan.loan_number.toString(),
          amount: Number(loan.amount),
          interestRate: Number(loan.interestRate),
          termWeeks: loan.termWeeks,
          totalAmount: Math.round(totalAmount * 100) / 100,
          startDate,
          endDate,
          companyName: 'Quickcash Ltd',
          contactEmail: 'bbtechnologies01@gmail.com',
          contactPhone: '0973849272',
        };
        
        await generateApprovalEmail(emailData);
        console.log(`Approval email sent successfully to ${borrower.email} for loan ${loan.id}`);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }
    } else {
      await loan.update({
        status,
        approvedBy: req.user!.id,
        approval_reason: value.reason || null,
        approvedAt: new Date(),
      });

      // Send rejection email
      try {
        const emailData = {
          borrowerName: `${borrower.firstName} ${borrower.lastName}`.trim(),
          borrowerEmail: borrower.email,
          loanId: loan.loan_number.toString(),
          amount: Number(loan.amount),
          reason: value.reason || 'Unfortunately, we cannot approve your loan application at this time.',
          companyName: 'Quickcash Ltd',
          contactEmail: 'bbtechnologies01@gmail.com',
          contactPhone: '0973849272',
        };
        
        await generateRejectionEmail(emailData);
        console.log(`Rejection email sent successfully to ${borrower.email} for loan ${loan.id}`);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }
    }

    res.json({
      message: `Loan ${status} successfully`,
      loan,
    });
  } catch (error) {
    console.error('Approve loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const AdminDashBoard = async (req: AuthRequest, res: Response) => {
  try {
    // Current date and setup for monthly calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Function to get monthly data
    const getMonthlyData = async (model: any, whereClause: any = {}, sumField: string | null = null) => {
      const monthlyData = [];

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0);

        const monthWhere = {
          ...whereClause,
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        };

        if (sumField) {
          const value = await model.sum(sumField, { where: monthWhere }) || 0;
          monthlyData.push(Number(value).toFixed(2));
        } else {
          const count = await model.count({ where: monthWhere });
          monthlyData.push(count);
        }
      }

      return monthlyData;
    };

    // Loan statistics
    const totalLoans = await Loan.count();
    const totalActiveLoans = await Loan.count({ where: { status: LoanStatus.ACTIVE } });
    const totalCompletedLoans = await Loan.count({ where: { status: LoanStatus.COMPLETED } });
    const totalDefaultedLoans = await Loan.count({ where: { status: LoanStatus.DEFAULTED } });
    const totalPendingLoans = await Loan.count({ where: { status: LoanStatus.PENDING } });
    const totalRejectedLoans = await Loan.count({ where: { status: LoanStatus.REJECTED } });
    const totalApprovedLoans = await Loan.count({
      where: {
        status: {
          [Op.in]: [
            LoanStatus.APPROVED,
            LoanStatus.ACTIVE,
            LoanStatus.DEFAULTED,
            LoanStatus.COMPLETED
          ]
        }
      }
    });

    // Monthly loan statistics
    const monthlyLoans = await getMonthlyData(Loan);
    const monthlyApprovedLoans = await getMonthlyData(Loan, {
      status: {
        [Op.in]: [
          LoanStatus.APPROVED,
          LoanStatus.COMPLETED,
          LoanStatus.DEFAULTED,
          LoanStatus.ACTIVE
        ]
      }
    });
    const monthlyDisbursedAmount = await getMonthlyData(
      Loan,
      { status: { [Op.in]: [LoanStatus.ACTIVE, LoanStatus.COMPLETED, LoanStatus.DEFAULTED] } },
      'amount'
    );

    // User statistics
    const totalUsers = await User.count({ where: { role: UserRole.USER } });
    const totalAdmins = await User.count({ where: { role: UserRole.ADMIN } });

    // Monthly user onboarding
    const monthlyNewUsers = await getMonthlyData(User, { role: UserRole.USER });

    // Financial statistics
    const totalAmountLoaned = await Loan.sum('amount',{
      where:{
        status:{
           [Op.in]: [LoanStatus.ACTIVE, LoanStatus.COMPLETED, LoanStatus.DEFAULTED]
        }
      }
    }) || 0;
    const totalAmountRepaid = await Payment.sum('amount') || 0;

    // Calculate total amount disbursed (only for active and completed loans)
    const totalAmountDisbursed = await Loan.sum('amount', {
      where: {
        status: {
          [Op.in]: [LoanStatus.ACTIVE, LoanStatus.COMPLETED, LoanStatus.DEFAULTED]
        }
      }
    }) || 0;

    // Calculate total interest earned
    const totalInterestAmount = await Loan.sum('totalAmount') || 0;
    const totalInterestEarned = Number(totalInterestAmount) - Number(totalAmountDisbursed);

    // Payment statistics
    const totalPayments = await Payment.count();
    const totalPaymentAmount = await Payment.sum('amount') || 0;
    const totalPendingPayments = await Payment.count({ where: { status: 'pending' } });
    const totalCompletedPayments = await Payment.count({ where: { status: 'completed' } });
    const totalFailedPayments = await Payment.count({ where: { status: 'failed' } });

    // Monthly collection statistics
    const monthlyCollections = await getMonthlyData(Payment, { status: 'completed' }, 'amount');
    const monthlyPaymentsCount = await getMonthlyData(Payment, { status: 'completed' });

    // Recent loans (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLoans = await Loan.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    // Calculate loan approval rate
    const totalProcessedLoans = totalApprovedLoans + totalRejectedLoans;
    const loanApprovalRate = totalProcessedLoans > 0
      ? ((totalApprovedLoans / totalProcessedLoans) * 100).toFixed(2)
      : 0;

    // Calculate average loan amount
    const averageLoanAmount = totalLoans > 0
      ? (Number(totalAmountLoaned) / totalLoans).toFixed(2)
      : 0;

    // Calculate collection rate (payments vs expected)
    const collectionRate = Number(totalAmountDisbursed) > 0
      ? ((Number(totalAmountRepaid) / Number(totalAmountDisbursed)) * 100).toFixed(2)
      : 0;

    // Outstanding amount (total disbursed - total repaid)
    const outstandingAmount = Number(totalAmountDisbursed) - Number(totalAmountRepaid);

    const dashboardData = {
      loans: {
        total: totalLoans,
        active: totalActiveLoans,
        completed: totalCompletedLoans,
        defaulted: totalDefaultedLoans,
        pending: totalPendingLoans,
        rejected: totalRejectedLoans,
        approved: totalApprovedLoans,
        recent: recentLoans,
        approvalRate: `${loanApprovalRate}%`,
        averageAmount: averageLoanAmount,
        monthly: {
          labels: months,
          total: monthlyLoans,
          approved: monthlyApprovedLoans,
          disbursedAmount: monthlyDisbursedAmount
        }
      },
      users: {
        total: totalUsers,
        admins: totalAdmins,
        customers: totalUsers,
        monthly: {
          labels: months,
          newCustomers: monthlyNewUsers
        }
      },
      financial: {
        totalAmountLoaned: Number(totalAmountLoaned).toFixed(2),
        totalAmountDisbursed: Number(totalAmountDisbursed).toFixed(2),
        totalAmountRepaid: Number(totalAmountRepaid).toFixed(2),
        totalInterestEarned: totalInterestEarned.toFixed(2),
        outstandingAmount: outstandingAmount.toFixed(2),
        collectionRate: `${collectionRate}%`,
        monthly: {
          labels: months,
          collections: monthlyCollections,
          paymentsCount: monthlyPaymentsCount
        }
      },
      payments: {
        total: totalPayments,
        totalAmount: Number(totalPaymentAmount).toFixed(2),
        pending: totalPendingPayments,
        completed: totalCompletedPayments,
        failed: totalFailedPayments
      },
      summary: {
        totalRevenue: totalInterestEarned.toFixed(2),
        totalCustomers: totalUsers,
        totalActiveLoans: totalActiveLoans,
        collectionEfficiency: `${collectionRate}%`
      },
      trends: {
        months: months,
        customerOnboarding: monthlyNewUsers,
        loansApproved: monthlyApprovedLoans,
        collections: monthlyCollections
      }
    };

    res.json({
      success: true,
      message: 'Admin dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve dashboard data'
    });
  }
};

// Helper function to generate a unique loan number
export const generateLoanNumber = (): string => {
  const now = new Date();
  const pad = (n: number): string => n.toString().padStart(2, '0');

  const day = pad(now.getDate());
  const month = pad(now.getMonth() + 1);
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `LN-${day}${month}${hour}${minute}-${randomSuffix}`;
};