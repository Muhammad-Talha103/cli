// app/api/encleso/route.js
export async function POST(req) {
  try {
    // Apni client wali license key
    const licenseKey = process.env.ENCLESO_KEY || "Jn6SlEQtMRRbewL5mxlJWkTVj4k0X94pKEu";

    // Encleso endpoint call
    const res = await fetch("https://encleso.com/API/SetLicenseKey", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://cli-puce.vercel.app", // ya client ka domain
      },
      body: new URLSearchParams({
        Key: licenseKey,
      }),
    });

    const enclesoResponse = await res.json();

    return Response.json({ enclesoResponse });
  } catch (err) {
    console.error("Encleso API error:", err);
    return Response.json({ error: "Failed to get license" }, { status: 500 });
  }
}
