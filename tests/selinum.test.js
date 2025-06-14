const { Builder, By } = require('selenium-webdriver');
require('chromedriver');

(async function registerTest() {
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(/* headless options */).build();

  try {
    await driver.get('http://localhost:3000/public/register.html');

    // Fill in username and password
    await driver.findElement(By.id('regUsername')).sendKeys('testuser');
    await driver.findElement(By.id('regPassword')).sendKeys('123456');

    // Click the submit button (using form submit or button click)
    await driver.findElement(By.id('registerBtn')).click();

    // Optional: wait or check response/URL change
    await driver.sleep(2000);
    console.log("✅ Register test completed.");
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    await driver.quit();
  }
})();
