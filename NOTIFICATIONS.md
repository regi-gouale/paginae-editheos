# Système de Notifications - Paginae Editheos

## Vue d'ensemble

Le système de notifications de Paginae Editheos permet de notifier les utilisateurs des événements importants liés aux projets éditoriaux.

## Types de notifications

Les notifications sont automatiquement créées pour les événements suivants :

### 📋 Événements de projet

- **PROJECT_CREATED** : Nouveau projet créé
- **PROJECT_UPDATED** : Projet modifié (titre, description, date d'échéance, statut)
- **PROJECT_MOVED** : Projet déplacé vers une autre colonne Kanban
- **PROJECT_ASSIGNED** : Utilisateur assigné à un projet
- **PROJECT_UNASSIGNED** : Utilisateur retiré d'un projet

### ⏰ Événements d'échéance

- **PROJECT_DUE_SOON** : Projet arrivant à échéance (dans les 24h)
- **PROJECT_OVERDUE** : Projet en retard

### ✅ Événements de tâches

- **TASK_COMPLETED** : Tâche marquée comme terminée

### 👥 Événements d'équipe

- **MEMBER_ADDED** : Nouveau membre ajouté à l'équipe
- **AUTHOR_ADDED** : Nouvel auteur ajouté

## Architecture

### Base de données

```prisma
model Notification {
  id        String           @id @default(uuid())
  type      NotificationType
  title     String           // Titre court de la notification
  message   String           // Description détaillée
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  // Relations
  user      User    @relation(fields: [userId], references: [id])
  userId    String
  project   Project? @relation(fields: [projectId], references: [id])
  projectId String?
}
```

### Server Actions

- `createNotificationAction()` : Créer une notification simple
- `createProjectNotificationAction()` : Créer des notifications pour tous les membres d'un projet
- `getUserNotificationsAction()` : Récupérer les notifications de l'utilisateur
- `markNotificationAsReadAction()` : Marquer une notification comme lue
- `markAllNotificationsAsReadAction()` : Marquer toutes les notifications comme lues
- `deleteNotificationAction()` : Supprimer une notification
- `getUnreadNotificationsCountAction()` : Compter les notifications non lues

### Hooks React

- `useNotifications()` : Hook pour récupérer et rafraîchir les notifications
- `useUnreadNotificationsCount()` : Hook pour le compteur de notifications non lues
- `useMarkNotificationAsRead()` : Hook pour marquer comme lue
- `useMarkAllNotificationsAsRead()` : Hook pour marquer toutes comme lues
- `useDeleteNotification()` : Hook pour supprimer une notification

### Composants UI

- `NotificationsDropdown` : Dropdown principal avec liste des notifications
- `NotificationBell` : Icône de notification avec badge de compteur
- `SidebarActions` : Composant contenant les actions de la sidebar (notifications + thème)

## Intégration dans les actions existantes

Les notifications sont automatiquement créées lors des actions suivantes :

### Actions de projet (`lib/actions/kanban.ts`)

- `createProject()` : Notification pour les membres assignés
- `updateProject()` : Notification lors de modifications importantes
- `moveProject()` : Notification lors du déplacement entre colonnes

### Helpers de notifications (`lib/notifications-helpers.ts`)

- `createProjectNotificationForMembers()` : Créer des notifications pour tous les membres d'un projet
- `createUserNotification()` : Créer une notification pour un utilisateur spécifique
- `createDueDateNotifications()` : Vérifier et créer les notifications d'échéance

## Interface utilisateur

### Affichage dans la sidebar

Les notifications sont accessibles via :

1. **Icône de notification** dans le header de la sidebar
2. **Badge de compteur** indiquant le nombre de notifications non lues
3. **Dropdown** avec la liste des notifications récentes

### Fonctionnalités

- **Rafraîchissement automatique** toutes les 30 secondes
- **Marquer comme lue** au clic ou individuellement
- **Supprimer** des notifications
- **Marquer toutes comme lues** en un clic
- **Indicateurs visuels** pour les notifications non lues
- **Liens vers les projets** concernés (si applicable)

## Scripts utilitaires

### Notifications de test

```bash
pnpx tsx scripts/create-test-notifications.ts
```

### Vérification des échéances

```bash
pnpx tsx scripts/check-due-date-notifications.ts
```

Ce script peut être exécuté quotidiennement via un cron job pour vérifier automatiquement les projets arrivant à échéance ou en retard.

## Configuration recommandée

### Cron job pour les échéances

```bash
# Vérifier chaque jour à 8h00
0 8 * * * cd /path/to/paginae-editheos && pnpx tsx scripts/check-due-date-notifications.ts
```

### Variables d'environnement

Aucune configuration supplémentaire n'est nécessaire. Le système utilise la base de données Prisma existante.

## Personnalisation

### Ajouter de nouveaux types de notifications

1. Ajouter le type dans l'enum `NotificationType` du schema Prisma
2. Ajouter l'emoji correspondant dans `NotificationItem.getNotificationIcon()`
3. Créer les server actions nécessaires
4. Intégrer les appels dans les actions existantes

### Modifier les délais d'échéance

Dans `createDueDateNotifications()`, modifier les calculs de dates :

```typescript
// Pour notifier 2 jours avant au lieu de 1
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);
```

## Performance

- **Requêtes optimisées** avec relations Prisma
- **Rafraîchissement intelligent** toutes les 30 secondes côté client
- **Invalidation de cache** lors des mutations
- **Pagination** possible pour de grandes listes de notifications (à implémenter si nécessaire)

## Sécurité

- **Vérification d'authentification** sur toutes les actions serveur
- **Filtrage par utilisateur** pour toutes les requêtes de notifications
- **Validation des permissions** sur la suppression/modification de notifications
