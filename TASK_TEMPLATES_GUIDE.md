# Guide des Templates de Tâches

## Vue d'ensemble

La fonctionnalité de templates de tâches permet de définir des listes de tâches par défaut pour chaque type de projet (Édition et Impression). Lorsqu'un nouveau projet est créé, les tâches correspondantes sont automatiquement ajoutées.

## Accès à la page de paramètres

1. Connectez-vous à l'application
2. Dans la sidebar, cliquez sur **"Paramètres"**
3. Vous accédez à la page de configuration des templates de tâches

## Fonctionnalités

### Gestion des templates

Pour chaque type de projet, vous pouvez :

- **Ajouter une tâche** : Cliquez sur le bouton "Ajouter une tâche" et saisissez le nom de la tâche
- **Modifier une tâche** : Cliquez sur le nom de la tâche pour l'éditer
- **Supprimer une tâche** : Cliquez sur l'icône de corbeille qui apparaît au survol
- **Réorganiser les tâches** : Glissez-déposez les tâches pour changer leur ordre

### Utilisation des templates

Lorsque vous créez un nouveau projet :

1. Les tâches définies dans les templates pour le type de projet choisi sont automatiquement ajoutées
2. Si aucun template n'existe pour le type de projet EDITION, des tâches par défaut sont créées
3. Si aucun template n'existe pour le type de projet PRINTING, aucune tâche n'est créée

## Templates par défaut

### Projets d'édition

Les templates par défaut pour les projets d'édition incluent :

1. Réception du manuscrit
2. Première lecture éditoriale
3. Signature du contrat
4. Correction éditoriale
5. Validation du texte final
6. Création de la couverture
7. Validation de la couverture
8. Mise en page / Maquette
9. Relecture BAT (Bon à Tirer)
10. Impression
11. Publication et diffusion

### Projets d'impression

Les templates par défaut pour les projets d'impression incluent :

1. Réception du fichier
2. Vérification technique
3. Validation du devis
4. Préparation de l'impression
5. Impression
6. Contrôle qualité
7. Façonnage / Reliure
8. Emballage
9. Expédition

## Initialisation des templates

Si vous partez d'une installation vierge, vous pouvez initialiser les templates par défaut de deux manières :

### Option 1 : Via le seed

```bash
pnpm prisma db seed
```

### Option 2 : Via le script dédié

```bash
pnpm tsx scripts/initialize-task-templates.ts
```

## Structure technique

### Modèle de données

```prisma
model TaskTemplate {
  id          String      @id @default(uuid())
  title       String
  projectType ProjectType
  order       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @default(now()) @updatedAt
}
```

### Actions serveur

Les actions suivantes sont disponibles dans `lib/actions/task-templates.action.ts` :

- `getTaskTemplates()` : Récupérer tous les templates
- `getTaskTemplatesByType(projectType)` : Récupérer les templates par type
- `createTaskTemplate(data)` : Créer un nouveau template
- `updateTaskTemplate(id, data)` : Mettre à jour un template
- `deleteTaskTemplate(id)` : Supprimer un template
- `reorderTaskTemplates(templates)` : Réorganiser les templates
- `replaceTaskTemplatesForType(projectType, titles)` : Remplacer tous les templates d'un type

### Composants

- **Page** : `app/dashboard/settings/page.tsx`
- **Composant principal** : `components/settings/task-templates-editor.tsx`

## Migration

La migration `20260310063206_add_task_templates` crée la table `task_template` dans la base de données.

Pour appliquer la migration manuellement :

```bash
pnpm prisma migrate deploy
```

## Notes importantes

- Les templates sont partagés par tous les utilisateurs de l'application
- La modification des templates n'affecte pas les projets existants
- Seuls les nouveaux projets créés après la modification des templates seront affectés
- Les tâches peuvent être gérées individuellement dans chaque projet après leur création
