/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { extractFileNameWithoutExt } from '@tagspaces/tagspaces-common/paths';
import { test, expect } from './fixtures';
import { defaultLocationName } from './location.helpers';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
  selectorFile,
  setInputKeys,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { stopServices } from '../setup-functions';

let s3ServerInstance;
let webServerInstance;
let minioServerInstance;
const testFileName = 'sample.pdf';
const isMac = /^darwin/.test(process.platform);

test.beforeAll(async ({ s3Server, webServer, minioServer }) => {
  s3ServerInstance = s3Server;
  webServerInstance = webServer;
  minioServerInstance = minioServer;
  if (global.isS3) {
    await startTestingApp();
    await closeWelcomePlaywright();
  } else {
    await startTestingApp('extconfig.js');
  }
});

test.afterAll(async () => {
  await stopServices(s3ServerInstance, webServerInstance, minioServerInstance);
  await testDataRefresh(s3ServerInstance);
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await clearDataStorage();
});

test.beforeEach(async () => {
  // if (global.isMinio) {
  //   await createPwMinioLocation('', defaultLocationName, true);
  // } else {
  //   await createPwLocation(defaultLocationPath, defaultLocationName, true);
  // }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST13 - Settings Key Bindings [electron]', () => {
  test('TST1311 - Test show search [electron]', async () => {
    await clickOn(selectorFile);
    if (isMac) {
      await global.client.keyboard.press('Meta+KeyK');
    } else {
      await global.client.keyboard.press('Control+KeyK');
    }
    await expectElementExist('#textQuery', true, 2000);
  });

  test('TST1312 - Test rename file [electron]', async () => {
    const newTitle = 'renamed';
    await clickOn(getGridFileSelector(testFileName));
    await global.client.keyboard.press('F2');
    //await setInputValue('[data-tid=renameEntryDialogInput] input', newTitle);
    const oldName = await setInputKeys('renameEntryDialogInput', newTitle);
    await clickOn('[data-tid=confirmRenameEntry]');
    //await expectElementExist('[data-tid=detailsTabTID]', true);
    await expectElementExist(getGridFileSelector(newTitle + '.pdf'));
    //rename back
    const name = extractFileNameWithoutExt(oldName, '/');
    await clickOn(getGridFileSelector(newTitle + '.pdf'));
    await global.client.keyboard.press('F2');
    await setInputKeys('renameEntryDialogInput', name);
    await clickOn('[data-tid=confirmRenameEntry]');
    await expectElementExist(getGridFileSelector(oldName));
  });

  test('TST1313 - Test open file [electron]', async () => {
    await clickOn(getGridFileSelector(testFileName));
    await global.client.keyboard.press('Enter');
    await expectElementExist('[data-tid=detailsTabTID]', true);
  });

  test('TST1315 - Test delete file [electron]', async () => {
    await clickOn(getGridFileSelector(testFileName));
    if (isMac) {
      await global.client.keyboard.press('F8');
    } else {
      await global.client.keyboard.press('Delete');
    }
    await clickOn('[data-tid=confirmDeleteFileDialog]');
    await expectElementExist(getGridFileSelector(testFileName), false);
  });

  test('TST1316 - Show help and feedback panel in the left [electron]', async () => {
    await clickOn(getGridFileSelector('sample.txt'));
    await global.client.keyboard.press('F1');
    await expectElementExist('[data-tid=aboutDialog]', true);
  });

  test.skip('TST1301 - Change a key binding [electron]', async () => {});

  test.skip('TST1302 - Test select all [electron]', async () => {});

  test.skip('TST1303 - Test reload of document [electron]', async () => {});

  test.skip('TST1304 - Test close document [electron]', async () => {});

  test.skip('TST1305 - Test document properties [electron]', async () => {});

  test.skip('TST1306 - Test save document [electron]', async () => {});

  test.skip('TST1307 - Test show next document [electron]', async () => {});

  test.skip('TST1308 - Test show previous document [electron]', async () => {});

  test.skip('TST1309 - Test edit document [electron]', async () => {});

  test.skip('TST1310 - Test add / remove tags [electron]', async () => {});

  test.skip('TST1314 - Test open file externally [electron]', async () => {});
});
