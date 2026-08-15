import puppeteer from "puppeteer-core";

const CHROME =
  process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "google-chrome";

const VIEWPORTS = [
  { name: "iphone15-pro-max-portrait", width: 430, height: 932 },
  { name: "iphone15-pro-max-landscape", width: 932, height: 430 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 3 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector(".handheld", { timeout: 15000 });

  const metrics = await page.evaluate(() => {
    const stage = document.querySelector(".stage");
    const handheld = document.querySelector(".handheld");
    const screen = document.querySelector(".screen");
    const faceplate = document.querySelector(".faceplate");
    const roundBtns = [...document.querySelectorAll(".round-btn")];

    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        w: Math.round(b.width),
        h: Math.round(b.height),
        top: Math.round(b.top),
        left: Math.round(b.left),
        bottom: Math.round(b.bottom),
        right: Math.round(b.right),
      };
    };

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      stage: r(stage),
      handheld: r(handheld),
      faceplate: r(faceplate),
      screen: r(screen),
      buttons: roundBtns.map(r),
      overflows: {
        stageH: stage ? stage.scrollHeight > stage.clientHeight : null,
        bodyH: document.body.scrollHeight > window.innerHeight,
      },
    };
  });

  console.log(JSON.stringify({ viewport: vp.name, metrics }, null, 2));
  await page.screenshot({ path: `tools/${vp.name}.png`, fullPage: false });
  await page.close();
}

await browser.close();
