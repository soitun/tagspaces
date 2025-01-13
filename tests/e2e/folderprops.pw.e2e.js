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
  takeScreenshot,
  getGridFileSelector,
  setInputValue,
  createNewDirectory,
  dnd,
  setInputKeys,
  getElementScreenshot,
  checkSettings,
  openFolder,
  waitUntilChanged,
} from './general.helpers';
import { openContextEntryMenu } from './test-utils';
import { createFile, startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import {
  AddRemovePropertiesTags,
  getPropertiesFileName,
  getPropertiesTags,
} from './file.properties.helpers';
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
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else if (global.isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);

  await openContextEntryMenu(
    '[data-tid=fsEntryName_empty_folder]',
    'showProperties',
  );
});

test.describe('TST02 - Folder properties', () => {
  test('TST0201 - Open in main area [web,electron]', async () => {
    const testFile = 'file_in_empty_folder.txt';
    await createFile(testFile);
    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=openInMainAreaTID]');
    await expectElementExist(getGridFileSelector(testFile), true, 5000);
  });

  test('TST0204 - Reload folder from toolbar [web,electron]', async () => {
    let propsTags = await getPropertiesTags();
    expect(propsTags).toHaveLength(0);
    const tagTitle = 'test-tag';
    const tsmJson = {
      appName: 'TagSpaces',
      appVersion: '5.3.5',
      description:
        "**Lorem Ipsum** is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\n## Why do we use it?\n\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose \n",
      lastUpdated: 1684224090695,
      tags: [
        {
          title: 'test-tag',
          color: '#61DD61',
          textcolor: 'white',
          type: 'sidecar',
        },
      ],
      id: '73e839b38d034a4a807971e755c17091',
    };
    await createFile('tsm.json', JSON.stringify(tsmJson), 'empty_folder/.ts');

    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=reloadFolderTID]');

    // propsTags = await getPropertiesTags();
    // expect(propsTags).toContain(tagTitle);
    await expectElementExist(
      '[data-tid=PropertiesTagsSelectTID] [data-tid=tagContainer_' +
        tagTitle +
        ']',
      true,
      4000,
    );

    await clickOn('[data-tid=descriptionTabTID]');
    // await clickOn('[data-tid=editDescriptionTID]');
    const editor = await global.client.waitForSelector(
      '[data-tid=descriptionTID] .milkdown', //[contenteditable=true]'
    );
    const description = await editor.innerText();
    expect(description.replace(/[\s*#]/g, '')).toMatch(
      tsmJson.description.replace(/[\s*#]/g, ''),
    );
  });

  test('TST0205 - Delete folder from toolbar [web,electron]', async () => {
    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=deleteFolderTID]');
    await clickOn('[data-tid=confirmSaveBeforeCloseDialog]');
    await expectElementExist('OpenedTIDempty_folder', false, 5000);
    await expectElementExist(getGridFileSelector('empty_folder'), false, 5000);
    await testDataRefresh(s3ServerInstance);
  });

  test('TST0206 - Rename folder [web,electron]', async () => {
    const newTile = 'folderRenamed';

    const propsFolderName = await getPropertiesFileName();
    await clickOn('[data-tid=startRenameEntryTID]');
    await setInputValue('[data-tid=fileNameProperties] input', newTile);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    // await waitForNotification();
    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + newTile + '"]',
    );
    const propsNewFolderName = await getPropertiesFileName();
    expect(propsFolderName).not.toBe(propsNewFolderName);
    await testDataRefresh(s3ServerInstance);

    //turn folderName back
    /*await clickOn('[data-tid=fileNameProperties] input');
    await clickOn('[data-tid=startRenameEntryTID]');
    await clickOn('[data-tid=fileNameProperties] input');
    await setInputValue('[data-tid=fileNameProperties] input', propsFolderName);
    await clickOn('[data-tid=confirmRenameEntryTID]');
    // await waitForNotification();
    await global.client.waitForSelector(
      '[data-tid=fileNameProperties] input[value="' + propsFolderName + '"]'
    );
    const propsOldFileName = await getPropertiesFileName();
    expect(propsOldFileName).toEqual(propsFolderName);*/
  });

  test('TST0207 - Move folder [web,electron]', async () => {
    const targetFolder = 'empty_folder';
    const newFolder = await createNewDirectory('srcFolder');
    // select folder to move
    //await clickOn(getGridFileSelector('empty_folder'));
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]'); //todo moveCopyEntryTID
    await clickOn('[data-tid=MoveTarget' + targetFolder + ']');
    //await clickOn('[data-tid=MoveTarget' + targetFolder + ']');
    await clickOn('[data-tid=confirmMoveFiles]');
    await clickOn('[data-tid=uploadCloseAndClearTID]');
    await expectElementExist(getGridFileSelector(newFolder), false, 5000);
    await global.client.dblclick('[data-tid=fsEntryName_' + targetFolder + ']');
    await expectElementExist(getGridFileSelector(newFolder), true, 5000);
    //await testDataRefresh(s3ServerInstance);
  });

  test('TST0210 - Add and remove tag to folder with dropdown menu [web,electron]', async () => {
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2']);
  });
  test('TST0211 - Add tag folder with DnD from tag library [web,electron]', async () => {
    const tagName = 'article';
    await clickOn('[data-tid=tagLibrary]');
    await dnd(
      '[data-tid=tagContainer_' + tagName + ']',
      '[data-tid=PropertiesTagsSelectTID]',
    );
    await expectElementExist(
      '[data-tid=tagContainer_' + tagName + ']',
      true,
      8000,
      '[data-tid=perspectiveGridFileTable]',
    );
    await expectElementExist(
      '[data-tid=tagContainer_' + tagName + ']',
      true,
      8000,
      '[data-tid=PropertiesTagsSelectTID]',
    );

    //const propsTags = await getPropertiesTags();
    //expect(propsTags).toContain(tagName);
  });

  test('TST0213 - Add description to folder [web,electron,_pro]', async () => {
    const desc = 'test description';

    await clickOn('[data-tid=descriptionTabTID]');
    await clickOn('[data-tid=editDescriptionTID]');
    // await global.client.dblclick('[data-tid=descriptionTID]');
    await clickOn('[data-tid=descriptionTID]');
    const editor = await global.client.waitForSelector(
      '[data-tid=descriptionTID] [contenteditable=true]',
    );
    await editor.type(desc);
    /*
    // editorContent is empty on web
    const editorContent = await editor.innerText();
    await expect(editorContent).toBe(desc);
    */
    await clickOn('[data-tid=editDescriptionTID]');
    await expectElementExist(
      '[data-tid=gridCellDescription]',
      true,
      10000,
      getGridFileSelector('empty_folder'),
    );
  });

  test('TST0215 - Link for internal sharing + copy [web,electron]', async () => {
    // await clickOn('[data-tid=copyLinkToClipboardTID]');
    const sharingLink = await global.client.waitForSelector(
      '[data-tid=sharingLinkTID] input',
    );
    const sharingLinkValue = await sharingLink.getAttribute('value');

    //await clickOn('[data-tid=locationManagerMenu]');
    //await clickOn('[data-tid=locationManagerMenuOpenLink]');
    await clickOn('[data-tid=openLinkNavigationTID]');

    /*const clipboardContent = await global.client.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardContent.length > 0).toBe(true);*/
    //await setInputKeys('directoryName', clipboardContent);
    await setInputValue('[data-tid=openLinkTID] input', sharingLinkValue);
    await clickOn('[data-tid=openLinkTID] input');
    await clickOn('[data-tid=confirmOpenLink]');
    await expectElementExist('[data-tid=currentDir_empty_folder]', true, 5000);
    /*
    await clickOn('[data-tid=editDescriptionTID]');
    await global.client.dblclick('[data-tid=descriptionTID]');
    await clickOn('[data-tid=descriptionTID]');
    const editor = await global.client.waitForSelector(
      '[data-tid=descriptionTID] .milkdown'
    );
    await editor.type(
      '[sharingLink](' + clipboardContent + ' "sharingLinkTitle")'
    );
    await global.client.waitForSelector('a[title="' + clipboardContent + '"]');
    await clickOn('[data-tid=descriptionTID] .milkdown a');
    */
  });

  test('TST0216 - Set gallery perspective as default for folder [web,electron,_pro]', async () => {
    const fileName = 'sample.jpg';
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'fileMenuMoveCopyFile',
    );
    await clickOn('[data-tid=MoveTargetempty_folder]');
    await clickOn('[data-tid=confirmCopyFiles]');
    await clickOn('[data-tid=uploadCloseAndClearTID]');

    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'showProperties',
    );

    await clickOn('[data-tid=changePerspectiveTID]', {
      // force: true,
      timeout: 15000,
    }); // todo double click
    //await clickOn('[data-tid=changePerspectiveTID]');
    await clickOn('li[data-value=gallery]');
    //await global.client.dblclick('[data-tid=fsEntryName_empty_folder]');
    await clickOn(getGridFileSelector('empty_folder'));
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'openDirectory',
    );
    await expectElementExist(
      '[data-tid=perspectiveGalleryToolbar]',
      true,
      5000,
    );
    // await clearDataStorage();
    // turn back grid perspective
    await clickOn('[data-tid=changePerspectiveTID]');
    //await clickOn('[data-tid=changePerspectiveTID]');
    await clickOn('li[data-value=grid]');
    await expectElementExist('[data-tid=gridperspectiveToolbar]', true, 5000);
  });

  test('TST0218 - Set and remove predefined background gradient for folder [web,electron,_pro]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'showProperties',
    );
    await openFolder('empty_folder');
    await checkSettings('[data-tid=settingsSetShowUnixHiddenEntries]', false);
    const initScreenshot = await getElementScreenshot(
      '[data-tid=perspectiveGridFileTable]',
    );
    await clickOn('[data-tid=changeBackgroundColorTID]');
    await clickOn('[data-tid=backgroundTID1]');

    await waitUntilChanged(
      '[data-tid=backgroundTID]',
      'height: 100%; background: rgba(0, 0, 0, 0.267);',
      'style',
    );

    const withBgnColorScreenshot = await getElementScreenshot(
      '[data-tid=perspectiveGridFileTable]',
    );
    expect(initScreenshot).not.toBe(withBgnColorScreenshot);

    // remove background
    await clickOn('[data-tid=backgroundClearTID]');
    await clickOn('[data-tid=confirmConfirmResetColorDialog]');

    await waitUntilChanged(
      '[data-tid=backgroundTID]',
      'height: 100%; background: transparent;',
      'style',
    );

    if (!global.isWeb) {
      //todo screenshots are diff in web
      const bgnRemovedScreenshot = await getElementScreenshot(
        '[data-tid=perspectiveGridFileTable]',
      );
      expect(initScreenshot).toBe(bgnRemovedScreenshot);
    }
  });

  test('TST0219 - Set and remove predefined folder thumbnail [web,electron,_pro]', async () => {
    const screenshotSelector = '[data-tid=fsEntryName_empty_folder]'; // > div
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'showProperties',
    );
    const initScreenshot = await getElementScreenshot(screenshotSelector);
    await clickOn('[data-tid=changeThumbnailTID]');
    await clickOn('ul[data-tid=predefinedThumbnailsTID] > li');
    await clickOn('[data-tid=confirmCustomThumb]');

    const imgElement = await global.client.waitForSelector(
      '[data-tid=fsEntryName_empty_folder] img', //[contenteditable=true]'
    );
    const srcValue = await imgElement.getAttribute('src');
    expect(srcValue.indexOf('.ts/tst.jpg')).toBeGreaterThan(-1);

    const withThumbScreenshot = await getElementScreenshot(screenshotSelector);
    expect(initScreenshot).not.toBe(withThumbScreenshot);

    // remove thumb
    await clickOn('[data-tid=changeThumbnailTID]');
    await clickOn('[data-tid=clearThumbnail]');

    const thumbRemovedScreenshot =
      await getElementScreenshot(screenshotSelector);
    if (!global.isWeb && !global.isWin) {
      // thumbnails are visual equal on windows but with diff base64 screenshots
      expect(initScreenshot).toBe(thumbRemovedScreenshot);
    }
    //todo check if tsb.jpg not exist
  });

  /**
   * bgnRemovedScreenshot not always the same on web
   */
  test('TST0220 - Set and remove predefined folder background [electron,_pro]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'showProperties',
    );
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'openDirectory',
    );
    const initScreenshot = await getElementScreenshot(
      '[data-tid=perspectiveGridFileTable]',
    ); //propsBgnImageTID
    await clickOn('[data-tid=changeBackgroundImageTID]');
    await clickOn('ul[data-tid=predefinedBackgroundsTID] > li');

    await expectElementExist(
      '[data-tid=bgnColorPickerDialogContent] > img',
      true,
      5000,
    );
    await clickOn('[data-tid=colorPickerConfirm]');
    const withBgnScreenshot = await getElementScreenshot(
      '[data-tid=perspectiveGridFileTable]',
    );
    expect(initScreenshot).not.toBe(withBgnScreenshot);

    // remove background
    await clickOn('[data-tid=changeBackgroundImageTID]');
    await clickOn('[data-tid=clearBackground]');
    const bgnRemovedScreenshot = await getElementScreenshot(
      '[data-tid=perspectiveGridFileTable]',
    );
    expect(initScreenshot).toBe(bgnRemovedScreenshot);
  });
});
