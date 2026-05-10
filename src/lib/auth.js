import { getStore, ensureUserCollections } from "@/lib/demoStore";

function createToken() {
  return `token_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function createUserId() {
  return `user_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createUser({ name, email, password }) {
  const store = getStore();
  const normalizedEmail = email.toLowerCase().trim();

  if (store.usersByEmail[normalizedEmail]) {
    throw new Error("User already exists");
  }

  const user = {
    id: createUserId(),
    name: name?.trim() || "Sharq User",
    email: normalizedEmail,
    password,
    role: "user",
    isBlocked: false,
    emailVerified: false,
  };

  store.usersById[user.id] = user;
  store.usersByEmail[normalizedEmail] = user.id;
  store.verificationCodesByEmail[normalizedEmail] = createVerificationCode();
  ensureUserCollections(user.id);

  return user;
}

export function loginUser({ email, password }) {
  const store = getStore();
  const normalizedEmail = email.toLowerCase().trim();
  const existingUserId = store.usersByEmail[normalizedEmail];

  if (!existingUserId) {
    return createUser({
      name: normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password,
    });
  }

  const user = store.usersById[existingUserId];
  if (user.isBlocked) {
    throw new Error("Your account is blocked. Please contact support.");
  }
  if (user.password !== password) {
    throw new Error("Invalid email or password");
  }
  if (user.emailVerified === false) {
    throw new Error("Please verify your email before logging in");
  }

  return user;
}

export function createSession(userId) {
  const store = getStore();
  const token = createToken();
  store.sessions[token] = userId;
  return token;
}

export function getUserFromRequest(req) {
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const cookieToken = req.cookies?.get?.("auth_token")?.value || "";
  const token = bearerToken || cookieToken;

  if (!token) return null;

  const store = getStore();
  const userId = store.sessions[token];
  if (!userId) return null;

  const user = store.usersById[userId];
  if (!user) return null;

  return {
    token,
    user,
  };
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    isBlocked: Boolean(user.isBlocked),
    emailVerified: user.emailVerified !== false,
  };
}

export function verifyEmailCode({ email, code }) {
  const store = getStore();
  const normalizedEmail = email.toLowerCase().trim();
  const userId = store.usersByEmail[normalizedEmail];
  if (!userId) {
    throw new Error("Invalid email or verification code");
  }

  const expectedCode = store.verificationCodesByEmail[normalizedEmail];
  if (!expectedCode || String(expectedCode) !== String(code).trim()) {
    throw new Error("Invalid email or verification code");
  }

  const user = store.usersById[userId];
  user.emailVerified = true;
  delete store.verificationCodesByEmail[normalizedEmail];
  return user;
}

export function setSessionCookie(response, token) {
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function clearSession(token) {
  const store = getStore();
  delete store.sessions[token];
}

export function clearSessionCookie(response) {
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function issuePasswordResetToken(email) {
  const store = getStore();
  const normalizedEmail = email.toLowerCase().trim();
  const userId = store.usersByEmail[normalizedEmail];
  if (!userId) return "";

  const token = createToken();
  store.passwordResetTokens[token] = {
    userId,
    expiresAt: Date.now() + 1000 * 60 * 30,
  };
  return token;
}

export function setUserPassword(user, password) {
  user.password = password;
  return user;
}

export function resetPasswordWithToken({ token, password }) {
  const store = getStore();
  const reset = store.passwordResetTokens[token];
  if (!reset || reset.expiresAt < Date.now()) {
    throw new Error("Invalid or expired reset token");
  }

  const user = store.usersById[reset.userId];
  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  setUserPassword(user, password);
  delete store.passwordResetTokens[token];
  return user;
}

export function isAdmin(user) {
  return String(user?.role || "").toLowerCase() === "admin";
}

export function requireAuth(req) {
  return getUserFromRequest(req);
}

export function requireAdmin(req) {
  const session = getUserFromRequest(req);
  if (!session || !isAdmin(session.user)) return null;
  return session;
}
