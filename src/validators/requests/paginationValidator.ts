import type { Request, Response, NextFunction } from 'express';
import * as z from 'zod';

const paginationValidations = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive integer')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, 'Page must be at least 1')
    .optional()
    .default(1),
  pageSize: z
    .string()
    .regex(/^\d+$/, 'Page size must be a positive integer')
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => val >= 1 && val <= 100,
      'Page size must be between 1 and 100'
    )
    .optional()
    .default(20)
});

export type PaginationSchema = z.infer<typeof paginationValidations>;

export function paginationValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const paginationData = paginationValidations.safeParse(req.query);

    if (!paginationData.success) {
      const errors = paginationData.error.issues.map((issue) => issue.message);
      console.log(`Pagination validation error(s):\n${errors.join('\n')}`);
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    // Add validated pagination data to request object
    req.pagination = paginationData.data;

    return next();
  } catch (err) {
    console.log(
      `Error occurred during pagination validation middleware: ${err}`
    );
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationSchema;
    }
  }
}
