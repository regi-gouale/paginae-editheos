console.log("Loading whitelist.ts");
console.log("Process env:", process.env.WHITELIST);

export function isEmailWhitelisted(email: string): boolean {
  const EMAIL_WHITELIST: string[] = process.env.EMAIL_WHITELIST
    ? process.env.EMAIL_WHITELIST.split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
    : [];
  console.log("EMAIL_WHITELIST:", EMAIL_WHITELIST);
  console.log("Checking email:", email);

  if (EMAIL_WHITELIST.length === 0) {
    // Si la liste est vide, tout le monde est autorisé
    return true;
  }
  return EMAIL_WHITELIST.includes(email);
}
