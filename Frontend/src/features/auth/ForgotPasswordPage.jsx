import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { apiPost } from "../../utils/api.js";
import { Loader2, KeyRound, Mail, ShieldCheck, ChevronRight } from "lucide-react";

const ForgotPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    resetToken: "",
    passwordResetGrant: "",
    newPassword: "",
    confirmPassword: "",
  });

  const title = useMemo(() => {
    if (step === 1) return "Request Reset";
    if (step === 2) return "Verify Code";
    return "Create Password";
  }, [step]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await apiPost("/api/auth/forgot-password", {
        email: form.email,
      });

      setForm((current) => ({
        ...current,
        email: response.email || current.email,
        resetToken: response.resetToken || "",
      }));
      setMessage(response.message);
      if (response.resetRequired) {
        setStep(2);
      }
    } catch (err) {
      setError(err.message || "Unable to start password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await apiPost("/api/auth/forgot-password/verify-otp", {
        email: form.email,
        otp: form.otp,
        resetToken: form.resetToken,
      });

      setForm((current) => ({
        ...current,
        passwordResetGrant: response.passwordResetGrant,
      }));
      setMessage(response.message);
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await apiPost("/api/auth/reset-password", {
        email: form.email,
        resetToken: form.resetToken,
        passwordResetGrant: form.passwordResetGrant,
        newPassword: form.newPassword,
      });

      setMessage(response.message);
      setTimeout(() => navigate("/auth/login", { replace: true }), 1200);
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <form onSubmit={handleRequestReset} className="space-y-5">
          <Field label="Account Email" icon={Mail}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="auth-input"
              placeholder="operator@email.com"
              autoComplete="email"
              required
            />
          </Field>
          <PrimaryButton loading={loading} label="Send Reset Code" />
        </form>
      );
    }

    if (step === 2) {
      return (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <Field label="6-Digit OTP" icon={ShieldCheck}>
            <input
              type="text"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              className="auth-input"
              placeholder="123456"
              required
            />
          </Field>
          <PrimaryButton loading={loading} label="Verify Reset Code" />
        </form>
      );
    }

    return (
      <form onSubmit={handleResetPassword} className="space-y-5">
        <Field label="New Password" icon={KeyRound}>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="auth-input"
            placeholder="New secure password"
            autoComplete="new-password"
            required
          />
        </Field>
        <Field label="Confirm Password" icon={KeyRound}>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="auth-input"
            placeholder="Repeat password"
            autoComplete="new-password"
            required
          />
        </Field>
        <PrimaryButton loading={loading} label="Reset Password" />
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-[#020305] text-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border border-white/10 bg-[#08090B] p-8 md:p-12 shadow-2xl">
        <div className="mb-8 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">
            Account Recovery
          </p>
          <h1 className="text-3xl font-black uppercase italic tracking-tight text-white">
            {title}
          </h1>
          <p className="max-w-xl text-sm text-slate-400">
            Recover access in three steps: request the email OTP, verify the code,
            then set a new password.
          </p>
        </div>

        <div className="mb-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">
          <span className={step >= 1 ? "text-orange-500" : ""}>Request</span>
          <span>/</span>
          <span className={step >= 2 ? "text-orange-500" : ""}>Verify</span>
          <span>/</span>
          <span className={step >= 3 ? "text-orange-500" : ""}>Reset</span>
        </div>

        {error ? (
          <div className="mb-5 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-5 border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
            {message}
          </div>
        ) : null}

        {renderStep()}

        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
          <Link
            to="/auth/login"
            className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 transition-colors hover:text-orange-500"
          >
            Back To Login
          </Link>
          {step === 2 ? (
            <button
              type="button"
              onClick={handleRequestReset}
              className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500 transition-colors hover:text-white"
            >
              Resend Code
            </button>
          ) : null}
        </div>
      </div>

      <style>{`
        .auth-input {
          width: 100%;
          background: #0c0e12;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1rem 1rem 1rem 3.25rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .auth-input:focus {
          border-color: rgba(234, 88, 12, 0.4);
          background: #11141a;
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, icon: Icon, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
        <Icon size={16} />
      </div>
      {children}
    </div>
  </div>
);

const PrimaryButton = ({ loading, label }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-orange-600 hover:text-white flex items-center justify-center gap-4 disabled:opacity-50"
  >
    {loading ? <Loader2 size={16} className="animate-spin" /> : label}
    {!loading ? <ChevronRight size={16} /> : null}
  </button>
);

export default ForgotPasswordPage;
