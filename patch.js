const fs = require('fs');
const path = require('path');

const target = 'd:/ReactJS PRO-jects/DrDesignProject/MyQuoteText/client/src/pages/CheckQuote.jsx';
let content = fs.readFileSync(target, 'utf8');

const regex = /      \/\/ Manual Verification \(Strict Mode\)\n      \/\/ We MUST verify credits exist before proceeding, otherwise backend will reject with "Limit Reached"\n      if \(paymentIntent\?\.id\) \{\n        try \{\n          const verifyRes = await paymentApi\.verifyPayment\(paymentIntent\.id\);\n\n          if \(verifyRes\.data\?\.success && verifyRes\.data\?\.data\) \{\n            const stats = verifyRes\.data\.data;\n            confirmedCredits = stats\.credits;\n            console\.log\('Payment verified, fresh credits:', confirmedCredits\);/;

const replacement = `      // Manual Verification (Strict Mode)
      // We MUST verify credits exist before proceeding, otherwise backend will reject with "Limit Reached"
      if (paymentIntent?.id) {
        if (paymentIntent.id === 'free_redemption') {
          confirmedCredits = paymentIntent.credits || 1;
          console.log('Free redemption confirmed, fresh credits:', confirmedCredits);
        } else {
        try {
          const verifyRes = await paymentApi.verifyPayment(paymentIntent.id);

          if (verifyRes.data?.success && verifyRes.data?.data) {
            const stats = verifyRes.data.data;
            confirmedCredits = stats.credits;
            console.log('Payment verified, fresh credits:', confirmedCredits);`;

content = content.replace(regex, replacement);

const regexClose = /          \/\/ If verification fails, WE STOP\. Do not proceed to analysis\.\n          \/\/ This prevents the confusing "Monthly Limit Reached" error\.\n          toast\.dismiss\(loadingToast\);\n          toast\.error\(`Verification failed: \$\{e\.message \|\| 'Could not confirm credits'\}\. Please refresh\/contact support\.`\);\n          setTemporaryTier\(null\);\n          return; \/\/ EXIT FUNCTION\n        \}\n      \} else \{/;

const replacementClose = `          // If verification fails, WE STOP. Do not proceed to analysis.
          // This prevents the confusing "Monthly Limit Reached" error.
          toast.dismiss(loadingToast);
          toast.error(\`Verification failed: \${e.message || 'Could not confirm credits'}. Please refresh/contact support.\`);
          setTemporaryTier(null);
          return; // EXIT FUNCTION
        }
        }
      } else {`;
      
content = content.replace(regexClose, replacementClose);

fs.writeFileSync(target, content, 'utf8');
console.log('Successfully patched CheckQuote.jsx');
