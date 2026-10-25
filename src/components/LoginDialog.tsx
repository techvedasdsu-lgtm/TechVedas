import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, UserRound, X } from "lucide-react";

type AccountType = "admin" | "user";

interface LoginDialogProps {
  message: string;
  onClose: () => void;
}

export default function LoginDialog({ message, onClose }: LoginDialogProps) {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [googleAttempted, setGoogleAttempted] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

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
              setSubmitted(false);
              setGoogleAttempted(false);
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
          {accountType ? `${accountType === "admin" ? "Admin" : "User"} login` : "Welcome back"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-beige/75">{message}</p>

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
                onClick={() => setAccountType("admin")}
                className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-beige/20 bg-brown/30 p-4 text-left transition-colors hover:border-terracotta hover:bg-terracotta/10"
              >
                <ShieldCheck className="text-terracotta" size={22} />
                <span className="font-semibold">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType("user")}
                className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-beige/20 bg-brown/30 p-4 text-left transition-colors hover:border-terracotta hover:bg-terracotta/10"
              >
                <UserRound className="text-terracotta" size={22} />
                <span className="font-semibold">User</span>
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
                setGoogleAttempted(false);
              }}
              className="mt-6 space-y-4"
            >
              <label className="block text-sm font-medium text-beige/90">
                Email
                <input
                  type="email"
                  autoComplete="username"
                  required
                  className="mt-2 w-full rounded-lg border border-beige/25 bg-transparent px-4 py-3 text-cream placeholder:text-beige/40 outline-none transition-colors focus:border-gold"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-sm font-medium text-beige/90">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-2 w-full rounded-lg border border-beige/25 bg-transparent px-4 py-3 text-cream placeholder:text-beige/40 outline-none transition-colors focus:border-gold"
                  placeholder="Enter your password"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-full bg-terracotta px-5 py-3 font-semibold text-cream transition-colors hover:bg-[#ff8176]"
              >
                Sign in as {accountType}
              </button>
              {accountType === "user" && (
                <>
                  <div className="flex items-center gap-3 py-1 text-xs text-beige/50">
                    <span className="h-px flex-1 bg-beige/15" />
                    or
                    <span className="h-px flex-1 bg-beige/15" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(true);
                      setGoogleAttempted(true);
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-beige/25 bg-brown/30 px-5 py-3 font-semibold text-cream transition-colors hover:border-terracotta/70 hover:bg-terracotta/10"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                </>
              )}
              <p
                role={submitted ? "alert" : undefined}
                className={`text-xs leading-relaxed ${submitted ? "text-terracotta" : "text-beige/60"}`}
              >
                {submitted && googleAttempted
                  ? "Google sign-in is not connected yet. No account was authenticated, and event access remains locked."
                  : submitted
                    ? "Sign-in is not connected yet. No account was authenticated, and event access remains locked."
                    : "Authentication is not connected yet. Submitting this form will not sign you in."}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.93c4.47-4.13 7.12-10.2 7.12-17.58Z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.87l-7.65-5.93c-2.13 1.43-4.85 2.27-8.25 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}
