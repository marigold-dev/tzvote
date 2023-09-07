import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.marigold.tzvote",
  appName: "TzVote",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
