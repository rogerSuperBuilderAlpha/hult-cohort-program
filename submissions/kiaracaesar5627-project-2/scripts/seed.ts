import { seedComms } from "../src/lib/seed";

seedComms()
  .then(() => {
    console.log("Seeded Huddle users + channels:");
    console.log("- demo@flexiflow.test / DemoPass1! (ADMIN)");
    console.log("- sam@flexiflow.test / SamPass1!");
    console.log("- guest@flexiflow.test / GuestPass1!");
    console.log("Channels: General, Reviews, Setup, Announcements");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
