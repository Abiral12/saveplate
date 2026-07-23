import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { Prisma } from "@/app/generated/prisma/client";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function ok<T>(
  message: string,
  data: T,
  status = 200,
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    {
      status,
    },
  );
}

export async function readJsonBody(
  request: Request,
): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(
      400,
      "The request body must contain valid JSON.",
    );
  }
}

export function handleApiError(
  error: unknown,
) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        errors: error.errors,
      },
      {
        status: error.status,
      },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed.",
        errors: error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  if (
    error instanceof
    Prisma.PrismaClientKnownRequestError
  ) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message:
            "A conflicting donation record already exists.",
        },
        {
          status: 409,
        },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          message:
            "The requested record was not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (error.code === "P2034") {
      return NextResponse.json(
        {
          success: false,
          message:
            "The record changed while this action was being processed. Please try again.",
        },
        {
          status: 409,
        },
      );
    }
  }

  console.error("[api] unexpected error:", error);

  return NextResponse.json(
    {
      success: false,
      message:
        "An unexpected server error occurred.",
    },
    {
      status: 500,
    },
  );
}