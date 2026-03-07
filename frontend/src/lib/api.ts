import axios from "axios";
import { getAuthSnapshot, useAuthStore, type SessionUser } from "../state/authStore";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

const api = axios.create({
  baseURL,
  timeout: 15000
});

let refreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing && refreshPromise) {
    return refreshPromise;
  }

  refreshing = true;
  refreshPromise = (async () => {
    const state = getAuthSnapshot();
    if (!state.refreshToken) return null;

    try {
      const res = await axios.post(`${baseURL}/auth/refresh`, {
        refreshToken: state.refreshToken
      });

      const token = res.data.accessToken as string;
      const newRefresh = (res.data.refreshToken as string) ?? state.refreshToken;
      useAuthStore.getState().setSession({
        accessToken: token,
        refreshToken: newRefresh,
        user: state.user as SessionUser
      });
      return token;
    } catch {
      useAuthStore.getState().clearSession();
      return null;
    } finally {
      refreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const state = getAuthSnapshot();
  if (state.accessToken) {
    config.headers.Authorization = `Bearer ${state.accessToken}`;
  }

  const identity = localStorage.getItem("gigs-mtaani-identity-keypair");
  if (identity) {
    try {
      const parsed = JSON.parse(identity) as { publicKey: string };
      config.headers["X-Device-Public-Key"] = parsed.publicKey;
    } catch {
      // Ignore malformed local data.
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

export type RegisterInput = {
  campusEmail: string;
  phone: string;
  password: string;
  displayName: string;
  campusId: string;
};

export type LoginInput = {
  identifier: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
};

export const authApi = {
  register: async (input: RegisterInput) => {
    const { data } = await api.post("/auth/register", input);
    return data;
  },
  login: async (input: LoginInput) => {
    const { data } = await api.post("/auth/login", input);
    return data as {
      accessToken: string;
      refreshToken: string;
      csrfToken?: string;
      expiresIn: number;
      user: SessionUser;
    };
  },
  verifyEmail: async (token: string) => {
    const { data } = await api.post("/auth/verify-email", { token });
    return data as { success: boolean; message: string };
  },
  forgotPassword: async (campusEmail: string) => {
    const { data } = await api.post("/auth/password/forgot", { campusEmail });
    return data as { success: boolean; message: string; resetToken?: string };
  },
  resetPassword: async (token: string, password: string) => {
    const { data } = await api.post("/auth/password/reset", { token, password });
    return data as { success: boolean; message: string };
  },
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  }
};

export type FeedQuery = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  mode: "MY_LOCATION" | "GENERAL";
  limit?: number;
};

export const gigsApi = {
  feed: async (query: FeedQuery) => {
    const { data } = await api.get("/gigs/feed", { params: query });
    return data;
  },
  create: async (payload: {
    title: string;
    description: string;
    category: string;
    payAmount: number;
    currency: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    startsAt: string;
    media: Array<{ type: "IMAGE" | "VIDEO" | "VOICE"; objectKey: string }>;
  }) => {
    const { data } = await api.post("/gigs", payload);
    return data;
  },
  apply: async (gigId: string, payload?: { bidAmount?: number; message?: string }) => {
    const { data } = await api.post(`/gigs/${gigId}/apply`, payload ?? {});
    return data;
  },
  myPosted: async () => {
    const { data } = await api.get("/gigs/mine/posted");
    return data;
  }
};

export const chatApi = {
  threads: async () => {
    const { data } = await api.get("/chat/threads");
    return data;
  },
  messages: async (threadId: string) => {
    const { data } = await api.get(`/chat/threads/${threadId}/messages`);
    return data;
  },
  sendMessage: async (threadId: string, payload: {
    ciphertext: string;
    nonce: string;
    ratchetHeader: string;
    senderKeyId: string;
  }) => {
    const { data } = await api.post(`/chat/threads/${threadId}/messages`, payload);
    return data;
  },
  prekeys: async (userId: string) => {
    const { data } = await api.get(`/chat/prekeys/${userId}`);
    return data;
  }
};

export const walletApi = {
  me: async () => {
    const { data } = await api.get("/escrow/wallet/me");
    return data;
  },
  topup: async (amount: number, currency = "KES") => {
    const { data } = await api.post("/escrow/wallet/topup", { amount, currency });
    return data;
  }
};

export const safetyApi = {
  active: async () => {
    const { data } = await api.get("/safety/sessions/active");
    return data;
  },
  sos: async (sessionId: string, payload?: { encryptedLocation?: string; note?: string }) => {
    const { data } = await api.post(`/safety/sessions/${sessionId}/sos`, payload ?? {});
    return data;
  }
};

export const adminApi = {
  metrics: async () => {
    const { data } = await api.get("/admin/metrics");
    return data;
  },
  riskDashboard: async () => {
    const { data } = await api.get("/risk/dashboard");
    return data;
  }
};

