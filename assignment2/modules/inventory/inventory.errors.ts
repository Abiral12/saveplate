import {
  Prisma,
} from "@/app/generated/prisma/client";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

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

export function successResponse<T>(
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

export function errorResponse(
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
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          message: "Food item was not found.",
        },
        {
          status: 404,
        },
      );
    }
  }

  console.error(
    "[inventory] unexpected error:",
    error,
  );

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