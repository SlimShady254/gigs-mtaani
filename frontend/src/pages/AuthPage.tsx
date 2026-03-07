import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { authApi } from "../lib/api";
import { useAuthStore } from "../state/authStore";
import { THEME_OPTIONS, type ThemeName, useThemeStore } from "../state/themeStore";

type AuthMode = "login" | "register" | "verify" | "forgot" | "reset";

type PasswordRule = {
  label: string;
  test: (value: string) => boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[1-9]\d{8,14}$/;

const passwordRules: PasswordRule[] = [
  { label: "At least 12 characters", test: (value) => value.length >= 12 },
  { label: "Uppercase and lowercase letters", test: (value) => /[A-Z]/.test(value) && /[a-z]/.test(value) },
  { label: "At least one number", test: (value) => /\d/.test(value) },
  { label: "At least one special character", test: (value) => /[^A-Za-z0-9]/.test(value) }
];

function getPasswordChecks(value: string) {
  return passwordRules.map((rule) => ({ label: rule.label, pass: rule.test(value) }));
}

function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
  return data?.error ?? data?.message ?? fallback;
}

function parseAuthState(search: string) {
  const params = new URLSearchParams(search);
  const mode = params.get("mode");
  const token = params.get("token")?.trim() ?? "";
  if (mode === "verify" && token) return { mode: "verify" as AuthMode, verifyToken: token, resetToken: "" };
  if (mode === "reset" && token) return { mode: "reset" as AuthMode, verifyToken: "", resetToken: token };
  return { mode: "login" as AuthMode, verifyToken: "", resetToken: "" };
}

function PasswordChecklist({ value }: { value: string }) {
  const checks = useMemo(() => getPasswordChecks(value), [value]);
  const passed = checks.filter((item) => item.pass).length;

  return (
    <div className="pro-auth-password-box">
      <div className="pro-auth-password-head">
        <span>Password strength</span>
        <strong>{passed}/4</strong>
      </div>
      <div className="pro-auth-password-meter">
        {checks.map((item) => (
          <span
            key={item.label}
            className={item.pass ? "pro-auth-password-meter-bar is-pass" : "pro-auth-password-meter-bar"}
          />
        ))}
      </div>
      <ul className="pro-auth-password-checks">
        {checks.map((item) => (
          <li key={item.label} className={item.pass ? "is-pass" : ""}>
            <BadgeCheck size={14} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="pro-auth-field">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function TextInput({
  id,
  icon,
  children
}: {
  id: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="pro-auth-input-wrap" id={`${id}-wrap`}>
      {icon}
      {children}
    </div>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, setSession } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const parsed = useMemo(() => parseAuthState(location.search), [location.search]);

  const [mode, setMode] = useState<AuthMode>(parsed.mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [devVerificationToken, setDevVerificationToken] = useState<string | null>(parsed.verifyToken || null);
  const [devResetToken, setDevResetToken] = useState<string | null>(parsed.resetToken || null);
  const [showPassword, setShowPassword] = useState({ login: false, register: false, reset: false });

  const [loginForm, setLoginForm] = useState({ identifier: "", password: "", rememberMe: true, mfaCode: "" });
  const [registerForm, setRegisterForm] = useState({
    displayName: "",
    campusEmail: "",
    phone: "",
    campusId: "",
    password: "",
    confirmPassword: ""
  });
  const [verifyToken, setVerifyToken] = useState(parsed.verifyToken);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetForm, setResetForm] = useState({ token: parsed.resetToken, password: "", confirmPassword: "" });

  useEffect(() => {
    if (accessToken) navigate("/app", { replace: true });
  }, [accessToken, navigate]);

  function switchMode(nextMode: AuthMode, options?: { preserveFeedback?: boolean }) {
    setMode(nextMode);
    if (!options?.preserveFeedback) {
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loginForm.identifier.trim() || !loginForm.password) {
      setErrorMessage("Campus email/phone and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const response = await authApi.login({
        identifier: loginForm.identifier.trim(),
        password: loginForm.password,
        rememberMe: loginForm.rememberMe,
        mfaCode: loginForm.mfaCode.trim() || undefined
      });

      if (response.csrfToken) localStorage.setItem("gigs-mtaani-csrf-token", response.csrfToken);
      setSession({ accessToken: response.accessToken, refreshToken: response.refreshToken, user: response.user });
      navigate("/app", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = registerForm.campusEmail.trim().toLowerCase();
    const phone = registerForm.phone.trim();

    if (!registerForm.displayName.trim() || !registerForm.campusId.trim()) {
      setErrorMessage("Display name and campus ID are required.");
      return;
    }

    if (!emailPattern.test(email)) {
      setErrorMessage("Use a valid campus email address.");
      return;
    }

    if (!phonePattern.test(phone)) {
      setErrorMessage("Use phone format like +2547XXXXXXXX.");
      return;
    }

    if (getPasswordChecks(registerForm.password).some((check) => !check.pass)) {
      setErrorMessage("Password does not meet required strength.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const response = (await authApi.register({
        campusEmail: email,
        phone,
        password: registerForm.password,
        displayName: registerForm.displayName.trim(),
        campusId: registerForm.campusId.trim()
      })) as { message?: string; requiresEmailVerification?: boolean; verificationToken?: string };

      setPendingEmail(email);
      setSuccessMessage(response.message ?? "Account created.");
      if (response.verificationToken) {
        setDevVerificationToken(response.verificationToken);
        setVerifyToken(response.verificationToken);
      }

      if (response.requiresEmailVerification) {
        switchMode("verify", { preserveFeedback: true });
      } else {
        setLoginForm((current) => ({ ...current, identifier: email, password: "", mfaCode: "" }));
        switchMode("login", { preserveFeedback: true });
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Registration failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verifyToken.trim()) {
      setErrorMessage("Verification token is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const response = await authApi.verifyEmail(verifyToken.trim());
      setSuccessMessage(response.message || "Email verified. Sign in now.");
      setLoginForm((current) => ({ ...current, identifier: pendingEmail || current.identifier }));
      switchMode("login", { preserveFeedback: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Verification failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = forgotEmail.trim().toLowerCase();
    if (!emailPattern.test(email)) {
      setErrorMessage("Use a valid campus email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const response = await authApi.forgotPassword(email);
      setSuccessMessage(response.message);
      if (response.resetToken) {
        setDevResetToken(response.resetToken);
        setResetForm((current) => ({ ...current, token: response.resetToken }));
        switchMode("reset", { preserveFeedback: true });
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to request reset token."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetForm.token.trim()) {
      setErrorMessage("Reset token is required.");
      return;
    }

    if (getPasswordChecks(resetForm.password).some((check) => !check.pass)) {
      setErrorMessage("Password does not meet required strength.");
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const response = await authApi.resetPassword(resetForm.token.trim(), resetForm.password);
      setSuccessMessage(response.message || "Password reset successful. Please login.");
      setLoginForm((current) => ({
        ...current,
        identifier: forgotEmail || pendingEmail || current.identifier,
        password: ""
      }));
      switchMode("login", { preserveFeedback: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Password reset failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const submittingText = isSubmitting ? <LoaderCircle className="spin" size={16} /> : null;

  return (
    <main className="pro-auth-page">
      <div className="pro-auth-background">
        <motion.span className="pro-auth-orb pro-auth-orb--one" animate={{ y: [0, -26, 0], x: [0, 16, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.span className="pro-auth-orb pro-auth-orb--two" animate={{ y: [0, 20, 0], x: [0, -20, 0] }} transition={{ duration: 11.5, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <div className="pro-auth-shell">
        <motion.section className="pro-auth-aside" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
          <div className="pro-auth-brand">
            <div className="pro-auth-brand-mark"><Sparkles size={18} /></div>
            <div>
              <h1>Gigs Mtaani</h1>
              <p>Secure campus work, trusted payouts, live collaboration.</p>
            </div>
          </div>
          <div className="pro-auth-feature-list">
            <div className="pro-auth-feature-item"><ShieldCheck size={16} /><span>Production-grade auth with token rotation and lockout protection.</span></div>
            <div className="pro-auth-feature-item"><KeyRound size={16} /><span>End-to-end secure sessions with password policy enforcement.</span></div>
            <div className="pro-auth-feature-item"><ArrowRight size={16} /><span>Fast onboarding flow optimized for competition demos and judges.</span></div>
          </div>
        </motion.section>

        <motion.section className="pro-auth-form-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
          <div className="pro-auth-theme-row">
            <span>Theme</span>
            <label>
              <Sparkles size={14} />
              <select value={theme} onChange={(event) => setTheme(event.target.value as ThemeName)} aria-label="Theme selector">
                {THEME_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
              </select>
            </label>
          </div>

          <Card className="pro-auth-card">
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Sign in or create an account to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pro-auth-tab-row">
                <Button variant={mode === "login" ? "default" : "ghost"} size="sm" onClick={() => switchMode("login")}>Sign in</Button>
                <Button variant={mode === "register" ? "default" : "ghost"} size="sm" onClick={() => switchMode("register")}>Create account</Button>
              </div>

              {successMessage ? <p className="pro-auth-feedback is-success">{successMessage}</p> : null}
              {errorMessage ? <p className="pro-auth-feedback is-error">{errorMessage}</p> : null}

              <AnimatePresence mode="wait" initial={false}>
                {mode === "login" && (
                  <motion.form key="login" className="pro-auth-form" onSubmit={onLogin} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Field label="Campus email or phone" htmlFor="login-identifier">
                      <TextInput id="login-identifier" icon={<Mail size={16} />}>
                        <Input id="login-identifier" placeholder="name@campus.edu or +2547XXXXXXXX" value={loginForm.identifier} onChange={(event) => setLoginForm((current) => ({ ...current, identifier: event.target.value }))} autoComplete="username" />
                      </TextInput>
                    </Field>
                    <Field label="Password" htmlFor="login-password">
                      <TextInput id="login-password" icon={<Lock size={16} />}>
                        <Input id="login-password" type={showPassword.login ? "text" : "password"} placeholder="Enter your password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} autoComplete="current-password" />
                        <button type="button" className="pro-auth-icon-btn" onClick={() => setShowPassword((current) => ({ ...current, login: !current.login }))} aria-label={showPassword.login ? "Hide password" : "Show password"}>{showPassword.login ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </TextInput>
                    </Field>
                    <Field label="MFA code (optional)" htmlFor="login-mfa">
                      <TextInput id="login-mfa" icon={<KeyRound size={16} />}>
                        <Input id="login-mfa" placeholder="123456" value={loginForm.mfaCode} onChange={(event) => setLoginForm((current) => ({ ...current, mfaCode: event.target.value }))} inputMode="numeric" />
                      </TextInput>
                    </Field>
                    <label className="pro-auth-remember"><input type="checkbox" checked={loginForm.rememberMe} onChange={(event) => setLoginForm((current) => ({ ...current, rememberMe: event.target.checked }))} />Keep me signed in on this device</label>
                    <Button type="submit" disabled={isSubmitting}>{submittingText || "Sign in"}</Button>
                    <Button variant="ghost" onClick={() => switchMode("forgot")}>Forgot password?</Button>
                  </motion.form>
                )}

                {mode === "register" && (
                  <motion.form key="register" className="pro-auth-form" onSubmit={onRegister} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <div className="pro-auth-row two-col">
                      <Field label="Display name" htmlFor="register-name"><TextInput id="register-name" icon={<UserRound size={16} />}><Input id="register-name" placeholder="Your full name" value={registerForm.displayName} onChange={(event) => setRegisterForm((current) => ({ ...current, displayName: event.target.value }))} /></TextInput></Field>
                      <Field label="Campus ID" htmlFor="register-id"><TextInput id="register-id" icon={<BadgeCheck size={16} />}><Input id="register-id" placeholder="ADM/1234/26" value={registerForm.campusId} onChange={(event) => setRegisterForm((current) => ({ ...current, campusId: event.target.value }))} /></TextInput></Field>
                    </div>
                    <div className="pro-auth-row two-col">
                      <Field label="Campus email" htmlFor="register-email"><TextInput id="register-email" icon={<Mail size={16} />}><Input id="register-email" type="email" placeholder="name@campus.edu" value={registerForm.campusEmail} onChange={(event) => setRegisterForm((current) => ({ ...current, campusEmail: event.target.value }))} autoComplete="email" /></TextInput></Field>
                      <Field label="Phone number" htmlFor="register-phone"><TextInput id="register-phone" icon={<Phone size={16} />}><Input id="register-phone" placeholder="+2547XXXXXXXX" value={registerForm.phone} onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))} autoComplete="tel" /></TextInput></Field>
                    </div>
                    <Field label="Password" htmlFor="register-password">
                      <TextInput id="register-password" icon={<Lock size={16} />}>
                        <Input id="register-password" type={showPassword.register ? "text" : "password"} placeholder="Create a strong password" value={registerForm.password} onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))} autoComplete="new-password" />
                        <button type="button" className="pro-auth-icon-btn" onClick={() => setShowPassword((current) => ({ ...current, register: !current.register }))} aria-label={showPassword.register ? "Hide password" : "Show password"}>{showPassword.register ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </TextInput>
                    </Field>
                    <Field label="Confirm password" htmlFor="register-confirm"><TextInput id="register-confirm" icon={<ShieldCheck size={16} />}><Input id="register-confirm" type={showPassword.register ? "text" : "password"} placeholder="Confirm your password" value={registerForm.confirmPassword} onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))} autoComplete="new-password" /></TextInput></Field>
                    <PasswordChecklist value={registerForm.password} />
                    <Button type="submit" disabled={isSubmitting}>{submittingText || "Create account"}</Button>
                  </motion.form>
                )}

                {mode === "verify" && (
                  <motion.form key="verify" className="pro-auth-form" onSubmit={onVerify} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Field label="Verification token" htmlFor="verify-token"><TextInput id="verify-token" icon={<KeyRound size={16} />}><Input id="verify-token" placeholder="Paste token from verification email" value={verifyToken} onChange={(event) => setVerifyToken(event.target.value)} /></TextInput></Field>
                    {devVerificationToken ? <div className="pro-auth-dev-token"><span>Dev token:</span><code>{devVerificationToken}</code></div> : null}
                    <Button type="submit" disabled={isSubmitting}>{submittingText || "Verify email"}</Button>
                    <Button variant="ghost" onClick={() => switchMode("login")}>Back to sign in</Button>
                  </motion.form>
                )}

                {mode === "forgot" && (
                  <motion.form key="forgot" className="pro-auth-form" onSubmit={onForgot} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Field label="Campus email" htmlFor="forgot-email"><TextInput id="forgot-email" icon={<Mail size={16} />}><Input id="forgot-email" type="email" placeholder="name@campus.edu" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} autoComplete="email" /></TextInput></Field>
                    <Button type="submit" disabled={isSubmitting}>{submittingText || "Request reset token"}</Button>
                    <Button variant="ghost" onClick={() => switchMode("login")}>Back to sign in</Button>
                  </motion.form>
                )}

                {mode === "reset" && (
                  <motion.form key="reset" className="pro-auth-form" onSubmit={onReset} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Field label="Reset token" htmlFor="reset-token"><TextInput id="reset-token" icon={<KeyRound size={16} />}><Input id="reset-token" placeholder="Paste token from reset email" value={resetForm.token} onChange={(event) => setResetForm((current) => ({ ...current, token: event.target.value }))} /></TextInput></Field>
                    <Field label="New password" htmlFor="reset-password">
                      <TextInput id="reset-password" icon={<Lock size={16} />}>
                        <Input id="reset-password" type={showPassword.reset ? "text" : "password"} placeholder="Create a new password" value={resetForm.password} onChange={(event) => setResetForm((current) => ({ ...current, password: event.target.value }))} autoComplete="new-password" />
                        <button type="button" className="pro-auth-icon-btn" onClick={() => setShowPassword((current) => ({ ...current, reset: !current.reset }))} aria-label={showPassword.reset ? "Hide password" : "Show password"}>{showPassword.reset ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </TextInput>
                    </Field>
                    <Field label="Confirm new password" htmlFor="reset-confirm"><TextInput id="reset-confirm" icon={<ShieldCheck size={16} />}><Input id="reset-confirm" type={showPassword.reset ? "text" : "password"} placeholder="Repeat password" value={resetForm.confirmPassword} onChange={(event) => setResetForm((current) => ({ ...current, confirmPassword: event.target.value }))} autoComplete="new-password" /></TextInput></Field>
                    <PasswordChecklist value={resetForm.password} />
                    {devResetToken ? <div className="pro-auth-dev-token"><span>Dev token:</span><code>{devResetToken}</code></div> : null}
                    <Button type="submit" disabled={isSubmitting}>{submittingText || "Reset password"}</Button>
                    <Button variant="ghost" onClick={() => switchMode("login")}>Back to sign in</Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter>
              <p className="pro-auth-footer-text">By continuing, you agree to secure use and activity monitoring for account protection.</p>
            </CardFooter>
          </Card>
        </motion.section>
      </div>
    </main>
  );
}
