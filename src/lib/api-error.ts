import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from './logger'

/**
 * Standard API Error Response Structure
 */
export interface ApiErrorResponse {
    error: string;
    details?: string[];
    code?: string;
}

/**
 * Central Error Handler for Next.js API Routes (App Router).
 * Masks internal errors from the client while logging them properly on the server.
 * 
 * @param error The error thrown
 * @param context Optional string indicating where the error occurred
 * @returns NextResponse with standardized error formatting
 */
export function handleApiError(error: unknown, context?: string): NextResponse<ApiErrorResponse> {
    const errorLocation = context ? `[${context}]` : '[API Error]'

    if (error instanceof z.ZodError) {
        // Validation errors (400)
        logger.warn({ issues: error.issues }, `${errorLocation} Validation Failed`)
        return NextResponse.json({
            error: 'Validation failed',
            details: error.issues.map((i) => i.message),
            code: 'VALIDATION_ERROR'
        }, { status: 400 })
    }

    if (error instanceof Error) {
        // Detect common external connection failures (VPN Panel unreachable, etc.)
        const connectionErrors = ['fetch failed', 'ECONNREFUSED', 'ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT'];
        const isConnectionError = connectionErrors.some(msg => error.message.includes(msg));

        if (isConnectionError) {
            logger.warn(`${errorLocation} External Connection Failure: ${error.message}${context ? ` (${context})` : ''}`);
            return NextResponse.json({
                error: 'External service temporarily unreachable',
                code: 'EXTERNAL_CONNECTION_FAILURE'
            }, { status: 503 });
        }

        // Known generic errors where we explicitly pass message to client
        if (error.name === 'AppError') {
            const appError = error as AppError;
            logger.warn(`${errorLocation} Application Error: ${appError.message}`)
            return NextResponse.json({
                error: appError.message,
                code: 'APP_ERROR'
            }, { status: appError.statusCode || 400 })
        }

        // Standard JS Errors (500)
        logger.error({ stack: error.stack }, `${errorLocation} Unhandled Exception: ${error.message}`)
    } else {
        // Unknown things thrown
        logger.error({ error }, `${errorLocation} Unknown Error`)
    }

    // Default to generic 500 error for anything not explicitly handled.
    // Masks actual error message from end-user for security.
    return NextResponse.json({
        error: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 })
}

/**
 * Custom application-level error class for throwing errors that 
 * should be safely returned to the client (e.g. 400 Bad Requests).
 */
export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
    }
}
