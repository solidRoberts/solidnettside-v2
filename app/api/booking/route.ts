import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, industry, datetime, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !industry) {
      return NextResponse.json(
        { error: "Mangler påkrevde felt" },
        { status: 400 }
      )
    }

    // Format datetime for display
    const formattedDatetime = datetime
      ? new Date(datetime).toLocaleString("nb-NO", {
          dateStyle: "full",
          timeStyle: "short",
        })
      : "Ikke spesifisert"

    // Send email notification
    await resend.emails.send({
      from: "Solid Marketing <noreply@solidmarketing.no>",
      to: ["kontakt@solidmarketing.no"],
      replyTo: email,
      subject: `Ny booking fra ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f52e8;">Ny booking-forespørsel</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Navn:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">E-post:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="mailto:${email}" style="color: #4f52e8;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Telefon:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${phone || "Ikke oppgitt"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Bransje:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${industry}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Ønsket tidspunkt:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${formattedDatetime}</td>
            </tr>
            ${
              message
                ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Melding:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${message}</td>
            </tr>
            `
                : ""
            }
          </table>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Sendt fra bookingskjemaet på solidmarketing.no
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json(
      { error: "Kunne ikke sende forespørsel" },
      { status: 500 }
    )
  }
}
