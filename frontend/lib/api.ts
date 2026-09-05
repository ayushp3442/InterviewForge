const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type AuthResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: { id: number; name: string; email: string };
};

type RegisterResponse = {
  message: string;
  user: { id: number; name: string; email: string };
};

async function handleResponse<T>(res: Response): Promise<T> {
  // 401/403 — token may be expired; caller should retry after refresh
  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Session expired");
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as any).error || "Something went wrong");
  }
  return data as T;
}

/**
 * Authenticated fetch — auto-retries once with a refreshed token on 401.
 * Falls back to redirecting to /login if refresh also fails.
 */
async function authFetch(url: string, options: RequestInit): Promise<Response> {
  let res = await fetch(url, options);

  if (res.status === 401 || res.status === 403) {
    const { refreshAccessToken } = await import("@/lib/auth");
    const newToken = await refreshAccessToken();
    if (!newToken) {
      // refreshAccessToken already redirected to /login
      throw new Error("Session expired. Please log in again.");
    }
    // Rebuild headers with fresh token
    const newHeaders = new Headers(options.headers as HeadersInit);
    newHeaders.set("Authorization", `Bearer ${newToken}`);
    res = await fetch(url, { ...options, headers: newHeaders });
  }

  return res;
}


export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function signupUser(name: string, email: string, password: string): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse<RegisterResponse>(res);
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function listInterviews(): Promise<any> {
  const res = await authFetch(`${API_URL}/interviews`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function createInterview(data: {
  type: string;
  role: string;
  domain: string;
  difficulty: string;
  mode: string;
}): Promise<any> {
  const res = await authFetch(`${API_URL}/interviews`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<any>(res);
}

export async function addQuestionsToInterview(interviewId: number): Promise<any> {
  const res = await authFetch(`${API_URL}/interviews/${interviewId}/questions`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function submitResponse(questionId: number, answerText: string): Promise<any> {
  const res = await authFetch(`${API_URL}/interviews/questions/${questionId}/response`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ answerText }),
  });
  return handleResponse<any>(res);
}

export async function completeInterview(interviewId: number): Promise<any> {
  const res = await authFetch(`${API_URL}/interviews/${interviewId}/complete`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function getInterviewReport(interviewId: number): Promise<any> {
  const res = await authFetch(`${API_URL}/interviews/${interviewId}/report`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function logoutUser(refreshToken: string): Promise<any> {
  const res = await authFetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse<any>(res);
}

export async function uploadResume(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("resume", file);

  // Note: Do NOT set Content-Type header — browser sets it automatically with boundary
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/resumes`, {
    method: "POST",
    headers,
    body: formData,
  });
  return handleResponse<any>(res);
}

export async function getLatestResume(): Promise<any> {
  const res = await fetch(`${API_URL}/resumes/latest`, {
    method: "GET",
    headers: getHeaders(),
  });
  // Return null instead of throwing if no resume exists (404)
  if (res.status === 404) return { resume: null };
  return handleResponse<any>(res);
}

export async function getMe(): Promise<any> {
  const res = await authFetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function updateProfile(name: string): Promise<any> {
  const res = await authFetch(`${API_URL}/auth/profile`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleResponse<any>(res);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<any> {
  const res = await authFetch(`${API_URL}/auth/password`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse<any>(res);
}