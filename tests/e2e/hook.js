/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import pathLib from 'path';
import fse from 'fs-extra';
import { uploadFile } from '../s3rver/S3DataRefresh';

// Spectron API https://github.com/electron/spectron
// Webdriver.io http://webdriver.io/api.html

export const delay = (time) =>
  new Promise((resolve) => setTimeout(resolve, time));

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export function writeFile(filePath, fileContent) {
  fse.writeFileSync(filePath, fileContent);
}
export function checkFileExist(filePath) {
  return fse.existsSync(filePath);
}
// use this pause only for visual debuging on places where you want to see the result after a given operation
// global.msDebugPause = 0;

// the default timeout before starting every test
// global.msPause = 3000;

/**
 * https://github.com/microsoft/playwright/issues/18041
 * lsof -i :49352
 * pid: number
 * Returns: boolean true if the process was started by playwright.
 */
/*export const wasProcessStartedByPlaywright = (pid) => {
  // get parent tree
  const tree = execSync(`pstree -s -h -p -t -c -p ${pid}`)
    .toString()
    .trim();

  // check if any of the parents has a command that contains the string "playwright"
  const hasPlaywright = tree.includes('playwright');

  console.log(`Process ${pid} was started by Playwright: ${hasPlaywright}`);

  return hasPlaywright;
};*/

export async function clearLocalStorage() {
  /*if (!(await clearStorage())) {
    // TODO session is not implemented https://github.com/electron-userland/spectron/issues/117
    // await global.app.webContents.session.clearStorageData();
    global.app.webContents.reload();
  }*/
  if (global.isWeb) {
    const windowHandle = await global.client.evaluateHandle(() => window);
    const title = await global.client.evaluateHandle(() => document.title);
    windowHandle.history.pushState('', title, windowHandle.location.pathname);
  } else {
    await global.app.webContents.executeJavaScript(
      "window.history.pushState('', document.title, window.location.pathname);localStorage.clear()",
    );
    global.app.webContents.reload();
  }
  // browser.clearLocalStorage();
  // global.app.client.localStorage('DELETE');
  // global.app.client.reload(false);
}

export async function copyExtConfig(extconfig = 'extconfig-with-welcome.js') {
  let srcDir;
  if (global.isWeb) {
    srcDir = pathLib.join(
      __dirname,
      '..',
      '..',
      'scripts',
      'web' + (global.isS3 ? 's3' : '') + extconfig,
    );

    if (!fse.existsSync(srcDir)) {
      srcDir = pathLib.join(
        __dirname,
        '..',
        '..',
        'scripts',
        (global.isS3 ? 's3' : '') + extconfig,
      );
    }
    if (!fse.existsSync(srcDir)) {
      srcDir = pathLib.join(__dirname, '..', '..', 'scripts', extconfig);
    }
  } else {
    srcDir = pathLib.join(
      __dirname,
      '..',
      '..',
      'scripts',
      (global.isS3 ? 's3' : '') + extconfig,
    );
    if (!fse.existsSync(srcDir)) {
      srcDir = pathLib.join(__dirname, '..', '..', 'scripts', extconfig);
    }
  }
  const destDir = pathLib.join(
    __dirname,
    '..',
    '..',
    global.isWeb ? 'web' : 'release/app/dist/renderer',
    'extconfig.js',
  );
  await fse.copy(srcDir, destDir);
}

export async function removeExtConfig() {
  if (!global.isWeb) {
    await fse.remove(
      pathLib.join(
        __dirname,
        '..',
        '..',
        global.isWeb ? 'web' : 'release/app/dist/renderer',
        'extconfig.js',
      ),
    );
  }
}

const waitForMainMessage = (electronApp, messageId) => {
  return electronApp.evaluate(({ ipcMain }, messageId) => {
    return new Promise((resolve) => {
      ipcMain.once(messageId, () => resolve());
    });
  }, messageId);
};

const waitForAppLoaded = async (electronApp) => {
  await waitForMainMessage(electronApp, 'startup-finished');
};

export async function startTestingApp(extconfig) {
  if (extconfig) {
    await copyExtConfig(extconfig);
  } else {
    await removeExtConfig();
  }
  const chromeDriverArgs = [
    // '--disable-gpu',
    '--disable-infobars',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--window-size=1920,1080',
  ];
  if (global.isHeadlessMode) {
    chromeDriverArgs.push('--headless');
  }

  if (global.isWeb) {
    const { webkit, chromium } = require('playwright');
    global.app = await chromium.launch({
      headless: global.isHeadlessMode,
      slowMo: 50,
    }); //browser

    global.context = await global.app.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    global.client = await global.context.newPage(); //page
    await global.client.goto('http://localhost:8000');
    // await global.client.screenshot({ path: `example.png` });
    // await global.client.close();
  } else {
    //if (global.isPlaywright) {
    const { _electron: electron } = require('playwright');
    // Launch Electron app.
    global.app = await electron.launch({
      args: [
        pathLib.join(
          __dirname,
          '..',
          '..',
          'release',
          'app',
          'dist',
          'main',
          'main.js',
        ),
        // `--user-data-dir=${tempDir.path}`,
        '--integration-testing',
        '--no-sandbox',
        '--whitelisted-ips',
        // '--enable-logging', // after enabling cmd windows appears in Windows
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--disable-dev-shm-usage',
      ],
      bypassCSP: true,
      env: {
        // ...process.env,     // Preserve existing environment variables
        ELECTRON_ENABLE_LOGGING: true,
        ELECTRON_ENABLE_STACK_DUMPING: true,
        // NODE_ENV: 'test'
      },
    });
    const startupPromise = waitForAppLoaded(global.app);
    const appPath = await global.app.evaluate(async ({ app }) => {
      // This runs in the main Electron process, parameter here is always
      // the result of the require('electron') in the main app script.
      return app.getAppPath();
    });
    console.log('appPath:' + appPath);
    global.app.on('console', (msg) => {
      console.log(`[Electron Main] ${msg.type()}: ${msg.text()}`);
    });

    // Get the Electron context.
    global.context = await global.app.context();
    await global.app.waitForEvent('window');
    // Get the first window that the app opens, wait if necessary.
    global.client = await global.app.firstWindow();
    // global.session = await global.client.context().newCDPSession(global.client);
    // Setting the viewport size helps keep test environments consistent.
    await global.client.setViewportSize({ width: 1920, height: 1080 }); //{width: 1200,height: 800} ({ width: 800, height: 600 });
    await global.client.waitForLoadState('load'); //'domcontentloaded'); //'networkidle');

    if (process.env.SHOW_CONSOLE) {
      // Direct Electron console to Node terminal.
      global.client.on('console', console.debug);
    }
    await startupPromise;
  }
}

export async function stopApp() {
  if (global.isWeb) {
    await global.context.close();
    // await global.client.closeWindow();
  } else if (global.app) {
    // global.isPlaywright &&
    await global.app.close();
  }
}

export async function testDataRefresh(s3ServerInstance) {
  if (global.isS3) {
    /*if(s3ServerInstance) {
      s3ServerInstance.reset();
     await uploadTestDirectory();
    }*/
  } else {
    await deleteTestData();
    const src = pathLib.join(
      __dirname,
      '..',
      'testdata',
      'file-structure',
      'supported-filestypes',
    );
    const dst = pathLib.join(__dirname, '..', 'testdata-tmp', 'file-structure');
    let newPath = pathLib.join(dst, pathLib.basename(src));
    await fse.copy(src, newPath); //, { overwrite: true });
  }
}

export async function deleteTestData() {
  await fse.emptyDir(
    pathLib.join(
      __dirname,
      '..',
      'testdata-tmp',
      'file-structure',
      'supported-filestypes',
    ),
  );
}

export async function createFile(
  fileName = 'empty_file.html',
  fileContent = undefined,
  rootFolder = 'empty_folder',
) {
  const filePath = pathLib.join(
    __dirname,
    '..',
    'testdata-tmp',
    'file-structure',
    'supported-filestypes',
    rootFolder,
    fileName,
  );
  if (global.isS3) {
    await uploadFile(filePath, fileContent || 'test content');
  } else {
    try {
      if (fileContent) {
        await fse.outputFile(filePath, fileContent);
      } else {
        await fse.createFile(filePath);
        console.log('Empty file created!');
      }
    } catch (err) {
      console.error(err);
    }
  }
}
