const sharp = require("sharp");
const jsQR = require("jsqr");

function parseUpiQrData(data = "") {
  const normalized = data.trim();

  if (!normalized.toLowerCase().startsWith("upi://pay")) {
    return {
      isUpiQr: false,
      upiId: "",
      payeeName: "",
      amount: "",
      currency: "",
      note: ""
    };
  }

  try {
    const url = new URL(normalized);

    return {
      isUpiQr: true,
      upiId: url.searchParams.get("pa") || "",
      payeeName: url.searchParams.get("pn") || "",
      amount: url.searchParams.get("am") || "",
      currency: url.searchParams.get("cu") || "",
      note: url.searchParams.get("tn") || ""
    };
  } catch (error) {
    console.error("UPI QR parse error:", error);

    return {
      isUpiQr: true,
      upiId: "",
      payeeName: "",
      amount: "",
      currency: "",
      note: ""
    };
  }
}

async function decodeQrFromImage(buffer) {
  try {
    const { data, info } = await sharp(buffer)
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const imageData = new Uint8ClampedArray(data);

    const result = jsQR(
      imageData,
      info.width,
      info.height,
      {
        inversionAttempts: "attemptBoth"
      }
    );

    if (!result) {
      return {
        detected: false,
        data: "",
        type: "",
        isUpiQr: false,
        upiId: "",
        payeeName: "",
        amount: "",
        currency: "",
        note: "",
        message: "No QR code detected."
      };
    }

    const qrData = result.data || "";
    const upiDetails = parseUpiQrData(qrData);

    return {
      detected: true,
      data: qrData,
      type: upiDetails.isUpiQr ? "UPI QR" : "QR Code",
      ...upiDetails,
      message: upiDetails.isUpiQr
        ? "UPI QR code detected and decoded."
        : "QR code detected and decoded."
    };
  } catch (error) {
    console.error("QR decode error:", error);

    return {
      detected: false,
      data: "",
      type: "",
      isUpiQr: false,
      upiId: "",
      payeeName: "",
      amount: "",
      currency: "",
      note: "",
      message: "QR code could not be decoded."
    };
  }
}

module.exports = {
  decodeQrFromImage
};