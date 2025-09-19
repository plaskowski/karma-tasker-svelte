import { visualTest, stateBuilder } from "../helpers/test-utils";

visualTest({
  name: "All Projects - full state",
  state: stateBuilder.full,
  url: { view: "project-all" },
  screenshot: "all-full.png",
});
