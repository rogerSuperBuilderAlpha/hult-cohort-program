import { seedComms } from "../src/lib/seed";

seedComms()
  .then(() => {
    console.log("Seeded Comms users + channels:");
    console.log("- demo@flexiflow.test / DemoPass1! (ADMIN)");
    console.log("- sam@flexiflow.test / SamPass1!");
    console.log("- guest@flexiflow.test / GuestPass1!");
    console.log("Channels: #general, #reviews, #setup, #announcements");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
