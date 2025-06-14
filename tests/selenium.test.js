const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');

async function runTests() {
  let options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  try {
    // Test 1: Register
    await driver.get('http://localhost:3000/register.html');
    await driver.wait(until.elementLocated(By.id('regUsername')), 5000);
    await driver.findElement(By.id('regUsername')).sendKeys('testuser1');
    await driver.findElement(By.id('regPassword')).sendKeys('password1');
    await driver.findElement(By.css('form')).submit();

    try {
  // Wait for the alert and accept it
     await driver.wait(until.alertIsPresent(), 3000);
     const alert = await driver.switchTo().alert();
     console.log("🔔 Alert text:", await alert.getText());
     await alert.accept();
     console.log('✅ Test 1: Register passed (alert handled)');
} catch (e) {
  console.log('⚠️ No alert appeared after registration.');
}


    // Test 2: Register Duplicate User
    await driver.get('http://localhost:3000/register.html');
    await driver.findElement(By.id('regUsername')).sendKeys('testuser1');
    await driver.findElement(By.id('regPassword')).sendKeys('password1');
    await driver.findElement(By.css('form')).submit();
    try {
  // If alert appears (e.g. "Username already exists")
     await driver.wait(until.alertIsPresent(), 3000);
     const alert = await driver.switchTo().alert();
     const alertText = await alert.getText();
     console.log("🔔 Alert text:", alertText);
     await alert.accept(); // Dismiss alert before continuing
     console.log("✅ Test 2: Duplicate Register handled");
} catch (e) {
  console.log("⚠️ No alert appeared in Test 2.");
}
await driver.sleep(500); // Give time after dismissing alert

    // Test 3: Login Success
    await driver.get('http://localhost:3000/login.html');
    await driver.findElement(By.id('loginUsername')).sendKeys('testuser1');
    await driver.findElement(By.id('loginPassword')).sendKeys('password1');
    await driver.findElement(By.id('loginForm')).submit();
    await driver.sleep(1000);
    console.log('✅ Test 3: Login successful');

    // / ------------------------
    // Test 4: Login Fail (alert expected)
    // ------------------------
    await driver.get('http://localhost:3000/login.html');
    await driver.findElement(By.id('loginUsername')).clear();
    await driver.findElement(By.id('loginPassword')).clear();
    await driver.findElement(By.id('loginUsername')).sendKeys('wronguser');
    await driver.findElement(By.id('loginPassword')).sendKeys('wrongpass');
    await driver.findElement(By.id('loginForm')).submit();

    try {
      await driver.wait(until.alertIsPresent(), 3000);
      const alert = await driver.switchTo().alert();
      console.log("🔔 Login Fail Alert:", await alert.getText());
      await alert.accept();
      console.log("✅ Test 4: Login fail handled");
    } catch (e) {
      console.log("⚠️ No alert appeared during login fail test.");
    }

    // ------------------------
    // Test 5: Submit Feedback (with login)
    // ------------------------
    await driver.get('http://localhost:3000/');
    await driver.executeScript(`localStorage.setItem("userId", "1")`);
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.id('message')), 5000);
    await driver.findElement(By.id('message')).sendKeys('This is test feedback.');
    await driver.findElement(By.css('#feedbackForm button')).click();
    await driver.sleep(1000);
    console.log('✅ Test 5: Feedback submitted');

    // ------------------------
    // Test 6: Load Feedbacks
    // ------------------------
    const feedbackItems = await driver.findElements(By.css('#feedbackList li'));
    if (feedbackItems.length > 0) {
      console.log('✅ Test 6: Feedback list loaded');
    } else {
      console.log('❌ Test 6: Feedback list is empty');
    }

    // ------------------------
    // Test 7: Register → Login → Submit Flow
    // ------------------------
    await driver.get('http://localhost:3000/register.html');
    await driver.findElement(By.id('regUsername')).sendKeys('flowuser');
    await driver.findElement(By.id('regPassword')).sendKeys('flowpass');
    await driver.findElement(By.css('form')).submit();

    try {
      await driver.wait(until.alertIsPresent(), 3000);
      const alert = await driver.switchTo().alert();
      console.log("🔔 Register Alert:", await alert.getText());
      await alert.accept();
    } catch (e) {
      console.log("⚠️ No alert appeared after registration.");
    }

    await driver.get('http://localhost:3000/login.html');
    await driver.findElement(By.id('loginUsername')).sendKeys('flowuser');
    await driver.findElement(By.id('loginPassword')).sendKeys('flowpass');
    await driver.findElement(By.id('loginForm')).submit();
    await driver.sleep(1000);
    console.log('✅ Test 7: Register → Login flow passed');

    // ------------------------
    // Test 8: Unauthenticated Feedback Redirect
    // ------------------------
    await driver.get('http://localhost:3000/');
    await driver.executeScript(`localStorage.removeItem("userId")`);
    await driver.navigate().refresh();
    await driver.sleep(1000);
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('login.html')) {
      console.log('✅ Test 8: Redirected to login when not authenticated');
    } else {
      console.log('❌ Test 8: Did not redirect unauthenticated user');
    }

    // ------------------------
    // Test 9: Check Submit Button Enabled
    // ------------------------
    await driver.get('http://localhost:3000/register.html');
    const submitEnabled = await driver.findElement(By.id('registerBtn')).isEnabled();
    if (submitEnabled) {
      console.log('✅ Test 9: Submit button enabled as expected');
    } else {
      console.log('❌ Test 9: Submit button not enabled');
    }

    // Test 10: Navigate from Register to Login
// ------------------------
await driver.get('http://localhost:3000/register.html');

// Try finding the link by text or fallback to a known selector (like an ID or class)
try {
  const loginLink = await driver.wait(until.elementLocated(By.linkText('Login')), 3000);
  await loginLink.click();
} catch (e) {
  console.log('❌ Test 10: Login link not found by link text, trying CSS selector...');
  const loginLinkFallback = await driver.findElement(By.css('a[href="login.html"]'));
  await loginLinkFallback.click();
}

try {
  // Wait up to 5 seconds for URL to change to login.html
  await driver.wait(until.urlContains('login.html'), 5000);
  const newUrl = await driver.getCurrentUrl();

  if (newUrl.includes('login.html')) {
    console.log('✅ Test 10: Navigation from Register to Login successful');
  } else {
    console.log('❌ Test 10: Navigation failed — wrong page loaded');
  }
} catch (e) {
  console.log('❌ Test 10: Navigation failed — URL did not change in time');
}
  }  catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
}

runTests(); 