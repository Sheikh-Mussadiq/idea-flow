import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, RefreshCw, CheckCircle, ExternalLink } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";

const EmailConfirmation = ({ 
  email, 
  onResend, 
  onBack,
  loading = false,
  success = null 
}) => {
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Countdown timer for resend
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleResend = async () => {
    if (canResend) {
      setCanResend(false);
      setResendTimer(60);
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
          className="w-20 h-20 bg-primary-orange/10 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Mail className="w-10 h-10 text-primary-orange" />
        </motion.div>
        <h2 className="text-2xl font-bold text-primary-black mb-2">
          Check Your Email
        </h2>
        <p className="text-sm text-primary-grey mb-4">
          We've sent a confirmation link to
          <br />
          <span className="font-medium text-primary-black">{email}</span>
        </p>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-grey-fill rounded-lg p-4 mb-6"
      >
        <h3 className="font-semibold text-primary-black mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-orange" />
          Next Steps:
        </h3>
        <ol className="space-y-2 text-sm text-primary-grey">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-primary-orange text-white rounded-full flex items-center justify-center text-xs font-semibold">
              1
            </span>
            <span>Open your email inbox</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-primary-orange text-white rounded-full flex items-center justify-center text-xs font-semibold">
              2
            </span>
            <span>Find the email from Certie</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-primary-orange text-white rounded-full flex items-center justify-center text-xs font-semibold">
              3
            </span>
            <span>Click the confirmation link</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-primary-orange text-white rounded-full flex items-center justify-center text-xs font-semibold">
              4
            </span>
            <span>You'll be automatically signed in</span>
          </li>
        </ol>
      </motion.div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start p-3 rounded-lg bg-green-50 text-green-600 text-sm mb-4"
        >
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* Open Email Button */}
      <motion.button
        onClick={() => window.open(`https://mail.google.com`, '_blank')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white bg-primary-black hover:bg-primary-black/90 transition duration-150 ease-in-out mb-4"
      >
        <ExternalLink className="w-4 h-4" />
        <span>Open Email</span>
      </motion.button>

      {/* Resend Email */}
      <div className="text-center">
        <p className="text-sm text-primary-grey mb-2">
          Didn't receive the email?
        </p>
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-orange hover:text-primary-black transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Resend Email
              </>
            )}
          </button>
        ) : (
          <p className="text-sm text-primary-grey">
            Resend email in{" "}
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
        className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg"
      >
        <p className="text-xs text-blue-800 text-center">
          💡 <strong>Can't find the email?</strong> Check your spam or junk folder. 
          The link expires in 24 hours.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default EmailConfirmation;
