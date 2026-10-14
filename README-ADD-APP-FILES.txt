VOICEEXPENSES VERSION 4 — MISSING APPLICATION FILES

Add these files to your existing GitHub repository:
- index.html (repository root)
- src/main.jsx
- src/App.jsx
- src/styles.css
- src/supabase.js

Your repository already has deployment configuration files. Keep the existing
package.json, tailwind.config.ts, postcss.config.js, vite.config.js and
vercel.json. This app uses regular CSS; Tailwind is not required for these files.

ANDROID / GITHUB STEPS
1. Download and extract this ZIP on your phone.
2. Open https://github.com/Impactorsaheed2/Expenses-
3. Use Add file → Create new file.
4. Create index.html at the repository root. Paste the matching file contents.
5. Create each file using its exact path, e.g. src/main.jsx. GitHub usually
   creates the src folder when you type src/main.jsx as the filename.
6. Commit each file to main.
7. Repeat for all five files listed above.

VERCEL ENVIRONMENT VARIABLES
VITE_SUPABASE_URL = https://rxnygamlisrbmdmttwdv.supabase.co
VITE_SUPABASE_ANON_KEY = your Supabase publishable/anon public key

Never use a service_role/secret key in browser code. Add the variables in Vercel
Project Settings → Environment Variables and redeploy.

This starter UI uses the existing public.expenses table. It expects fields
including description, amount, category, property_name, expense_date,
payment_method, payment_status, notes, user_id, voided_at and void_reason.
Keep Row Level Security enabled and confirm policies restrict users to their own
records. Test with two accounts before entering real business information.

Voice input relies on browser speech recognition and microphone permission.
It fills the form for review; the user must press Save Expense to save it.
This starter does not yet include receipt uploads, budgets, recurring reminders,
CSV statement reconciliation, or advanced analytics.
