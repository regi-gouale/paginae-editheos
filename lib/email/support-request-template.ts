const CATEGORY_LABELS: Record<string, string> = {
  BUG: "🐞 Signaler un bug",
  QUESTION: "❓ Question",
  ACCOUNT: "👤 Compte / accès",
  OTHER: "✉️ Autre",
};

export function supportRequestEmailHTML(params: {
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  message: string;
}): string {
  const { userName, userEmail, category, subject, message } = params;
  const categoryLabel = CATEGORY_LABELS[category] ?? category;

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
    .badge {
      display: inline-block;
      background-color: #eef2ff;
      color: #3730a3;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .meta {
      font-size: 13px;
      color: #666;
      margin-bottom: 20px;
    }
    .meta strong {
      color: #1f2937;
    }
    .subject {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #1f2937;
    }
    .message {
      white-space: pre-wrap;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 16px;
      font-size: 14px;
      color: #333;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      margin-top: 30px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Paginae</div>
    </div>

    <div class="badge">${categoryLabel}</div>

    <div class="meta">
      De <strong>${userName}</strong> (${userEmail})
    </div>

    <div class="subject">${subject}</div>

    <div class="message">${message}</div>

    <div class="footer">
      <p>Répondez directement à cet email pour contacter ${userName}.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function supportRequestEmailText(params: {
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  message: string;
}): string {
  const { userName, userEmail, category, subject, message } = params;
  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  return `
${categoryLabel}

De : ${userName} (${userEmail})
Sujet : ${subject}

${message}

---
Répondez directement à cet email pour contacter ${userName}.
  `;
}
