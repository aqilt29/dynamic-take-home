/**
 * API Middleware Layer
 * Composable middleware functions for API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import { z } from "zod";
import { auth } from "@/auth";
import { CommonErrors, handleError } from "./responses";
import { formatZodError, validateSafe } from "./validation";

/**
 * Context passed to authenticated route handlers
 * Contains the authenticated session and optionally validated data
 */
export interface ApiContext<TValidated = unknown> {
  session: Session;
  validated?: TValidated;
  params?: Record<string, string>;
}

/**
 * Type for route handlers that receive enhanced context
 * TValidated: The type of validated data (from request body, params, or query)
 */
export type ApiHandler<TValidated = unknown> = (
  request: NextRequest,
  context: ApiContext<TValidated>
) => Promise<NextResponse> | NextResponse;

/**
 * Next.js route context with dynamic params
 */
export interface RouteContext {
  params: Promise<Record<string, string>>;
}

/**
 * Middleware: Authentication
 *
 * Ensures user is authenticated before proceeding.
 * Provides session and route params to the handler.
 *
 * Usage:
 *   export const GET = withAuth(async (req, { session }) => { ... });
 */
export function withAuth(handler: ApiHandler) {
  return async (
    request: NextRequest,
    routeContext?: RouteContext
  ): Promise<NextResponse> => {
    try {
      const session = await auth();

      if (!session?.user?.id || !session?.user?.email) {
        return CommonErrors.unauthorized("Authentication required");
      }

      // Resolve dynamic route params if they exist
      const params = routeContext?.params
        ? await routeContext.params
        : undefined;

      const context: ApiContext = {
        session,
        params,
      };

      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Middleware: Error Handling
 *
 * Wraps handler with try-catch and standardized error responses.
 * Usually not needed directly as other middleware includes error handling.
 *
 * Usage:
 *   const handler = withErrorHandling(async (req, ctx) => { ... });
 */
export function withErrorHandling<TValidated = unknown>(
  handler: ApiHandler<TValidated>
) {
  return async (
    request: NextRequest,
    context: ApiContext<TValidated>
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Middleware: Request Body Validation
 *
 * Parses and validates request body against Zod schema.
 * Provides type-safe validated data to handler via context.validated
 *
 * Usage:
 *   export const POST = withAuth(
 *     withValidation(MySchema, async (req, { validated }) => {
 *       // validated has type inferred from MySchema
 *     })
 *   );
 */
export function withValidation<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  handler: ApiHandler<z.infer<TSchema>>
) {
  return async (
    request: NextRequest,
    context: ApiContext
  ): Promise<NextResponse> => {
    try {
      // Parse request body
      const body = await request.json();

      // Validate against schema
      const result = validateSafe(schema, body);

      if (!result.success) {
        return CommonErrors.validationError(formatZodError(result.error));
      }

      // Add validated data to context with proper typing
      const enhancedContext = {
        session: context.session,
        params: context.params,
        validated: result.data,
      } as ApiContext<z.infer<TSchema>>;

      return await handler(request, enhancedContext);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return CommonErrors.badRequest("Invalid JSON in request body");
      }
      return handleError(error);
    }
  };
}

/**
 * Middleware: Query Parameter Validation
 *
 * Validates URL query parameters against Zod schema.
 * Provides type-safe validated query params to handler.
 *
 * Usage:
 *   export const GET = withAuth(
 *     withQueryValidation(QuerySchema, async (req, { validated }) => {
 *       // validated has query params typed
 *     })
 *   );
 */
export function withQueryValidation<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  handler: ApiHandler<z.infer<TSchema>>
) {
  return async (
    request: NextRequest,
    context: ApiContext
  ): Promise<NextResponse> => {
    try {
      // Extract query parameters from URL
      const { searchParams } = new URL(request.url);
      const queryObject = Object.fromEntries(searchParams.entries());

      // Validate against schema
      const result = validateSafe(schema, queryObject);

      if (!result.success) {
        return CommonErrors.validationError(formatZodError(result.error));
      }

      // Add validated query params to context with proper typing
      const enhancedContext = {
        session: context.session,
        params: context.params,
        validated: result.data,
      } as ApiContext<z.infer<TSchema>>;

      return await handler(request, enhancedContext);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Middleware: Route Parameter Validation
 *
 * Validates dynamic route parameters (e.g., [address]) against Zod schema.
 * Provides type-safe validated params to handler.
 *
 * Usage:
 *   export const GET = withAuth(
 *     withParamValidation(ParamSchema, async (req, { validated }) => {
 *       // validated.address is typed and validated
 *     })
 *   );
 */
export function withParamValidation<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  handler: ApiHandler<z.infer<TSchema>>
) {
  return async (
    request: NextRequest,
    context: ApiContext
  ): Promise<NextResponse> => {
    try {
      if (!context.params) {
        return CommonErrors.badRequest("Missing route parameters");
      }

      // Validate route params against schema
      const result = validateSafe(schema, context.params);

      if (!result.success) {
        return CommonErrors.validationError(formatZodError(result.error));
      }

      // Add validated params to context with proper typing
      const enhancedContext = {
        session: context.session,
        params: context.params,
        validated: result.data,
      } as ApiContext<z.infer<TSchema>>;

      return await handler(request, enhancedContext);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Middleware: Combined Auth + Body Validation
 *
 * Most common pattern: authenticate user, then validate request body.
 * Convenience wrapper that combines withAuth() and withValidation().
 *
 * Usage:
 *   export const POST = withAuthAndValidation(
 *     MySchema,
 *     async (req, { session, validated }) => {
 *       // Both session and validated data are available
 *     }
 *   );
 */
export function withAuthAndValidation<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  handler: ApiHandler<z.infer<TSchema>>
) {
  return withAuth(withValidation(schema, handler));
}

/**
 * Middleware: Combined Auth + Param Validation
 *
 * Common pattern for dynamic routes: authenticate user, then validate route params.
 * Convenience wrapper that combines withAuth() and withParamValidation().
 *
 * Usage:
 *   export const GET = withAuthAndParams(
 *     ParamSchema,
 *     async (req, { session, validated }) => {
 *       // Both session and validated.address are available
 *     }
 *   );
 */
export function withAuthAndParams<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  handler: ApiHandler<z.infer<TSchema>>
) {
  return withAuth(withParamValidation(schema, handler));
}

/**
 * Middleware: Public Access (No Authentication)
 *
 * For public endpoints that don't require authentication.
 * Provides error handling only.
 *
 * Usage:
 *   export const GET = withPublicAccess(async (req) => {
 *     return apiSuccess({ status: "ok" });
 *   });
 */
export function withPublicAccess(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      return handleError(error);
    }
  };
}
