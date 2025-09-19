import { test, expect } from "@playwright/test";
import { TaskManagerPage } from "./pages/TaskManagerPage";

test.describe("Perspective Navigation", () => {
  let taskManager: TaskManagerPage;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    await taskManager.goto();
  });

  test("Switch between perspectives using sidebar", async () => {
    // Switch to First perspective
    await taskManager.switchPerspective("First");

    // Verify URL updated
    await taskManager.expectUrlToContain([
      "view=perspective",
      "perspective=first",
    ]);

    // Switch to Next perspective
    await taskManager.switchPerspective("Next");

    // Verify URL updated
    await taskManager.expectUrlToContain(["perspective=next"]);

    // Switch to Someday perspective
    await taskManager.switchPerspective("Someday");

    // Verify URL updated
    await taskManager.expectUrlToContain(["perspective=someday"]);

    // Go back to Inbox
    await taskManager.switchPerspective("Inbox");

    // Verify URL updated
    await taskManager.expectUrlToContain(["perspective=inbox"]);
  });

  test("Switch to All view", async () => {
    // Switch to All view
    await taskManager.switchToAllView();

    // Verify URL updated to show all view
    await taskManager.expectUrlToContain(["view=all"]);

    // Verify perspective badges are visible in All view
    // In the All view, tasks show their perspective assignment
    await taskManager.expectBadgesVisible();
  });

  test("Task filtering by perspective", async () => {
    // Create a task in Inbox
    await taskManager.createTask("Inbox Task");

    // Navigate to Next perspective
    await taskManager.switchPerspective("Next");

    // Create a task in Next
    await taskManager.createTask("Next Task");

    // Go back to Inbox
    await taskManager.switchPerspective("Inbox");

    // Verify only Inbox task is visible
    expect(await taskManager.taskExists("Inbox Task")).toBe(true);
    expect(await taskManager.taskExists("Next Task")).toBe(false);

    // Go to Next
    await taskManager.switchPerspective("Next");

    // Verify only Next task is visible
    expect(await taskManager.taskExists("Next Task")).toBe(true);
    expect(await taskManager.taskExists("Inbox Task")).toBe(false);

    // Go to All view
    await taskManager.switchToAllView();

    // Verify both tasks are visible
    expect(await taskManager.taskExists("Inbox Task")).toBe(true);
    expect(await taskManager.taskExists("Next Task")).toBe(true);
  });
});
