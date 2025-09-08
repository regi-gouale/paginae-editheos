import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
