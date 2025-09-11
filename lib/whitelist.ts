// Liste des emails autorisés à s'inscrire
export const EMAIL_WHITELIST: string[] = process.env.EMAIL_WHITELIST
  ? process.env.EMAIL_WHITELIST.split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
  : [];
