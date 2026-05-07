import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone || "").trim();
  const code = String(body.code || "").trim();

  if (!phone || !code) {
    return NextResponse.json({ verified: false, message: "Phone number and PIN code are required." }, { status: 400 });
  }

  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_VERIFY_SERVICE_SID
  );

  if (!hasTwilio) {
    return NextResponse.json({
      verified: code === "123456",
      demo: true,
      message: code === "123456" ? "Phone verified in demo mode." : "Invalid demo PIN. Use 123456."
    });
  }

  try {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const url = `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: phone,
        Code: code
      })
    });

    const data = await response.json();
    const verified = data.status === "approved";

    return NextResponse.json({
      verified,
      message: verified ? "Phone verified successfully." : "Invalid or expired PIN."
    });
  } catch (error) {
    return NextResponse.json({ verified: false, message: "SMS verification service error.", detail: String(error) }, { status: 500 });
  }
}
