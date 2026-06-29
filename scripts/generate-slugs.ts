import { prisma } from "@/lib/prisma";
import { generateAuthorSlug, generateMemberSlug } from "@/lib/utils";

async function generateSlugsForExistingData() {
  console.log("Début de la génération de slugs pour les données existantes...");

  try {
    // Générer des slugs pour les auteurs qui n'en ont pas
    const authorsWithoutSlug = await prisma.author.findMany({
      where: {
        slug: null,
      },
    });

    console.log(`Trouvé ${authorsWithoutSlug.length} auteurs sans slug`);

    for (const author of authorsWithoutSlug) {
      let slug = generateAuthorSlug(author.firstName, author.lastName);

      // Vérifier l'unicité et générer un nouveau slug si nécessaire
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        const existingAuthor = await prisma.author.findUnique({
          where: { slug },
        });

        if (!existingAuthor) {
          isUnique = true;
        } else {
          slug = generateAuthorSlug(author.firstName, author.lastName);
          attempts++;
        }
      }

      if (isUnique) {
        await prisma.author.update({
          where: { id: author.id },
          data: { slug },
        });
        console.log(
          `Slug généré pour l'auteur ${author.firstName} ${author.lastName}: ${slug}`,
        );
      } else {
        console.error(
          `Impossible de générer un slug unique pour l'auteur ${author.firstName} ${author.lastName}`,
        );
      }
    }

    // Générer des slugs pour les membres qui n'en ont pas
    const membersWithoutSlug = await prisma.member.findMany({
      where: {
        slug: null,
      },
    });

    console.log(`Trouvé ${membersWithoutSlug.length} membres sans slug`);

    for (const member of membersWithoutSlug) {
      let slug = generateMemberSlug(member.name);

      // Vérifier l'unicité et générer un nouveau slug si nécessaire
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        const existingMember = await prisma.member.findUnique({
          where: { slug },
        });

        if (!existingMember) {
          isUnique = true;
        } else {
          slug = generateMemberSlug(member.name);
          attempts++;
        }
      }

      if (isUnique) {
        await prisma.member.update({
          where: { id: member.id },
          data: { slug },
        });
        console.log(`Slug généré pour le membre ${member.name}: ${slug}`);
      } else {
        console.error(
          `Impossible de générer un slug unique pour le membre ${member.name}`,
        );
      }
    }

    // Générer des slugs pour les projets qui n'en ont pas
    const projectsWithoutSlug = await prisma.project.findMany({
      where: {
        slug: null,
      },
    });

    console.log(`Trouvé ${projectsWithoutSlug.length} projets sans slug`);
    for (const project of projectsWithoutSlug) {
      let slug = project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 50); // Limiter la longueur du slug à 50 caractères

      // Vérifier l'unicité et générer un nouveau slug si nécessaire
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        const existingProject = await prisma.project.findUnique({
          where: { slug },
        });

        if (!existingProject) {
          isUnique = true;
        } else {
          slug = `${slug}-${Math.floor(Math.random() * 1000)}`; // Ajouter un suffixe aléatoire
          attempts++;
        }
      }

      if (isUnique) {
        await prisma.project.update({
          where: { id: project.id },
          data: { slug },
        });
        console.log(`Slug généré pour le projet ${project.title}: ${slug}`);
      } else {
        console.error(
          `Impossible de générer un slug unique pour le projet ${project.title}`,
        );
      }
    }

    console.log("Migration des slugs terminée avec succès!");
  } catch (error) {
    console.error("Erreur lors de la génération des slugs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
generateSlugsForExistingData();
