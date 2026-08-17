type RequestHeaders = Record<string, string>;

interface RequestJsonOptions {
  headers?: RequestHeaders;
  body?: unknown;
  label?: string;
}

async function requestJson<ResponseBody>(
  method: "GET" | "POST" | "PATCH",
  url: string | URL,
  { headers = {}, body, label = "HTTP" }: RequestJsonOptions = {},
): Promise<ResponseBody> {
  const response = await fetch(url, {
    method,
    headers: { accept: "application/json", ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    throw new Error(`${label} ${method} failed: ${response.status}`);
  }

  return (await response.json()) as ResponseBody;
}

export function getJson<ResponseBody>(
  url: string | URL,
  headers: RequestHeaders = {},
  label = "HTTP",
): Promise<ResponseBody> {
  return requestJson<ResponseBody>("GET", url, { headers, label });
}

export function postJson<ResponseBody>(
  url: string | URL,
  body: unknown,
  headers: RequestHeaders = {},
  label = "HTTP",
): Promise<ResponseBody> {
  return requestJson<ResponseBody>("POST", url, {
    headers: { "content-type": "application/json", ...headers },
    body,
    label,
  });
}

export function patchJson<ResponseBody>(
  url: string | URL,
  body: unknown,
  headers: RequestHeaders = {},
  label = "HTTP",
): Promise<ResponseBody> {
  return requestJson<ResponseBody>("PATCH", url, {
    headers: { "content-type": "application/json", ...headers },
    body,
    label,
  });
}
