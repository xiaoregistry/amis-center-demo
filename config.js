/* =========================================================
   EMAIL SETTINGS (EmailJS – free plan: 200 emails / month)
   Leave these empty and the form runs in demo mode (nothing is sent).
   Setup steps are in README.md and the email-templates folder.
   These keys are meant to be public; protect them by adding your
   GitHub Pages address under EmailJS → Account → Security → Allowed origins.
   ========================================================= */
window.AMIS_CONFIG = {
  emailjs: {
    publicKey: "",          // Account → General → Public Key
    serviceId: "",          // Email Services → your Gmail service ID
    templateSchool: "",     // template that emails the school
    templateStudent: ""     // confirmation email to the student (optional)
  },

  /* Level test times. Days: 1 = Monday … 6 = Saturday (0 = Sunday). */
  levelTest: {
    daysAhead: 6,           // how many upcoming test days to show
    times: {
      1: ["09:00", "14:00", "17:30"],
      2: ["09:00", "14:00", "17:30"],
      3: ["09:00", "14:00", "17:30"],
      4: ["09:00", "14:00", "17:30"],
      5: ["09:00", "14:00", "17:30"],
      6: ["09:00", "14:00"]
    }
  }
};
