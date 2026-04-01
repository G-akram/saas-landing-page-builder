import { logger } from '@/shared/lib/logger'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
    logger.info('Email send (dev mode - not actually sent)', {
      to: params.to,
      subject: params.subject,
    })
    // Extract and log the verification link from HTML in development
    const linkMatch = params.html.match(/href="([^"]*verify[^"]*)"/)
    if (linkMatch?.[1]) {
      logger.info('📧 Verification link for development', { link: linkMatch[1] })
    } else {
      // Fallback: log the entire HTML if link extraction failed
      logger.info('Email HTML (link extraction failed)', { html: params.html })
    }
    return
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'PageForge <noreply@pageforge.dev>',
    to: params.to,
    subject: params.subject,
    html: params.html,
  })

  if (error) {
    logger.error('Failed to send email', {
      to: params.to,
      subject: params.subject,
      error: error.message,
    })
    throw new Error(`Email send failed: ${error.message}`)
  }

  logger.info('Email sent successfully', { to: params.to, subject: params.subject })
}
