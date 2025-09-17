import { logger } from "@/lib/security/logger";

/**
 * Vérifie si un email est autorisé selon la whitelist
 * Avec logging de sécurité pour les tentatives d'accès
 */
export function isEmailWhitelisted(email: string): boolean {
  try {
    // Validation basique de l'email
    if (!email || typeof email !== "string") {
      logger.securityLog("Invalid email format in whitelist check", { email: typeof email });
      return false;
    }

    // Normalisation de l'email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Vérification du format email basique
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      logger.securityLog("Malformed email in whitelist check", { email: "[REDACTED]" });
      return false;
    }

    const EMAIL_WHITELIST: string[] = process.env.EMAIL_WHITELIST
      ? process.env.EMAIL_WHITELIST.split(",")
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      : [];

    // Si la liste est vide, tout le monde est autorisé
    if (EMAIL_WHITELIST.length === 0) {
      logger.info("No email whitelist configured, allowing all emails");
      return true;
    }

    const isAllowed = EMAIL_WHITELIST.includes(normalizedEmail);
    
    // Log des tentatives d'accès non autorisées
    if (!isAllowed) {
      logger.securityLog("Email not in whitelist", { 
        email: "[EMAIL_REDACTED]",
        domain: normalizedEmail.split("@")[1],
        whitelistSize: EMAIL_WHITELIST.length 
      });
    }

    return isAllowed;
  } catch (error) {
    logger.error("Error checking email whitelist", error as Error, { email: "[EMAIL_REDACTED]" });
    // En cas d'erreur, être restrictif
    return false;
  }
}

/**
 * Valide la configuration de la whitelist au démarrage
 */
export function validateWhitelistConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const whitelistEnv = process.env.EMAIL_WHITELIST;
    
    if (!whitelistEnv) {
      logger.warn("EMAIL_WHITELIST environment variable not set, all emails will be allowed");
      return { valid: true, errors: [] };
    }

    const emails = whitelistEnv.split(",").map(email => email.trim());
    
    for (const email of emails) {
      if (!email) {
        errors.push("Empty email in whitelist");
        continue;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Invalid email format: ${email}`);
      }
    }

    if (errors.length > 0) {
      logger.error("Email whitelist configuration errors", undefined, { errors });
      return { valid: false, errors };
    }

    logger.info("Email whitelist configuration validated", { emailCount: emails.length });
    return { valid: true, errors: [] };
  } catch (error) {
    const errorMessage = "Failed to validate whitelist configuration";
    logger.error(errorMessage, error as Error);
    return { valid: false, errors: [errorMessage] };
  }
}

/**
 * Obtient la liste des domaines autorisés (pour affichage admin)
 */
export function getAllowedDomains(): string[] {
  try {
    const EMAIL_WHITELIST: string[] = process.env.EMAIL_WHITELIST
      ? process.env.EMAIL_WHITELIST.split(",")
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0)
      : [];

    const domains = EMAIL_WHITELIST
      .map(email => email.split("@")[1])
      .filter(domain => domain)
      .reduce((unique, domain) => {
        if (!unique.includes(domain)) {
          unique.push(domain);
        }
        return unique;
      }, [] as string[]);

    return domains;
  } catch (error) {
    logger.error("Error getting allowed domains", error as Error);
    return [];
  }
}
