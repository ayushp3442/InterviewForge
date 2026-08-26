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
  // Handle 401 — token expired or missing, redirect to login
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data as T;
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
  const res = await fetch(`${API_URL}/interviews`, {
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
  const res = await fetch(`${API_URL}/interviews`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<any>(res);
}

export async function addQuestionsToInterview(interviewId: number): Promise<any> {
  const res = await fetch(`${API_URL}/interviews/${interviewId}/questions`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function submitResponse(questionId: number, answerText: string): Promise<any> {
  const res = await fetch(`${API_URL}/interviews/questions/${questionId}/response`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ answerText }),
  });
  return handleResponse<any>(res);
}

export async function completeInterview(interviewId: number): Promise<any> {
  const res = await fetch(`${API_URL}/interviews/${interviewId}/complete`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function getInterviewReport(interviewId: number): Promise<any> {
  const res = await fetch(`${API_URL}/interviews/${interviewId}/report`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function logoutUser(refreshToken: string): Promise<any> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse<any>(res);
}