import { prisma } from "db/client";

async function main() {
  // 1. Create User
  const user = await prisma.user.create({
    data: {
      email: "siddhant@test.com",
      password: "123456",
    },
  });

  console.log("USER:", user);


  // 2. Create Organization
  const organization = await prisma.organization.create({
    data: {
      name: "Test Organization",
      description: "Our first Trello organization",
    },
  });

  console.log("ORGANIZATION:", organization);


  // 3. Create Membership
  // Connects User ↔ Organization
  const membership = await prisma.membership.create({
    data: {
      userId: user.id,
      organizationId: organization.id,
      role: "ADMIN",
    },
  });

  console.log("MEMBERSHIP:", membership);


  // 4. Create Board
  // Organization → Board
  const board = await prisma.board.create({
    data: {
      name: "Development Board",
      description: "Development tasks",
      organizationId: organization.id,
    },
  });

  console.log("BOARD:", board);


  // 5. Create Section
  // Board → Section
  const section = await prisma.section.create({
    data: {
      title: "In Progress",
      order: 1000,
      boardId: board.id,
    },
  });

  console.log("SECTION:", section);


  // 6. Create Issue
  // Board → Section → Issue
  const issue = await prisma.issue.create({
    data: {
      title: "Fix login bug",
      description: "Fix the authentication issue",
      order: 1000,
      boardId: board.id,
      sectionId: section.id,
    },
  });

  console.log("ISSUE:", issue);


  // 7. Assign User to Issue
  // User ↔ Issue
  const assignment = await prisma.issuesMapping.create({
    data: {
      userId: user.id,
      issueId: issue.id,
    },
  });

  console.log("ISSUE ASSIGNMENT:", assignment);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });