export function resetPasswordEmailHTML(
  userName: string,
  resetLink: string,
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
    .button:hover {
      background-color: #1d4ed8;
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
      <div class="greeting">Bonjour ${userName},</div>
      
      <p class="text">
        Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
      </p>
      
      <div class="expiration-notice">
        ⏰ Ce lien expire dans 1 heure
      </div>
      
      <div class="button-container">
        <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
        <div class="link-text">
          Ou copiez ce lien : ${resetLink}
        </div>
      </div>
      
      <p class="text">
        Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe reste inchangé.
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

export function resetPasswordEmailText(
  userName: string,
  resetLink: string,
): string {
  return `
Bonjour ${userName},

Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe.

${resetLink}

⏰ Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe reste inchangé.

© 2026 Paginae. Tous droits réservés.
  `;
}
