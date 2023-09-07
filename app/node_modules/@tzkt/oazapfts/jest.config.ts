import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  rootDir: "src",
  restoreMocks: true,
  testTimeout: 60000,
};

export default config;
