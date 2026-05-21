import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Leaf, MailCheck, RefreshCw } from "lucide-react";

import {
  checkEmailVerification,
  resendVerificationEmail,
} from "../services/authService";

function VerifyEmail() {
  const navigate = useNavigate();

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCheckVerification() {
    setMessage("");
    setErrorMessage("");

    try {
      setIsChecking(true);

      const isVerified = await checkEmailVerification();

      if (!isVerified) {
        setErrorMessage(
          "Your email is not verified yet. Please click the verification link in your email first."
        );
        return;
      }

      setMessage("Email verified successfully.");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to check email verification.");
    } finally {
      setIsChecking(false);
    }
  }

  async function handleResendEmail() {
    setMessage("");
    setErrorMessage("");

    try {
      setIsResending(true);

      await resendVerificationEmail();

      setMessage("Verification email has been sent again. Please check your inbox.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
          <MailCheck size={34} />
        </div>

        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Leaf size={16} />
            EcoCampus Verification
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-800">
          Verify Your Email
        </h1>

        <p className="mt-3 leading-7 text-slate-500">
          Firebase has sent a verification link to your email. Open your inbox,
          click the verification link, then return here and check verification.
        </p>

        {message && (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleCheckVerification}
            disabled={isChecking}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <CheckCircle2 size={18} />
            {isChecking ? "Checking..." : "I Have Verified My Email"}
          </button>

          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isResending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <RefreshCw size={18} />
            {isResending ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>

        <p className="mt-5 text-sm text-slate-500">
          Already verified?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Go to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;