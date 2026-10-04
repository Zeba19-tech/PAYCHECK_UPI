const crypto = require("crypto");

function isEnabled(value) {
  return String(value || "false").toLowerCase() === "true";
}

function unavailable(status = "NOT_CONFIGURED", message = "Live VPA verification is not configured on this server.") {
  return {
    available: false,
    verified: false,
    status,
    provider: "None",
    accountName: "",
    vpa: "",
    message
  };
}

async function verifyWithPayU(vpa) {
  const key = process.env.PAYU_MERCHANT_KEY;
  const secret = process.env.PAYU_MERCHANT_SECRET;

  if (!key || !secret) {
    return unavailable();
  }

  const date = new Date().toUTCString();
  const bodyData = "";
  const hash = crypto
    .createHash("sha512")
    .update(`${bodyData}|${date}|${secret}`)
    .digest("hex");

  const authorization = `hmac username="${key}", algorithm="sha512", headers="date", signature="${hash}"`;
  const endpoint = process.env.PAYU_VPA_VERIFY_URL || "https://info.payu.in/payment-mode/v1/upi/vpa";
  const url = new URL(endpoint);
  url.searchParams.set("isAutoVPAValid", "true");
  url.searchParams.set("vpa", vpa);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        date,
        authorization
      },
      signal: AbortSignal.timeout(12000)
    });

    const payload = await response.json().catch(() => ({}));
    const result = payload?.result || {};

    // HTTP success does not mean the VPA is valid. PayU exposes the
    // authoritative VPA state in result.isValidVpa.
    const verified = result.isValidVpa === true;

    return {
      available: response.ok,
      verified,
      status: verified ? "VERIFIED" : "NOT_VERIFIED",
      provider: "PayU VPA Verification",
      accountName: result.payerAccountName || "",
      vpa: result.vpa || vpa,
      autoPayValid: result.isAutoPayVPAValid,
      rawStatus: payload?.status,
      message: verified
        ? "The VPA was validated by the configured verification provider."
        : "The configured verification provider did not validate this VPA."
    };
  } catch (error) {
    return unavailable(
      "UNAVAILABLE",
      "The live verification provider could not be reached right now."
    );
  }
}

let cashfreeToken = "";
let cashfreeTokenExpiry = 0;

async function getCashfreeToken() {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (cashfreeToken && Date.now() < cashfreeTokenExpiry) {
    return cashfreeToken;
  }

  const base = process.env.CASHFREE_BASE_URL || "https://payout-api.cashfree.com";

  const response = await fetch(`${base}/payout/v1/authorize`, {
    method: "POST",
    headers: {
      "X-Client-Id": clientId,
      "X-Client-Secret": clientSecret,
      "Content-Type": "application/json"
    },
    signal: AbortSignal.timeout(12000)
  });

  const payload = await response.json().catch(() => ({}));
  const token = payload?.data?.token;

  if (!response.ok || !token) return null;

  cashfreeToken = token;
  const expirySeconds = Number(payload?.data?.expiry || 0);
  cashfreeTokenExpiry = expirySeconds > 0
    ? expirySeconds * 1000 - 30_000
    : Date.now() + 8 * 60_000;

  return cashfreeToken;
}

async function verifyWithCashfree(vpa) {
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
    return unavailable();
  }

  try {
    const token = await getCashfreeToken();
    if (!token) {
      return unavailable("AUTH_FAILED", "Cashfree live verification authentication failed.");
    }

    const base = process.env.CASHFREE_BASE_URL || "https://payout-api.cashfree.com";
    const transferId = `PCU_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    const response = await fetch(`${base}/payout/v1.2/validatePayout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transferId, vpa }),
      signal: AbortSignal.timeout(12000)
    });

    const payload = await response.json().catch(() => ({}));
    const data = payload?.data || {};
    const verified = payload?.status === "SUCCESS" && data?.accountStatus === "VALID";

    return {
      available: response.ok,
      verified,
      status: verified ? "VERIFIED" : "NOT_VERIFIED",
      provider: "Cashfree VPA Verification",
      accountName: data?.nameAtBank || "",
      vpa: data?.vpa || vpa,
      message: verified
        ? "The VPA was validated by the configured verification provider."
        : payload?.message || "The configured verification provider did not validate this VPA."
    };
  } catch (error) {
    return unavailable(
      "UNAVAILABLE",
      "The Cashfree live verification provider could not be reached right now."
    );
  }
}

async function verifyVpaLive(vpa) {
  const enabled = isEnabled(process.env.UPI_LIVE_VERIFICATION);
  const provider = String(process.env.VPA_PROVIDER || "payu").toLowerCase();

  if (!enabled) {
    return unavailable();
  }

  if (provider === "cashfree") {
    return verifyWithCashfree(vpa);
  }

  if (provider === "payu") {
    return verifyWithPayU(vpa);
  }

  return unavailable(
    "UNKNOWN_PROVIDER",
    `Unsupported VPA verification provider: ${provider}.`
  );
}

function getVerificationConfig() {
  const enabled = isEnabled(process.env.UPI_LIVE_VERIFICATION);
  const provider = String(process.env.VPA_PROVIDER || "payu").toLowerCase();

  const credentialsPresent = provider === "cashfree"
    ? Boolean(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET)
    : Boolean(process.env.PAYU_MERCHANT_KEY && process.env.PAYU_MERCHANT_SECRET);

  return {
    enabled,
    provider: enabled ? provider : "none",
    configured: enabled && credentialsPresent
  };
}

module.exports = { verifyVpaLive, getVerificationConfig };
