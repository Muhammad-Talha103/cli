import { NextResponse } from "next/server";

export async function GET() {
  try {
    const LICENSE_KEY = "Jn6SlEQtMRRbewL5mxlJWkTVj4k0X94p";
    if (!LICENSE_KEY) {
      return NextResponse.json({ error: "License key missing" }, { status: 500 });
    }

    // Apna allowed origin jo aapne Encleso ko diya tha
    const origin = "https://grew-scanner.vercel.app"; 

    const body = new URLSearchParams();
    body.append("Key", LICENSE_KEY);

    const resp = await fetch("https://encleso.com/API/SetLicenseKey", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": origin,
      },
      body: body.toString(),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "Encleso API error", detail: text },
        { status: resp.status }
      );
    }

    const json = await resp.json();
    return NextResponse.json(json); // { token: "..." }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
