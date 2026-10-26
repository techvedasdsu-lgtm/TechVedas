import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, UserRound, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type AccountType = "admin" | "user";

interface LoginDialogProps {
  message: string;
  onClose: () => void;
}

export default function LoginDialog({ message, onClose }: LoginDialogProps) {
  const { user, role, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // If already logged in
  useEffect(() => {
    if (user && !loading && !success) {
      setSuccess(`Signed in as ${user.displayName || user.email}`);
      const timer = setTimeout(() => {
        onClose();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user, loading, success, onClose]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccess("Successfully connected with Google!");
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      if (!errMessage.includes("popup-closed-by-user")) {
        setError(errMessage.replace("Firebase: ", ""));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name || email.split("@")[0]);
        setSuccess("Account created successfully!");
      } else {
        await signInWithEmail(email, password);
        setSuccess("Signed in successfully!");
      }
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Authentication failed";
      if (errMessage.includes("auth/operation-not-allowed")) {
        setError("Email/Password provider is not enabled in Firebase Console. Please use 'Continue with Google' above, or enable Email/Password in Firebase Authentication settings.");
      } else if (errMessage.includes("auth/invalid-credential") || errMessage.includes("auth/wrong-password") || errMessage.includes("auth/user-not-found")) {
        setError("Invalid email or password. If you don't have an account yet, click 'Create account' below or use Google Sign-In.");
      } else if (errMessage.includes("auth/email-already-in-use")) {
        setError("An account already exists with this email. Please sign in instead.");
      } else if (errMessage.includes("auth/weak-password")) {
        setError("Password should be at least 6 characters.");
      } else {
        setError(errMessage.replace("Firebase: ", ""));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-espresso/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/25 bg-[#0B1320]/95 p-6 text-cream shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-terracotta/80 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute right-4 top-4 rounded-full p-2 text-beige/70 transition-colors hover:bg-terracotta/10 hover:text-terracotta"
        >
          <X size={19} />
        </button>

        {accountType && (
          <button
            type="button"
            onClick={() => {
              setAccountType(null);
              setError(null);
            }}
            className="mb-5 inline-flex items-center gap-2 text-sm text-beige/75 transition-colors hover:text-terracotta"
          >
            <ArrowLeft size={15} /> Choose account type
          </button>
        )}

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
          TechVedas access
        </p>
        <h2 id="login-title" className="mt-2 font-display text-3xl">
          {success
            ? "Welcome!"
            : accountType
              ? `${accountType === "admin" ? "Admin" : isSignUp ? "Create account" : "Member"} login`
              : "Welcome back"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-beige/75">
          {success || message}
        </p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="my-8 flex flex-col items-center justify-center gap-3 text-center"
          >
            <CheckCircle2 size={48} className="text-sage" />
            <p className="text-lg font-medium text-cream">{success}</p>
            {role === "admin" && (
              <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold border border-gold/40">
                Administrator Privileges Active
              </span>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {!accountType ? (
              <motion.div
                key="account-types"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-7 grid gap-3 sm:grid-cols-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setAccountType("admin");
                    setError(null);
                  }}
                  className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-beige/20 bg-brown/30 p-4 text-left transition-colors hover:border-terracotta hover:bg-terracotta/10"
                >
                  <ShieldCheck className="text-terracotta" size={22} />
                  <div>
                    <span className="font-semibold block">Admin</span>
                    <span className="text-xs text-beige/60">Club organizers</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountType("user");
                    setError(null);
                  }}
                  className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-beige/20 bg-brown/30 p-4 text-left transition-colors hover:border-terracotta hover:bg-terracotta/10"
                >
                  <UserRound className="text-terracotta" size={22} />
                  <div>
                    <span className="font-semibold block">Member / Student</span>
                    <span className="text-xs text-beige/60">Event participants</span>
                  </div>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleEmailSubmit}
                className="mt-6 space-y-4"
              >
                {/* Google Sign-in available for both Admin and Member */}
                <div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleSignIn}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-gold/40 bg-brown/40 px-5 py-3 font-semibold text-cream transition-all hover:border-gold hover:bg-gold/10 disabled:opacity-50"
                  >
                    <GoogleIcon />
                    {accountType === "admin"
                      ? "Continue with Google (techvedas.dsu@gmail.com)"
                      : "Continue with Google"}
                  </button>
                  {accountType === "admin" && (
                    <p className="mt-2 text-[11px] text-center text-gold/80">
                      Signing in with techvedas.dsu@gmail.com instantly grants administrator access.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 py-1 text-xs text-beige/50">
                  <span className="h-px flex-1 bg-beige/15" />
                  or continue with email
                  <span className="h-px flex-1 bg-beige/15" />
                </div>

                {isSignUp && (
                  <label className="block text-sm font-medium text-beige/90">
                    Full Name
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-beige/25 bg-transparent px-4 py-2.5 text-cream placeholder:text-beige/40 outline-none transition-colors focus:border-gold"
                      placeholder="Your full name"
                    />
                  </label>
                )}

                <label className="block text-sm font-medium text-beige/90">
                  Email
                  <input
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-beige/25 bg-transparent px-4 py-2.5 text-cream placeholder:text-beige/40 outline-none transition-colors focus:border-gold"
                    placeholder={accountType === "admin" ? "techvedas.dsu@gmail.com" : "you@example.com"}
                  />
                </label>

                <label className="block text-sm font-medium text-beige/90">
                  Password
                  <input
                    type="password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-beige/25 bg-transparent px-4 py-2.5 text-cream placeholder:text-beige/40 outline-none transition-colors focus:border-gold"
                    placeholder="Enter your password"
                  />
                </label>

                {error && (
                  <div className="rounded-lg border border-terracotta/40 bg-terracotta/10 p-3 text-xs leading-relaxed text-terracotta">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3 font-semibold text-cream transition-colors hover:bg-[#ff8176] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <span>
                      {isSignUp
                        ? "Create Account"
                        : `Sign in as ${accountType === "admin" ? "Admin" : "Member"}`}
                    </span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="text-xs text-beige/70 hover:text-gold transition-colors underline"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        )}
      </motion.section>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.93c4.47-4.13 7.12-10.2 7.12-17.58Z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.87l-7.65-5.93c-2.13 1.43-4.85 2.27-8.25 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}
