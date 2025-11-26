import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";

const OTPVerification = ({ 
  email, 
  onVerify, 
  onResend, 
  onBack,
  loading = false,
  error = null,
  success = null 
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const pastedOtp = text.replace(/\D/g, "").slice(0, 6).split("");
        const newOtp = [...otp];
        pastedOtp.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        if (pastedOtp.length === 6) {
          handleVerify(newOtp.join(""));
        }
      });
    }
  };

  const handleVerify = (otpCode = otp.join("")) => {
    if (otpCode.length === 6) {
      onVerify(otpCode);
    }
  };

  const handleResend = async () => {
    if (canResend) {
      setCanResend(false);
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      await onResend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-primary-grey hover:text-primary-black transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to signup
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 bg-primary-orange/10 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Mail className="w-8 h-8 text-primary-orange" />
        </motion.div>
        <h2 className="text-2xl font-bold text-primary-black mb-2">
          Verify Your Email
        </h2>
        <p className="text-sm text-primary-grey">
          We've sent a 6-digit code to
          <br />
          <span className="font-medium text-primary-black">{email}</span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-2 mb-6">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none transition-all ${
              digit
                ? "border-primary-orange bg-primary-orange/5"
                : "border-grey-outline bg-white"
            } focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-4"
          >
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start p-3 rounded-lg bg-green-50 text-green-600 text-sm mb-4"
          >
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify Button */}
      <motion.button
        onClick={() => handleVerify()}
        disabled={loading || otp.some((digit) => !digit)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white transition duration-150 ease-in-out mb-4 ${
          loading || otp.some((digit) => !digit)
            ? "bg-primary-grey cursor-not-allowed"
            : "bg-primary-black hover:bg-primary-black/90"
        }`}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner />
            <span>Verifying...</span>
          </div>
        ) : (
          <span>Verify Email</span>
        )}
      </motion.button>

      {/* Resend Code */}
      <div className="text-center">
        <p className="text-sm text-primary-grey mb-2">
          Didn't receive the code?
        </p>
        {canResend ? (
          <button
            onClick={handleResend}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-orange hover:text-primary-black transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Resend Code
          </button>
        ) : (
          <p className="text-sm text-primary-grey">
            Resend code in{" "}
            <span className="font-medium text-primary-black">
              {resendTimer}s
            </span>
          </p>
        )}
      </div>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-grey-fill rounded-lg"
      >
        <p className="text-xs text-primary-grey text-center">
          💡 Check your spam folder if you don't see the email. The code expires
          in 10 minutes.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default OTPVerification;
