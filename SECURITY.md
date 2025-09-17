# Guide de Sécurité - Paginae Editheos

## 🔒 Améliorations de Sécurité Implémentées

### 1. Middleware de Sécurité (`middleware.ts`)

Le middleware Next.js implémente plusieurs couches de sécurité :

- **Protection des routes** : Authentification automatique pour `/dashboard/*`
- **Headers de sécurité** :
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` 
  - `X-XSS-Protection: 1; mode=block`
  - `Content-Security-Policy` strict
  - `Permissions-Policy` restrictif
- **Validation de whitelist** pour les utilisateurs authentifiés
- **Gestion d'erreurs sécurisée**

### 2. Système d'Authentification Sécurisé (`lib/auth/auth-utils.ts`)

Fonctions centralisées avec cache React :

```typescript
const user = await getRequiredUser(); // Redirige si non authentifié
const hasAccess = await hasProjectPermission(projectId, "write");
await requireProjectPermission(projectId, "delete");
```

- **Cache React** pour éviter les appels multiples
- **Validation de permissions granulaires** (read/write/delete)
- **Vérification de whitelist** automatique
- **Gestion d'erreurs sécurisée**

### 3. Validation et Sanitisation (`lib/security/validation.ts`)

Schémas Zod sécurisés pour tous les types de données :

```typescript
secureEmailSchema    // Validation + normalisation email
securePasswordSchema // Mot de passe fort requis
secureNameSchema     // Noms avec caractères autorisés
secureUrlSchema      // URLs avec protocoles autorisés
secureFileSchema     // Validation fichiers (type, taille)
```

Fonctions utilitaires :
- `validateAndSanitize()` - Validation avec schéma
- `sanitizeHtml()` - Suppression de scripts malveillants
- `validateFormData()` - Nettoyage FormData avec whitelist de champs

### 4. Logging Sécurisé (`lib/security/logger.ts`)

Système de logging qui :

- **Masque automatiquement** les données sensibles (emails, mots de passe, tokens)
- **Format JSON structuré** en production
- **Logs d'audit** pour les actions critiques
- **Logs d'authentification** avec détection d'échecs
- **Logs de sécurité** pour les menaces détectées

```typescript
logger.auditLog("delete_project", userId, { projectId });
logger.authLog("login_attempt", email, success, ip);
logger.securityLog("suspicious_activity", details, ip);
```

### 5. Actions Serveur Sécurisées (`lib/security/actions-utils.ts`)

Wrapper pour créer des server actions sécurisées :

```typescript
export const addAuthorAction = createSecureServerAction(
  addAuthorSchema,
  async (validatedData, userId) => {
    // Logique métier sécurisée
  },
  {
    action: "add_author",
    requireAuth: true,
    allowedFields: ["firstName", "lastName", "email"],
    logSensitive: true,
  }
);
```

Fonctionnalités :
- **Validation automatique** des données
- **Authentification requise** configurable
- **Whitelist de champs** autorisés
- **Logging d'audit** automatique
- **Gestion d'erreurs** standardisée
- **Rate limiting** basique intégré

### 6. Whitelist Email Renforcée (`lib/whitelist.ts`)

Système de whitelist amélioré :

- **Validation du format email** stricte
- **Normalisation** automatique (minuscules, trim)
- **Logging de sécurité** pour les tentatives non autorisées
- **Validation de configuration** au démarrage
- **Gestion des domaines** autorisés

### 7. Configuration Next.js Sécurisée (`next.config.ts`)

Headers de sécurité au niveau application :
- Désactivation du header `X-Powered-By`
- Configuration CSP stricte
- Headers de protection XSS
- Politique de permissions restrictive

## 🛡️ Patterns de Sécurité Appliqués

### Principe de Moindre Privilège
- Authentification requise par défaut
- Permissions granulaires par action
- Validation stricte des entrées

### Défense en Profondeur
1. **Middleware** - Premier niveau de contrôle
2. **Server Actions** - Validation et autorisation
3. **Base de données** - Contraintes et relations
4. **Logging** - Détection et audit

### Fail-Safe Defaults
- Accès refusé par défaut
- Logging des échecs de sécurité
- Masquage des erreurs en production

### Zero Trust Architecture
- Validation systématique des données
- Pas de confiance implicite
- Audit de toutes les actions sensibles

## 📋 Actions de Migration

### Pour utiliser les nouvelles actions sécurisées :

1. **Remplacer les imports** :
```typescript
// Ancien
import { addAuthorAction } from "@/lib/actions/authors.refactored";

// Nouveau
import { addAuthorSecureAction } from "@/lib/actions/authors-secure.action";
```

2. **Adapter les composants** pour gérer `ActionResult<T>` :
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const result = await addAuthorSecureAction(formData);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },
});
```

3. **Mettre à jour les schémas de validation** pour utiliser les schémas sécurisés

### Variables d'environnement requises :

```env
# Configuration de sécurité
EMAIL_WHITELIST=admin@example.com,user@example.com
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# Optionnel pour logging avancé
LOG_LEVEL=info
SECURITY_ALERTS_WEBHOOK=https://...
```

## 🔧 Tests et Validation

### Tests de sécurité recommandés :

1. **Tests de validation** - Vérifier le rejet des données malformées
2. **Tests d'autorisation** - Tentatives d'accès non autorisé
3. **Tests de sanitisation** - Injection XSS/SQL
4. **Tests de rate limiting** - Limitation des requêtes
5. **Tests de logging** - Vérification des audits

### Monitoring de sécurité :

- Surveillance des logs d'erreur
- Alertes sur les tentatives d'accès non autorisé
- Métriques de performance des validations
- Audit périodique des permissions

## 🚀 Prochaines Étapes

1. **Rate Limiting avancé** avec Redis
2. **Authentification 2FA** avec Better Auth
3. **Chiffrement des données sensibles** en base
4. **Monitoring temps réel** des menaces
5. **Tests de pénétration** automatisés