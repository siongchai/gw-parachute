/**
 * Drives the running dev server with the local Chrome install and captures
 * screenshots of every screen at desktop / portrait / landscape sizes.
 *
 * Usage: node tools/shots.mjs
 */
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = "http://127.0.0.1:3000/";
const OUT = "tools/shots";

const VIEWPORTS = {
  desktop: { width: 1200, height: 900, deviceScaleFactor: 1 },
  portrait: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
  landscape: { width: 844, height: 390, deviceScaleFactor: 2, isMobile: true },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(page, text, tries = 20) {
  for (let i = 0; i < tries; i++) {
    const clicked = await page.evaluate((t) => {
      const el = [...document.querySelectorAll("button")].find((e) =>
        e.textContent.replace(/\s+/g, " ").trim().includes(t),
      );
      if (!el) return false;
      el.click();
      return true;
    }, text);
    if (clicked) {
      await sleep(350);
      return;
    }
    await sleep(300);
  }
  throw new Error(`button not found: ${text}`);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
});

for (const [name, vp] of Object.entries(VIEWPORTS)) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.goto(URL, { waitUntil: "networkidle0" });
  await sleep(700);

  await page.screenshot({ path: `${OUT}/${name}-menu.png` });

  await clickText(page, "HOW TO PLAY");
  await page.screenshot({ path: `${OUT}/${name}-howto.png` });
  await clickText(page, "OK, GOT IT!");

  await clickText(page, "HIGH SCORES");
  await page.screenshot({ path: `${OUT}/${name}-scores.png` });
  await clickText(page, "CLOSE");

  await clickText(page, "GAME A");
  await sleep(2500);
  await page.keyboard.down("ArrowRight");
  await sleep(700);
  await page.keyboard.up("ArrowRight");
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/${name}-play.png` });

  // Force a game over to capture the panel.
  await sleep(9000);
  await page.screenshot({ path: `${OUT}/${name}-play2.png` });

  await page.close();
  console.log("captured", name);
}

await browser.close();
