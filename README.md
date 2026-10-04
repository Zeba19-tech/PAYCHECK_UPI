# PayCheck UPI — SecureSix

**Think Before You Click. Verify Before You Pay.**

PayCheck UPI is an SIH 2026-ready preventive digital-payment safety platform. It helps users assess suspicious UPI IDs, links, messages and payment screenshots before taking action.

## Included modules

- UPI ID risk checker
- Suspicious link scanner
- Scam message analyzer
- Screenshot scanner with OCR
- Explainable 0–100 risk scoring
- Scam reporting flow
- AI safety assistant / chatbot (local rule-based safety knowledge base)
- Learn / awareness section
- English / Hindi / Telugu UI
- Help and emergency guidance
- Feedback and contact forms
- MongoDB-ready data models
- Responsive SIH-style UI

## Project structure

```text
PAYCHECK_UPI_COMPLETE/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 1. Backend

```powershell
cd backend
npm install
copy .env.example .env
node server.js
```

Backend runs on `http://localhost:5000`.

If MongoDB is available, put its connection string in `.env`. The application can still start when MongoDB is unavailable; Mongo-backed history/report persistence will simply be unavailable.

## 2. Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite normally starts on port 5173.

## 3. Screenshot OCR

The screenshot analyzer uses Tesseract.js. The first OCR request can take longer because OCR language data may need to initialize.

Upload PNG/JPG/JPEG/WEBP images up to 5 MB.

If OCR cannot read useful text, the result is **Unable to Assess** rather than falsely calling the screenshot safe.

## Important safety note

PayCheck UPI is a risk-assessment and awareness prototype. A LOW result does not prove that a UPI ID, link, message or screenshot is safe. Users should independently verify important payment requests.

For an actual cyber financial fraud in India, report immediately through the National Cyber Crime Helpline **1930** and the National Cyber Crime Reporting Portal.


## Important safety scope
The UPI checker performs format and suspicious-pattern analysis. A LOW result is not proof that a UPI ID belongs to a trustworthy person or business, and an unfamiliar provider handle is not treated as a scam signal by itself. The chatbot is a local intent-based safety assistant in this prototype; an external LLM/API is not required for the included responses.


## Live UPI/VPA verification
The project supports an optional PayU Validate VPA integration. Add authorized PayU credentials to backend/.env and set PAYU_VPA_VERIFY=true. If credentials are not configured, PayCheck UPI intentionally reports live verification as unavailable rather than fabricating a verified result.

## Real UPI / VPA verification setup

PayCheck UPI separates **live VPA verification** from local suspicious-pattern analysis. A normal-looking UPI ID is never presented as verified unless an authorized verification provider actually confirms it.

### Provider option A: PayU
PayU documents a Validate VPA API that can return VPA validity and the beneficiary name supplied by the bank/provider.

Set these values in `backend/.env` after obtaining authorized credentials:

```env
UPI_LIVE_VERIFICATION=true
VPA_PROVIDER=payu
PAYU_MERCHANT_KEY=YOUR_KEY
PAYU_MERCHANT_SECRET=YOUR_SECRET
PAYU_VPA_VERIFY_URL=https://info.payu.in/payment-mode/v1/upi/vpa
```

### Provider option B: Cashfree
Cashfree Payouts documents a Validate Payout API that validates a VPA and can return `nameAtBank`. It requires Payouts credentials and an authorization token.

```env
UPI_LIVE_VERIFICATION=true
VPA_PROVIDER=cashfree
CASHFREE_CLIENT_ID=YOUR_CLIENT_ID
CASHFREE_CLIENT_SECRET=YOUR_CLIENT_SECRET
CASHFREE_BASE_URL=https://payout-api.cashfree.com
```

For a sandbox environment use the provider's documented sandbox base URL and test credentials.

**Never commit `backend/.env` or provider secrets to GitHub.** The React frontend must never receive these credentials.

### Important product behavior
- `VERIFIED` means the configured provider resolved the VPA.
- `NOT_VERIFIED` means the configured provider did not validate it.
- `UNKNOWN / UNAVAILABLE` means PayCheck UPI could not perform live verification, so it falls back to transparent local pattern analysis.
- Verification does **not** prove the recipient is trustworthy or that the payment purpose is legitimate.
