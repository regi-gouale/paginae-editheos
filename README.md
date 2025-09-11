# Paginae Editheos

Paginae Editheos est une application web full-stack conçue comme un tableau de bord de gestion de projet pour les maisons d'édition. Elle permet de suivre l'avancement des projets éditoriaux, de gérer les auteurs, et de coordonner les membres de l'équipe.

## ✨ Fonctionnalités

- **Tableau de bord centralisé** : Vue d'ensemble des statistiques clés, des projets récents et de l'activité de l'équipe.
- **Gestion de projet Kanban** : Organisez les tâches et suivez leur état (À faire, En cours, Terminé) grâce à un tableau Kanban interactif avec prise en charge du glisser-déposer.
- **Gestion des Auteurs et des Membres** : Tableaux de données pour lister, rechercher et filtrer les auteurs et les membres de l'équipe.
- **Authentification sécurisée** : Système de connexion pour protéger l'accès aux données du tableau de bord.
- **Interface Moderne et Réactive** : Construite avec des composants réutilisables pour une expérience utilisateur fluide sur tous les appareils.

## 🛠️ Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) (avec App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Base de Données** : [Prisma](https://www.prisma.io/) (ORM) avec une base de données PostgreSQL (ou autre base supportée).
- **UI** : [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), et [shadcn/ui](https://ui.shadcn.com/) pour les composants.
- **Authentification** : `better-auth`
- **Gestion de Données (Client)** : `@tanstack/react-table` pour les tableaux.
- **Déploiement** : Conçu pour [Vercel](https://vercel.com/).

## 🚀 Démarrage Rapide

Suivez ces étapes pour lancer le projet en local.

### Prérequis

- [Node.js](https://nodejs.org/en) (version 18.x ou supérieure)
- [pnpm](https://pnpm.io/installation)
- Une base de données (ex: PostgreSQL)

### Installation

1.  **Clonez le dépôt :**

    ```bash
    git clone https://github.com/regi-gouale/paginae-editheos.git
    cd paginae-editheos
    ```

2.  **Installez les dépendances :**

    ```bash
    pnpm install
    ```

3.  **Configurez les variables d'environnement :**
    Créez un fichier `.env` à la racine du projet et ajoutez l'URL de votre base de données :

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```

4.  **Appliquez les migrations de la base de données :**

    ```bash
    pnpm prisma migrate dev
    ```

5.  **(Optionnel) Remplissez la base de données avec des données de test :**
    ```bash
    pnpm prisma db seed
    ```

### Lancer le serveur de développement

Pour démarrer l'application en mode développement, exécutez :

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

## Déploiement

Ce projet est optimisé pour un déploiement sur [Vercel](https://vercel.com/). Le script `vercel-build` (`pnpm vercel-build`) est configuré pour générer les clients Prisma, appliquer les migrations et construire l'application Next.js.
