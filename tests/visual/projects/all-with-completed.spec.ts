import { visualTest, stateBuilder } from "../helpers/test-utils";

visualTest({
  name: "All projects view - with completed tasks",
  state: stateBuilder.withCompleted,
  url: { view: "project-all", workspace: "hobby" },
  screenshot: "all-projects-with-completed.png",
});
