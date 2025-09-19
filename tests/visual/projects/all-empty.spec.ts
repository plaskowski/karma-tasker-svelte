import { visualTest, stateBuilder } from "../helpers/test-utils";

visualTest({
  name: "All Projects - empty state",
  state: stateBuilder.empty,
  url: { view: "project-all" },
  screenshot: "all-empty.png",
});
