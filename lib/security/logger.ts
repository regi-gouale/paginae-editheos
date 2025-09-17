/**
 * Système de logging sécurisé pour l'application
 * Évite l'exposition d'informations sensibles dans les logs
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  action?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Données sensibles à masquer dans les logs
 */
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "key",
  "email",
  "phone",
  "ssn",
  "credit",
  "authorization",
  "cookie",
];

/**
 * Masque les données sensibles dans un objet
 */
function sanitizeLogData(data: unknown): unknown {
  if (typeof data === "string") {
    // Masquer les emails et autres données sensibles communes
    return data
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL_REDACTED]")
      .replace(/\b(?:\d{4}\s?){3}\d{4}\b/g, "[CARD_REDACTED]")
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [TOKEN_REDACTED]");
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  if (data && typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some((field) => lowerKey.includes(field));
      
      if (isSensitive) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    
    return sanitized;
  }

  return data;
}

/**
 * Formatage des logs pour la production
 */
function formatLogEntry(entry: LogEntry): string {
  const sanitizedEntry = sanitizeLogData(entry) as LogEntry;
  return JSON.stringify(sanitizedEntry);
}

/**
 * Logger principal de l'application
 */
class SecurityLogger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata: metadata ? sanitizeLogData(metadata) as Record<string, unknown> : undefined,
    };

    if (this.isDevelopment) {
      // En développement, affichage plus lisible
      console[level === "debug" ? "log" : level](
        `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`,
        metadata ? sanitizeLogData(metadata) : ""
      );
    } else {
      // En production, format JSON structuré
      console[level === "debug" ? "log" : level](formatLogEntry(entry));
    }
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log("warn", message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>) {
    const errorMetadata = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : undefined,
    };
    
    this.log("error", message, errorMetadata);
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log("debug", message, metadata);
    }
  }

  /**
   * Log des actions utilisateur sensibles pour l'audit
   */
  auditLog(action: string, userId: string, metadata?: Record<string, unknown>) {
    this.log("info", `Audit: ${action}`, {
      ...metadata,
      userId,
      action,
      auditLog: true,
    });
  }

  /**
   * Log des tentatives d'authentification
   */
  authLog(action: string, email: string, success: boolean, ip?: string, userAgent?: string) {
    this.log(success ? "info" : "warn", `Auth: ${action}`, {
      email: success ? "[EMAIL_REDACTED]" : email, // Masquer l'email réussi, garder les échecs pour debug
      success,
      ip,
      userAgent,
      authLog: true,
    });
  }

  /**
   * Log des erreurs de sécurité
   */
  securityLog(threat: string, details: Record<string, unknown>, ip?: string) {
    this.log("error", `Security: ${threat}`, {
      ...sanitizeLogData(details),
      ip,
      securityLog: true,
    });
  }
}

// Instance singleton du logger
export const logger = new SecurityLogger();

/**
 * Wrapper pour les erreurs des server actions
 */
export function handleServerActionError(error: unknown, action: string, userId?: string): never {
  if (error instanceof Error) {
    logger.error(`Server action error: ${action}`, error, { userId, action });
    
    // En production, ne pas exposer les détails de l'erreur
    if (process.env.NODE_ENV === "production") {
      throw new Error("Une erreur interne s'est produite");
    }
    
    throw error;
  }
  
  logger.error(`Unknown server action error: ${action}`, undefined, { 
    userId, 
    action, 
    errorType: typeof error 
  });
  
  throw new Error("Une erreur inconnue s'est produite");
}

/**
 * Middleware pour logger les requêtes sensibles
 */
export function logSensitiveAction(action: string, userId: string, metadata?: Record<string, unknown>) {
  logger.auditLog(action, userId, metadata);
}