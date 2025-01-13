/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation,
  createS3Location,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  frameLocator,
  getGridFileSelector,
  isDisplayed,
  takeScreenshot,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { openContextEntryMenu, toContainTID } from './test-utils';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { stopServices } from '../setup-functions';

let s3ServerInstance;
let webServerInstance;
let minioServerInstance;

test.beforeAll(async ({ s3Server, webServer, minioServer }) => {
  s3ServerInstance = s3Server;
  webServerInstance = webServer;
  minioServerInstance = minioServer;
  await startTestingApp();
  // await clearDataStorage();
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
  await closeWelcomePlaywright();
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else if (global.isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST69 - Markdown editor', () => {
  test('TST6901 - Open and render md file [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.md'),
      'fileMenuOpenFile',
    );
    await expect
      .poll(
        async () => {
          const fLocator = await frameLocator();
          const bodyTxt = await fLocator.locator('body').innerText();
          return toContainTID(bodyTxt);
        },
        {
          message: 'make sure bodyTxt contain etete&5435', // custom error message
          // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
          timeout: 10000,
        },
      )
      .toBe(true);
  });

  test('TST6902 - Open settings [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.md'),
      'fileMenuOpenFile',
    );
    await clickOn('[data-tid=fileContainerEditFile]');
    // Access the iframe
    const iframeElement = await global.client.waitForSelector('iframe');
    const frame = await iframeElement.contentFrame();

    await frame.click('[data-tid=mdEditorMenuTID]');
    await frame.click('[data-tid=settingsTID]');

    let settingsExists = await isDisplayed(
      '#md-editor-settings-title',
      true,
      2000,
      frame,
    );
    expect(settingsExists).toBeTruthy();

    await frame.click('[data-tid=settingsOkTID]');

    settingsExists = await isDisplayed(
      '#md-editor-settings-title',
      false,
      2000,
      frame,
    );
    expect(settingsExists).toBeTruthy();
  });
});
