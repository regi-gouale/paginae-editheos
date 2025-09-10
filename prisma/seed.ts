import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // Supprime les membres existants
  await prisma.member.deleteMany();

  // Crée des membres de test
  const members = await prisma.member.createMany({
    data: [
      {
        name: "Alice Martin",
        email: "alice.martin@example.com",
        role: "ADMIN",
      },
      {
        name: "Bob Dupuis",
        email: "bob.dupuis@example.com",
        role: "DESIGNER",
      },
      {
        name: "Claire Rousseau",
        email: "claire.rousseau@example.com",
        role: "REVIEWER",
      },
      {
        name: "David Moreau",
        email: "david.moreau@example.com",
        role: "CONTRIBUTOR",
      },
      {
        name: "Emma Leroy",
        email: "emma.leroy@example.com",
        role: "GUEST",
      },
      {
        name: "François Dubois",
        email: "francois.dubois@example.com",
        role: "DESIGNER",
      },
      {
        name: "Gabrielle Simon",
        email: "gabrielle.simon@example.com",
        role: "CONTRIBUTOR",
      },
      {
        name: "Henri Lambert",
        email: "henri.lambert@example.com",
        role: "REVIEWER",
      },
      {
        name: "Isabelle Petit",
        email: "isabelle.petit@example.com",
        role: "GUEST",
      },
      {
        name: "Jacques Bernard",
        email: "jacques.bernard@example.com",
        role: "ADMIN",
      },
      {
        name: "Karine Roux",
        email: "karine.roux@example.com",
        role: "DESIGNER",
      },
      {
        name: "Laurent Fournier",
        email: "laurent.fournier@example.com",
        role: "CONTRIBUTOR",
      },
      {
        name: "Marie Blanc",
        email: "marie.blanc@example.com",
        role: "REVIEWER",
      },
      {
        name: "Nicolas André",
        email: "nicolas.andre@example.com",
        role: "GUEST",
      },
      {
        name: "Olivia Girard",
        email: "olivia.girard@example.com",
        role: "DESIGNER",
      },
    ],
  });

  console.log(`✅ Created ${members.count} members`);

  // Supprime les auteurs existants
  await prisma.author.deleteMany();

  // Crée des auteurs de test
  const authors = await prisma.author.createMany({
    data: [
      {
        firstName: "Victor",
        lastName: "Hugo",
        email: "victor.hugo@classique.fr",
        biography:
          "Écrivain, dramaturge, poète, homme politique, académicien et intellectuel engagé français.",
        nationality: "Française",
        birthDate: new Date("1802-02-26"),
        website: "https://www.victor-hugo.org",
      },
      {
        firstName: "Marguerite",
        lastName: "Duras",
        email: "marguerite.duras@moderne.fr",
        biography:
          "Romancière, dramaturge, scénariste et réalisatrice française.",
        nationality: "Française",
        birthDate: new Date("1914-04-04"),
      },
      {
        firstName: "Gabriel",
        lastName: "García Márquez",
        email: "gabriel.marquez@realisme.co",
        biography: "Écrivain colombien, prix Nobel de littérature en 1982.",
        nationality: "Colombienne",
        birthDate: new Date("1927-03-06"),
        website: "https://www.gabriel-garcia-marquez.com",
      },
      {
        firstName: "Toni",
        lastName: "Morrison",
        email: "toni.morrison@literature.com",
        biography: "Romancière américaine, prix Nobel de littérature en 1993.",
        nationality: "Américaine",
        birthDate: new Date("1931-02-18"),
      },
      {
        firstName: "Haruki",
        lastName: "Murakami",
        email: "haruki.murakami@contemporain.jp",
        biography:
          "Romancier japonais contemporain de renommée internationale.",
        nationality: "Japonaise",
        birthDate: new Date("1949-01-12"),
        website: "https://www.harukimurakami.com",
      },
      {
        firstName: "Chimamanda Ngozi",
        lastName: "Adichie",
        email: "chimamanda.adichie@literature.ng",
        biography: "Romancière nigériane de langue anglaise.",
        nationality: "Nigériane",
        birthDate: new Date("1977-09-15"),
        website: "https://www.chimamanda.com",
      },
      {
        firstName: "Elena",
        lastName: "Ferrante",
        email: "elena.ferrante@napoli.it",
        biography:
          "Pseudonyme d'une romancière italienne dont l'identité reste mystérieuse.",
        nationality: "Italienne",
      },
      {
        firstName: "Paulo",
        lastName: "Coelho",
        email: "paulo.coelho@alchimiste.br",
        biography: "Romancier et interprète brésilien, auteur de l'Alchimiste.",
        nationality: "Brésilienne",
        birthDate: new Date("1947-08-24"),
        website: "https://www.paulocoelho.com",
      },
      {
        firstName: "Donna",
        lastName: "Tartt",
        email: "donna.tartt@literature.us",
        biography:
          "Romancière américaine, prix Pulitzer de la fiction en 2014.",
        nationality: "Américaine",
        birthDate: new Date("1963-12-23"),
      },
      {
        firstName: "Zadie",
        lastName: "Smith",
        email: "zadie.smith@contemporary.uk",
        biography: "Romancière britannique d'origine jamaïcaine.",
        nationality: "Britannique",
        birthDate: new Date("1975-10-25"),
      },
    ],
  });

  console.log(`✅ Created ${authors.count} authors`);

  // Supprime les données Kanban existantes
  await prisma.customField.deleteMany();
  await prisma.projectTask.deleteMany();
  await prisma.ruleAction.deleteMany();
  await prisma.ruleCondition.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.project.deleteMany();
  await prisma.kanbanColumn.deleteMany();

  // Crée les colonnes Kanban
  const kanbanColumns = await Promise.all([
    prisma.kanbanColumn.create({
      data: {
        title: "À faire",
        color: "bg-blue-50 dark:bg-blue-900/30",
        position: 0,
      },
    }),
    prisma.kanbanColumn.create({
      data: {
        title: "En cours",
        color: "bg-yellow-50 dark:bg-yellow-900/30",
        position: 1,
      },
    }),
    prisma.kanbanColumn.create({
      data: {
        title: "Bloqué",
        color: "bg-orange-50 dark:bg-orange-900/30",
        position: 2,
      },
    }),
    prisma.kanbanColumn.create({
      data: {
        title: "Terminé",
        color: "bg-green-50 dark:bg-green-900/30",
        position: 3,
      },
    }),
    prisma.kanbanColumn.create({
      data: {
        title: "Rejeté",
        color: "bg-red-50 dark:bg-red-900/30",
        position: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${kanbanColumns.length} kanban columns`);

  // Récupère les membres et auteurs créés
  const createdMembers = await prisma.member.findMany({ take: 10 });
  const createdAuthors = await prisma.author.findMany({ take: 8 });

  // Crée des projets avec différents statuts
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: "Les Misérables - Édition Critique",
        description:
          "Nouvelle édition annotée et commentée du chef-d'œuvre de Victor Hugo",
        status: "IN_PROGRESS",
        dueDate: new Date("2024-12-31"),
        columnId: kanbanColumns[1].id,
        authors: {
          connect: [{ id: createdAuthors[0].id }],
        },
        members: {
          connect: createdMembers.slice(0, 3).map((m) => ({ id: m.id })),
        },
      },
    }),
    prisma.project.create({
      data: {
        title: "L'Amant - Réédition Premium",
        description:
          "Réédition de luxe avec illustrations et analyse littéraire",
        status: "BLOCKED",
        dueDate: new Date("2024-11-15"),
        columnId: kanbanColumns[2].id,
        authors: {
          connect: [{ id: createdAuthors[1].id }],
        },
        members: {
          connect: createdMembers.slice(2, 5).map((m) => ({ id: m.id })),
        },
      },
    }),
    prisma.project.create({
      data: {
        title: "Cent ans de solitude - Traduction Française",
        description: "Nouvelle traduction française du roman de García Márquez",
        status: "TODO",
        dueDate: new Date("2025-03-20"),
        columnId: kanbanColumns[0].id,
        authors: {
          connect: [{ id: createdAuthors[2].id }],
        },
        members: {
          connect: createdMembers.slice(1, 4).map((m) => ({ id: m.id })),
        },
      },
    }),
    prisma.project.create({
      data: {
        title: "Beloved - Édition Bilingue",
        description:
          "Édition bilingue anglais-français avec notes de traduction",
        status: "DONE",
        columnId: kanbanColumns[3].id,
        authors: {
          connect: [{ id: createdAuthors[3].id }],
        },
        members: {
          connect: createdMembers.slice(0, 2).map((m) => ({ id: m.id })),
        },
      },
    }),
    prisma.project.create({
      data: {
        title: "Kafka sur le rivage - Edition Jeunesse",
        description: "Adaptation pour jeunes lecteurs du roman de Murakami",
        status: "IN_PROGRESS",
        dueDate: new Date("2024-10-30"),
        columnId: kanbanColumns[1].id,
        authors: {
          connect: [{ id: createdAuthors[4].id }],
        },
        members: {
          connect: createdMembers.slice(3, 6).map((m) => ({ id: m.id })),
        },
      },
    }),
  ]);

  console.log(`✅ Created ${projects.length} projects`);

  // Crée des tâches pour les projets
  const tasks = await Promise.all([
    // Tâches pour "Les Misérables"
    prisma.projectTask.create({
      data: {
        title: "Révision du texte original",
        completed: true,
        projectId: projects[0].id,
      },
    }),
    prisma.projectTask.create({
      data: {
        title: "Rédaction des annotations historiques",
        completed: false,
        projectId: projects[0].id,
      },
    }),
    prisma.projectTask.create({
      data: {
        title: "Création de la préface",
        completed: false,
        projectId: projects[0].id,
      },
    }),
    // Tâches pour "L'Amant"
    prisma.projectTask.create({
      data: {
        title: "Sélection des illustrations",
        completed: true,
        projectId: projects[1].id,
      },
    }),
    prisma.projectTask.create({
      data: {
        title: "Relecture finale",
        completed: false,
        projectId: projects[1].id,
      },
    }),
    // Tâches pour "Cent ans de solitude"
    prisma.projectTask.create({
      data: {
        title: "Analyse du texte original",
        completed: false,
        projectId: projects[2].id,
      },
    }),
    prisma.projectTask.create({
      data: {
        title: "Recherche de traducteur",
        completed: false,
        projectId: projects[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} project tasks`);

  // Crée des champs personnalisés
  const customFields = await Promise.all([
    prisma.customField.create({
      data: {
        name: "Budget",
        value: "15000€",
        projectId: projects[0].id,
      },
    }),
    prisma.customField.create({
      data: {
        name: "Éditeur",
        value: "Gallimard",
        projectId: projects[0].id,
      },
    }),
    prisma.customField.create({
      data: {
        name: "Format",
        value: "Grand Format",
        projectId: projects[1].id,
      },
    }),
    prisma.customField.create({
      data: {
        name: "Tirage",
        value: "5000 exemplaires",
        projectId: projects[1].id,
      },
    }),
    prisma.customField.create({
      data: {
        name: "Langue source",
        value: "Espagnol",
        projectId: projects[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${customFields.length} custom fields`);

  // Crée des règles d'automatisation
  const rules = await Promise.all([
    prisma.rule.create({
      data: {
        name: "Déplacer vers Terminé quand toutes les tâches sont complétées",
        enabled: true,
        condition: {
          create: {
            type: "TASKS_COMPLETED",
            operator: "ALL_COMPLETED",
          },
        },
        action: {
          create: {
            type: "MOVE_TO_COLUMN",
            targetColumnId: kanbanColumns[3].id,
          },
        },
      },
    }),
    prisma.rule.create({
      data: {
        name: "Déplacer vers En Révision si date d'échéance proche",
        enabled: true,
        condition: {
          create: {
            type: "DUE_DATE",
            operator: "LESS_THAN",
            value: "7", // 7 jours
          },
        },
        action: {
          create: {
            type: "MOVE_TO_COLUMN",
            targetColumnId: kanbanColumns[2].id,
          },
        },
      },
    }),
    prisma.rule.create({
      data: {
        name: "Déplacer si budget défini",
        enabled: false,
        condition: {
          create: {
            type: "CUSTOM_FIELD",
            field: "Budget",
            operator: "IS_NOT_EMPTY",
          },
        },
        action: {
          create: {
            type: "MOVE_TO_COLUMN",
            targetColumnId: kanbanColumns[1].id,
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${rules.length} automation rules`);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
