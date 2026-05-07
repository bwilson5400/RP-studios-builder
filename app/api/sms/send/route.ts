import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone || "").trim();
  const brand = String(body.brand || "RPE Studios").trim();

  if (!phone) {
    return NextResponse.json({ ok: false, message: "Phone number is required." }, { status: 400 });
  }

  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_VERIFY_SERVICE_SID
  );

  if (!hasTwilio) {
    return NextResponse.json({
      ok: true,
      demo: true,
      message: `${brand} SMS verification is in demo mode. Use PIN 123456. Add Twilio env vars to send real SMS.`
    });
  }

  try {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const url = `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/Verifications`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: phone,
        Channel: "sms",
        Locale: "en"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ ok: false, message: "Twilio failed to send verification PIN.", detail: errorText }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `${brand} verification PIN sent. The code is temporarily valid.`
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "SMS service error.", detail: String(error) }, { status: 500 });
  }
}
