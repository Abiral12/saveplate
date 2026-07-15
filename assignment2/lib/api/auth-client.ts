export type ApiResponse<TData = unknown> = {
  success: boolean;
  message: string;
  data?: TData;
  errors?: Record<string, string | string[]>;
};

export type AuthRequestResult<TData = unknown> = {
  status: number;
  body: ApiResponse<TData>;
};

export async function postAuthRequest<TData, TPayload>(
  endpoint: string,
  payload: TPayload,
): Promise<AuthRequestResult<TData>> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {
      status: response.status,
      body: {
        success: false,
        message: "The server returned an invalid response. Please try again.",
      },
    };
  }

  const body = (await response.json()) as ApiResponse<TData>;

  return {
    status: response.status,
    body,
  };
}