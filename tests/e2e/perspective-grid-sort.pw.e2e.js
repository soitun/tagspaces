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
  getGridFileName,
  getGridFileSelector,
  takeScreenshot,
} from './general.helpers';

import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { closeWelcomePlaywright } from './welcome.helpers';
import { getDirEntries } from './perspective-grid.helpers';
import { stopServices } from '../setup-functions';

let s3ServerInstance;
let webServerInstance;
let minioServerInstance;

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

/*test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
});*/

test.beforeEach(async () => {
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
  await clickOn('[data-tid=gridPerspectiveSortMenu]');
});

// Scenarios for sorting files in grid perspective
test.describe('TST5003 - Testing sort files in the grid perspective [web,electron]', () => {
  test('TST10xx - Sort by name [web,electron]', async () => {
    // DESC
    await clickOn('[data-tid=gridPerspectiveSortByName]');
    let sorted = getDirEntries('byName', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name); //'sample_exif.jpg');
    }

    // ASC
    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortByName]');

    sorted = getDirEntries('byName', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name); //'sample.avif');
    }
  });

  test('TST10xx - Sort by size [web,electron]', async () => {
    await clickOn('[data-tid=gridPerspectiveSortBySize]');
    // DESC
    let sorted = getDirEntries('byFileSize', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name); //'sample.csv');
    }

    // ASC
    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortBySize]');
    sorted = getDirEntries('byFileSize', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name); //'sample.nef');
    }
  });

  test('TST10xx - Sort by date [web,electron]', async () => {
    await clickOn('[data-tid=gridPerspectiveSortByDate]');

    let sorted = getDirEntries('byDateModified', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }

    // ASC
    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortByDate]');

    sorted = getDirEntries('byDateModified', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }
  });

  test('TST10xx - Sort by extension [web,electron]', async () => {
    await clickOn('[data-tid=gridPerspectiveSortByExt]');
    let sorted = getDirEntries('byExtension', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }

    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortByExt]');
    sorted = getDirEntries('byExtension', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }
  });

  test('TST10xx - Sort by tags [web,electron]', async () => {
    await clickOn('[data-tid=gridPerspectiveSortByFirstTag]');
    let sorted = getDirEntries('byFirstTag', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }
    // ASC
    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortByFirstTag]');
    sorted = getDirEntries('byFirstTag', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }
  });
});
