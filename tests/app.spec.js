const { test, expect } = require('@playwright/test');

test.describe('Click Challenge 100', () => {
  test.beforeEach(async ({ page }) => {
    // We assume the server is running on localhost:8080
    await page.goto('http://localhost:8080');
  });

  test('should allow a user to start the game and click 100 times', async ({ page }) => {
    // 1. Login
    const name = 'PlaywrightTester';
    await page.fill('#username', name);
    await page.click('#start-btn');

    // Check if greeting is correct
    const greeting = page.locator('#user-greeting');
    await expect(greeting).toHaveText(`หวัดดี ${name}!`);

    // 2. Click 100 times
    const clickBtn = page.locator('#click-btn');
    const counter = page.locator('#counter');

    // Rapidly click 100 times
    for (let i = 0; i < 100; i++) {
        await clickBtn.click();
    }

    // 3. Verify final state
    await expect(counter).toHaveText('100');
    
    // Reward container should be visible
    const rewardContainer = page.locator('#reward-container');
    await expect(rewardContainer).toBeVisible();

    // Congratulation text should contain the name
    const finalStats = page.locator('#final-stats');
    await expect(finalStats).toContainText(name);

    // Wait for leaderboard (it shows after 2 seconds)
    const statsContainer = page.locator('#stats-container');
    await expect(statsContainer).toBeVisible({ timeout: 5000 });

    // Leaderboard should contain our name
    const leaderboard = page.locator('#leaderboard-list');
    await expect(leaderboard).toContainText(name);
  });

  test('should reset the game', async ({ page }) => {
    await page.fill('#username', 'Resetter');
    await page.click('#start-btn');

    // Click a few times
    await page.click('#click-btn');
    await page.click('#click-btn');
    await expect(page.locator('#counter')).toHaveText('2');

    // Click 100 times to reach the end so reset button is visible
    for (let i = 0; i < 98; i++) {
        await page.click('#click-btn');
    }
    
    await expect(page.locator('#reward-container')).toBeVisible();

    // Click reset
    await page.click('#reset-btn');

    // Counter should be 0
    await expect(page.locator('#counter')).toHaveText('0');
    // Reward container should be hidden
    await expect(page.locator('#reward-container')).toBeHidden();
  });
});
