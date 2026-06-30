export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR'
  | 'SLUG_TAKEN';

export interface AppErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export interface AppSuccessResponse<T> {
  success: true;
  data: T;
}

export type AppResponse<T> = AppSuccessResponse<T> | AppErrorResponse;

/**
 * Custom Error class for throwing application-specific errors
 * that can be caught and formatted cleanly for the frontend.
 */
export class AppError extends Error {
  public code: ErrorCode;
  public fieldErrors?: Record<string, string[]>;

  constructor(message: string, code: ErrorCode = 'INTERNAL_SERVER_ERROR', fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Wrapper for Server Actions to catch errors and return a standardized AppResponse.
 */
export async function withErrorHandling<T>(
  action: () => Promise<T>
): Promise<AppResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error: any) {
    console.error('Server Action Error:', error);

    // Handle Prisma Unique Constraint Violations
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      if (target.includes('slug')) {
        return {
          success: false,
          error: {
            code: 'SLUG_TAKEN',
            message: 'This URL slug is already taken. Please try another one.',
            fieldErrors: { slug: ['Slug must be unique'] }
          }
        };
      }
      return {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A record with this unique value already exists.',
        }
      };
    }

    // Handle our custom AppErrors
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          fieldErrors: error.fieldErrors,
        }
      };
    }

    // Fallback for unexpected errors
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      }
    };
  }
}
