import { visualTest, stateBuilder } from "../helpers/test-utils";

visualTest({
  name: "First perspective - full state",
  state: stateBuilder.full,
  url: { view: "perspective", perspective: "first", workspace: "personal" },
  screenshot: "first-full.png",
});
