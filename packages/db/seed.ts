import { prisma } from "./index";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database cleanly...");

  const hash = async (p: string) => bcrypt.hash(p, 10);

  // Clean old data
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const [alice, bob, charlie, dan] = await Promise.all([
    prisma.user.create({
      data: { email: "alice@dev.com", username: "alice", password: await hash("password123") },
    }),
    prisma.user.create({
      data: { email: "bob@dev.com", username: "bob", password: await hash("password123") },
    }),
    prisma.user.create({
      data: { email: "charlie@dev.com", username: "charlie", password: await hash("password123") },
    }),
    prisma.user.create({
      data: { email: "dan@dev.com", username: "dan", password: await hash("password123") },
    }),
  ]);

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: "Project Alpha",
      description: "Main product development org",
      memberships: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bob.id, role: "MEMBER" },
          { userId: charlie.id, role: "MEMBER" },
          { userId: dan.id, role: "MEMBER" },
        ],
      },
    },
  });

  async function seedBoard(name: string, desc: string, issueMap: Record<string, string[]>) {
    const board = await prisma.board.create({
      data: { name, description: desc, organizationId: org.id },
    });

    const sectionNames = Object.keys(issueMap);
    for (let i = 0; i < sectionNames.length; i++) {
      const sectionTitle = sectionNames[i]!;
      const section = await prisma.section.create({
        data: { title: sectionTitle, order: (i + 1) * 1000, boardId: board.id },
      });

      const issuesInSection = issueMap[sectionTitle]!;
      for (let j = 0; j < issuesInSection.length; j++) {
        await prisma.issue.create({
          data: {
            title: issuesInSection[j]!,
            order: (j + 1) * 1000,
            boardId: board.id,
            sectionId: section.id,
          },
        });
      }
    }
    return board;
  }

  await seedBoard("Frontend Dev", "React / TypeScript UI layer", {
    "Todo": ["Setup Vite + React", "Add routing with React Router", "Build auth page"],
    "In Progress": ["Org page layout", "Board kanban view"],
    "Done": ["Project scaffold", "ESLint + Prettier config"],
  });

  await seedBoard("Backend Dev", "Express API + Prisma ORM", {
    "Todo": ["Add rate limiting", "Write API tests", "Add refresh tokens"],
    "In Progress": ["Auth endpoints", "Board CRUD"],
    "Done": ["DB schema design", "Prisma migrations", "JWT middleware"],
  });

  await seedBoard("UI Design", "Figma designs and component specs", {
    "Todo": ["Design invite flow", "Mobile responsive audit"],
    "In Progress": ["Dark theme system", "Issue detail panel"],
    "Done": ["Color palette defined", "Typography scale"],
  });

  await seedBoard("DevOps", "CI/CD, infra and deployments", {
    "Todo": ["Setup staging env", "Add Docker compose", "Configure CORS for prod"],
    "In Progress": ["GitHub Actions pipeline"],
    "Done": ["Neon DB setup", "Monorepo turbo config"],
  });

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
