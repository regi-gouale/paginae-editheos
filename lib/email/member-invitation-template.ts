export function memberInvitationEmailHTML(
  recipientName: string,
  invitationLink: string,
  invitedRoleLabel: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .content {
      margin-bottom: 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #1f2937;
    }
    .text {
      color: #666;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .role {
      background-color: #f3f4f6;
      border-left: 4px solid #2563eb;
      padding: 12px;
      margin-bottom: 20px;
      border-radius: 4px;
      font-size: 14px;
      color: #1f2937;
      font-weight: 600;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
    }
    .link-text {
      font-size: 12px;
      color: #999;
      word-break: break-all;
      margin-top: 10px;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .expiration-notice {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin-bottom: 20px;
      border-radius: 4px;
      font-size: 13px;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Paginae</div>
    </div>

    <div class="content">
      <div class="greeting">Bonjour ${recipientName},</div>

      <p class="text">
        Vous avez été invité(e) à rejoindre l'équipe Paginae.
      </p>

      <div class="role">
        Rôle attribué : ${invitedRoleLabel}
      </div>

      <div class="expiration-notice">
        ⏰ Ce lien d'invitation expire dans 72 heures.
      </div>

      <div class="button-container">
        <a href="${invitationLink}" class="button">Créer mon compte</a>
        <div class="link-text">
          Ou copiez ce lien : ${invitationLink}
        </div>
      </div>

      <p class="text">
        Si vous ne souhaitez pas rejoindre l'équipe, vous pouvez ignorer cet email.
      </p>
    </div>

    <div class="footer">
      <p>© 2026 Paginae. Tous droits réservés.</p>
      <p>Si vous avez des questions, contactez notre support.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function memberInvitationEmailText(
  recipientName: string,
  invitationLink: string,
  invitedRoleLabel: string,
): string {
  return `
Bonjour ${recipientName},

Vous avez été invité(e) à rejoindre l'équipe Paginae.

Rôle attribué : ${invitedRoleLabel}

Créez votre compte en cliquant sur le lien ci-dessous :

${invitationLink}

⏰ Ce lien d'invitation expire dans 72 heures.

Si vous ne souhaitez pas rejoindre l'équipe, vous pouvez ignorer cet email.

© 2026 Paginae. Tous droits réservés.
  `;
}
