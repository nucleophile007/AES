/** Small fetch wrapper: returns parsed JSON and throws with the server's error message. */
export async function taskApi<T = any>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(url, {
    credentials: "include",
    ...rest,
    headers: json !== undefined ? { "Content-Type": "application/json", ...(rest.headers ?? {}) } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }
  if (!res.ok || (data && data.success === false)) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

/** Uploads one file to the task upload endpoint. */
export async function uploadTaskFile(file: File): Promise<{ fileUrl: string; fileName: string }> {
  const form = new FormData();
  form.append("file", file);
  return taskApi("/api/tasks/upload", { method: "POST", body: form });
}
