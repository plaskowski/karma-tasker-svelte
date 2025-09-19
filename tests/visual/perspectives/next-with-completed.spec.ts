import { visualTest, stateBuilder } from "../helpers/test-utils";

visualTest({
  name: "Next perspective - with completed tasks",
  state: stateBuilder.withCompleted,
  url: { view: "perspective", perspective: "next", workspace: "hobby" },
  screenshot: "next-with-completed.png",
});
