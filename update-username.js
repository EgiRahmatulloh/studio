const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateUsernames() {
  try {
    // Get all users without username
    const usersWithoutUsername = await prisma.user.findMany({
      where: {
        username: null,
      },
    });

    console.log(`Found ${usersWithoutUsername.length} users without username`);

    // Update each user with a username based on their email
    for (const user of usersWithoutUsername) {
      const username = user.email.split("@")[0]; // Use part before @ as username

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { username: username },
        });
        console.log(`Updated user ${user.email} with username: ${username}`);
      } catch (error) {
        // If username already exists, add a number
        let counter = 1;
        let newUsername = `${username}${counter}`;

        while (true) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { username: newUsername },
            });
            console.log(
              `Updated user ${user.email} with username: ${newUsername}`
            );
            break;
          } catch (err) {
            counter++;
            newUsername = `${username}${counter}`;
          }
        }
      }
    }

    console.log("Username update completed!");
  } catch (error) {
    console.error("Error updating usernames:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsernames();
