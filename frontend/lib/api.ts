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