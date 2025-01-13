/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import {
  defaultLocationPath,
  defaultLocationName,
  deleteFileFromMenu,
  createPwMinioLocation,
  createPwLocation,
  createS3Location,
} from './location.helpers';
import {
  clickOn,
  expectAllFileSelected,
  expectElementExist,
  expectElementSelected,
  expectMetaFilesExist,
  getGridCellClass,
  getGridFileName,
  getGridFileSelector,
  openFile,
  selectAllFiles,
  selectFilesByID,
  selectorFile,
  selectorFolder,
  selectRowFiles,
  setInputKeys,
  setSettings,
  takeScreenshot,
} from './general.helpers';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';
import {
  AddRemovePropertiesTags,
  getPropertiesFileName,
} from './file.properties.helpers';
import { createFile, startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { openContextEntryMenu } from './test-utils';
import { stopServices } from '../setup-functions';
import { dataTidFormat } from '../../src/renderer/services/test';

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
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await testDataRefresh(s3ServerInstance);
  await clearDataStorage();
});

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
});

test.describe('TST50 - Perspective Grid', () => {
  test('TST5002 - Open file with click [web,electron]', async () => {
    // await searchEngine('txt'); //testTestFilename);
    const fileName = 'sample.txt';
    await openFile(fileName, 'showPropertiesTID');
    // const firstFileName = await getGridFileName(0);
    /*await clickOn(getGridFileSelector(fileName));
    await expectElementExist('[data-tid=detailsTabTID]', true, 5000);
    await clickOn('[data-tid=detailsTabTID]', 8000);*/
    // Toggle Properties
    //await clickOn('[data-tid=fileContainerToggleProperties]');
    const propsFileName = await getPropertiesFileName();
    expect(fileName).toBe(propsFileName);
    // await checkFilenameForExist(testTestFilename);
  });

  test('TST5004 - Select-deselect all files [web,electron]', async () => {
    await selectAllFiles();
    await expectAllFileSelected(true);
    await selectAllFiles();
    await expectAllFileSelected(false);
  });

  // This scenario includes "Add tags" && "Remove tags" to be fulfilled
  test('TST5005 - Add/Remove tags from selected files [web,electron]', async () => {
    let selectedIds = await selectRowFiles([0, 1, 2]);

    const tags = ['test-tag1', 'test-tag2'];
    await AddRemoveTagsToSelectedFiles('grid', tags);

    for (let i = 0; i < tags.length; i++) {
      await expectElementExist(
        '[data-tid=tagContainer_' + tags[i] + ']',
        true,
        5000,
      );
      // const selectBox = await global.client.$('[data-tid=perspectiveGridFileTable]');
      /* await expectTagsExistBySelector(
        '[data-entry-id="' + selectedIds[i] + '"]',
        tags,
        true
      ); */
    }

    // selectedIds = await selectRowFiles([0, 1, 2]);

    // tags = ['test-tag1', 'test-tag2'];
    await AddRemoveTagsToSelectedFiles('grid', tags, false);

    for (let i = 0; i < tags.length; i++) {
      await expectElementExist(
        '[data-tid=tagContainer_' + tags[i] + ']',
        false,
        5000,
      );
      /*await expectTagsExistBySelector(
        '[data-entry-id="' + selectedIds[i] + '"]',
        tags,
        false
      );*/
    }
  });

  /**
   * todo in [web] its need more time to wait for removed files
   */
  test('TST5007 - Remove all tags from selected files [web,electron]', async () => {
    const selectedIds = await selectRowFiles([0, 1, 2]);
    const tags = ['test-tag1', 'test-tag2', 'test-tag3'];
    await AddRemoveTagsToSelectedFiles('grid', tags, true);

    //await selectFilesByID(selectedIds);

    await clickOn('[data-tid=gridPerspectiveAddRemoveTags]');
    await clickOn('[data-tid=cleanTagsMultipleEntries]');

    for (let i = 0; i < tags.length; i++) {
      await expectElementExist(
        '[data-tid=tagMoreButton_' + tags[i] + ']',
        false,
        5000,
      );
    }
  });

  test('TST5008 - Copy file [web,electron]', async () => {
    const fileName = 'sample.svg';
    await openFile(fileName, 'showPropertiesTID');
    /* await clickOn(getGridFileSelector(fileName));
    await expectElementExist('[data-tid=detailsTabTID]', true, 5000);
    //Toggle Properties
    await clickOn('[data-tid=detailsTabTID]');*/
    // add meta json to file
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: true,
      remove: false,
    });
    // open Copy/Move File Dialog
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]');
    await clickOn('[data-tid=MoveTargetempty_folder]');
    await clickOn('[data-tid=confirmCopyFiles]');
    await clickOn('[data-tid=uploadCloseAndClearTID]');

    await global.client.dblclick(getGridFileSelector('empty_folder'));
    await expectElementExist(getGridFileSelector(fileName));

    const arrayMeta = [fileName + '.json'];
    /*global.isWeb || global.isMinio
        ? [fileName + '.json'] // check meta, thumbnails are not created on web or minio
        : [fileName + '.json', fileName + '.jpg'];*/ // check meta and thumbnail

    await expectMetaFilesExist(arrayMeta, true);

    await clickOn('[data-tid=gridPerspectiveOnBackButton]');

    await expectElementExist(getGridFileSelector(fileName), true);
    await expectMetaFilesExist(arrayMeta, true);
  });

  test.skip('TST5009 - Copy file on different partition [manual]', async () => {});

  test('TST5010 - Move file [web,electron]', async () => {
    const fileName = 'sample.svg';
    //Toggle Properties
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'showPropertiesTID',
    );
    /*await clickOn(getGridFileSelector(fileName));
    await expectElementExist('[data-tid=detailsTabTID]', true, 5000);
    await clickOn('[data-tid=detailsTabTID]');*/
    // add meta json to file
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: true,
      remove: false,
    });
    // open Copy/Move File Dialog
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]');
    await clickOn('[data-tid=MoveTargetempty_folder]');
    await clickOn('[data-tid=confirmMoveFiles]');

    await global.client.dblclick(getGridFileSelector('empty_folder'));
    await expectElementExist(getGridFileSelector(fileName));

    const arrayMeta = [fileName + '.json'];
    /*global.isWeb || global.isMinio
        ? [fileName + '.json'] // check meta, thumbnails are not created on web or minio
        : [fileName + '.json', fileName + '.jpg'];*/ // check meta and thumbnail

    await expectMetaFilesExist(arrayMeta, true);

    await clickOn('[data-tid=gridPerspectiveOnBackButton]');

    await expectElementExist(getGridFileSelector(fileName), false, 8000);
    await expectMetaFilesExist(arrayMeta, false);
  });

  test.skip('TST5011 - Move file drag&drop in location navigator [manual]', async () => {});

  test.skip('TST5012 - Move file different partition [manual]', async () => {});

  test('TST5013 - Delete files from selection (many files) [web,electron]', async () => {
    const selectedIds = await selectRowFiles([0, 1, 2]);

    await clickOn('[data-tid=gridPerspectiveDeleteMultipleFiles]');
    await clickOn('[data-tid=confirmDeleteFileDialog]');

    await clickOn('[data-tid=openDefaultPerspective]');
    for (let i = 0; i < selectedIds.length; i++) {
      await expectElementExist(
        '[data-entry-id="' + selectedIds[i] + '"]',
        false,
        5000,
      );
    }
  });

  test.skip('TST5015 - Tag file drag&drop in perspective [manual]', async () => {});

  test('TST5048 - prev/next button [web,electron]', async () => {
    const fileName = 'sample.svg';
    const nextFileName = 'sample.tga';
    await clickOn(getGridFileSelector(fileName));
    //await expectElementExist('[data-tid=fileContainerNextFile]', true, 5000);
    await clickOn('[data-tid=fileContainerNextFile]');
    await expectElementSelected(nextFileName, true);
    await clickOn('[data-tid=fileContainerPrevFile]');
    await expectElementSelected(fileName, true);
  });
  /* test('TST51** - Show/Hide directories in perspective view', async () => { //TODO
    await global.client.waitForVisible(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    await global.client.click(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    // Check if the directories are displayed
  }); */
});
