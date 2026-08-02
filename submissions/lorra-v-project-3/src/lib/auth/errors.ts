/** Map Supabase / auth error messages to short, user-facing copy. */
export function friendlyAuthError(message: string | null | undefined): string {
  const raw = (message ?? "").trim();
  const lower = raw.toLowerCase();

  if (!raw) return "Something went wrong. Please try again.";
  if (lower.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before signing in. Check your inbox for a link from Supabase.";
  }
  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered")
  ) {
    return "An account with this email already exists. Try logging in.";
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (lower.includes("signup requires a valid password")) {
    return "Please enter a password.";
  }
  if (lower.includes("unable to validate email")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (lower === "missing_code" || lower === "auth_failed") {
    return "Sign-in link was invalid or expired. Please try again.";
  }
  if (lower === "missing_email") {
    return "Email is required.";
  }

  return raw.length > 160 ? "Something went wrong. Please try again." : raw;
}

export function authErrorFromSearchParam(
  error: string | string[] | undefined,
): string | null {
  if (!error) return null;
  const value = Array.isArray(error) ? error[0] : error;
  return friendlyAuthError(decodeURIComponent(value));
}
