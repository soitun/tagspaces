/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import { test, expect } from './fixtures';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import {
  checkSettings,
  clickOn,
  dnd,
  expectElementExist,
  expectMetaFilesExist,
  getGridFileSelector,
  setInputValue,
  takeScreenshot,
} from './general.helpers';
import { createFile, startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import {
  createPwLocation,
  createPwMinioLocation,
  createS3Location,
  defaultLocationName,
  defaultLocationPath,
} from './location.helpers';
import {
  addTags,
  arrTags,
  createTagGroup,
  deleteTagGroup,
  editedGroupName,
  newTagName,
  tagMenu,
  testGroup,
  testTagName,
} from './tag.helpers';
import { dataTidFormat } from '../../src/renderer/services/test';
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

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await clearDataStorage();
});

test.beforeEach(async () => {
  await closeWelcomePlaywright();
  await clickOn('[data-tid=tagLibrary]');
});

test.describe('TST04 - Testing the tag library:', () => {
  test('TST0401 - Should create a tag group [web,electron]', async () => {
    await createTagGroup(testGroup);
    await deleteTagGroup(testGroup);
  });

  test('TST0402 - Should delete tag group [web,electron]', async () => {
    await createTagGroup(testGroup);
    await deleteTagGroup(testGroup);
  });

  test('TST0403 - Rename tag group [web,electron]', async () => {
    await createTagGroup(testGroup);
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await clickOn('[data-tid=editTagGroup]');
    await setInputValue('[data-tid=editTagGroupInput] input', editedGroupName);
    await clickOn('[data-tid=editTagGroupConfirmButton]');
    await expectElementExist(
      '[data-tid=tagLibraryTagGroupTitle_' + editedGroupName + ']',
      true,
    );
    await deleteTagGroup(editedGroupName);
  });

  test.skip('TST0404 - Change default tag group tag colors [web,electron]', async () => {
    await createTagGroup(testGroup);
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await clickOn('[data-tid=editTagGroup]');
    await clickOn('[data-tid=editTagGroupBackgroundColor]');
    const inputElem = await global.client.$(
      '//*[@data-tid="colorPickerDialogContent"]/div/div[3]/div[1]/div/input',
    );
    await setInputValue(
      '//*[@data-tid="colorPickerDialogContent"]/div/div[3]/div[1]/div/input',
      '000000',
    );
    await clickOn('[data-tid=colorPickerConfirm]');
    await clickOn('[data-tid=editTagGroupSwitch]');
    await clickOn('[data-tid=editTagGroupConfirmButton]');
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await clickOn('[data-tid=editTagGroup]');
    const colorElem = await global.client.$(
      '[data-tid=editTagGroupBackgroundColor]',
    );
    let colorStyle = await colorElem.getAttribute('style');

    const rgb2hex = require('rgb2hex');
    const hex = rgb2hex(colorStyle); //color.value);
    expect(hex.hex).toBe('#000000'); //'rgb(0,0,0)');
    await clickOn('[data-tid=editTagGroupConfirmButton]');
    await deleteTagGroup(testGroup);
  });

  /*test('TST0405 - Should add tag to a tag group [web,electron]', async () => {
    await createTagGroup(testGroup);
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await addTags([newTagName]);
    await expectElementExist(
      '[data-tid=tagContainer_' + newTagName + ']',
      true,
    );
    await deleteTagGroup(testGroup);
  });*/

  test('TST0405 - Add tag (s) Should add comma separated tags to a tag group [web,electron]', async () => {
    await createTagGroup(testGroup);
    await clickOn('[data-tid=tagLibraryMoreButton_' + testGroup + ']');
    await addTags(arrTags);
    for (let i = 0; i < arrTags.length; i++) {
      await expectElementExist(
        '[data-tid=tagContainer_' + arrTags[i] + ']',
        true,
        5000,
      );
    }
    await deleteTagGroup(testGroup);
  });

  test.skip('TST0406 - Import tag groups [manual]', async () => {});

  test('TST0407 - Should rename tag [web,electron]', async () => {
    await tagMenu('done', 'editTagDialog');
    await setInputValue('[data-tid=editTagInput] input', testTagName);
    await clickOn('[data-tid=editTagConfirm]');
    await expectElementExist(
      '[data-tid=tagContainer_' + testTagName + ']',
      true,
    );
  });

  test('TST0408 - Should delete tag from a tag group [web,electron]', async () => {
    await tagMenu('next', 'deleteTagDialog');
    await clickOn('[data-tid=confirmDeleteTagDialogTagMenu]');
    await expectElementExist('[data-tid=tagContainer_next]', false);
  });

  test.skip('TST0409 - Should sort tags in a tag group lexicographically [web,electron]', async () => {
    await clickOn('[data-tid=tagLibraryMoreButton_ToDo_Workflow]');
    await clickOn('[data-tid=sortTagGroup]'); // TODO no validation, expect
    // const tagGroupElements = await global.client.getText('//button[contains(., "' + testTagName + '")]');
    // const tagGroupElements = await global.client.elements('tagGroupContainer_ToDo_Workflow');
    // expect(editedTag).toBe(testTagName);
  });

  test.skip('TST0410 - Default colors for tags from settings [web,electron]', async () => {
    await clickOn('[data-tid=settings]');
    await clickOn('[data-tid=settingsToggleDefaultTagBackgroundColor]');
    const inputElem = await global.client.$(
      '//*[@data-tid="colorPickerDialogContent"]/div/div[3]/div[1]/div/input',
    );
    await setInputValue(
      '//*[@data-tid="colorPickerDialogContent"]/div/div[3]/div[1]/div/input',
      '000000',
    );
    await clickOn('[data-tid=colorPickerConfirm]');
    await clickOn('[data-tid=closeSettingsDialog]');
    await clickOn('[data-tid=tagLibraryMenu]');
    await clickOn('[data-tid=createNewTagGroup]');

    const colorElem = await global.client.$(
      '[data-tid=createTagGroupBackgroundColor]',
    );
    let colorStyle = await colorElem.getAttribute('style');
    const rgb2hex = require('rgb2hex');
    const hex = rgb2hex(colorStyle); // color.value);
    expect(hex.hex).toBe('#000000'); //'rgb(0,0,0)');
    await clickOn('[data-tid=createTagGroupCancelButton]');

    /* await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await global.client.waitForVisible('[data-tid=settingsDialog]');
    await global.client.scroll(
      '[data-tid=settingsToggleDefaultTagBackgroundColor]',
      200,
      200
    );
    await global.client.waitForVisible(
      '[data-tid=settingsToggleDefaultTagBackgroundColor]'
    );
    await global.client.click(
      '[data-tid=settingsToggleDefaultTagBackgroundColor]'
    );
    await delay(500);*/

    // select color from ColorChoosier Dialog
    /*await global.client.click(
      '/html/body/div[33]/div/div[2]/div[2]/div/div[4]/div[4]/span/div'
    ); // TODO xpath not accpeted
    await delay(500);
    // modal confirmation
    await global.client.click(
      '/html/body/div[18]/div/div[2]/div[3]/div[2]/button'
    ); // TODO xpath not accepted
    await delay(500);
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');*/

    /*await global.client.waitForVisible('[data-tid=tagLibrary]');
    await global.client.click('[data-tid=tagLibrary]');
    await global.client.waitForVisible('[data-tid=tagLibraryMenu]');
    await global.client.click('[data-tid=tagLibraryMenu]');
    await global.client.waitForVisible('[data-tid=createNewTagGroup]');
    await global.client.click('[data-tid=createNewTagGroup]');
    await delay(500);
    const style = await global.client.getAttribute(
      '[data-tid=createTagGroupBackgroundColor]',
      'style'
    );
    await delay(500);
    expect(style).toContain('rgb(208, 107, 100)');*/
  });

  test.skip('TST0411 - Should move tag group down [electron]', async () => {
    await clickOn('[data-tid=tagLibraryMoreButton_ToDo_Workflow]');
    await clickOn('[data-tid=moveTagGroupDown]'); // TODO no test confirmation, expect
    // await global.client.getText('[data-tid=tagLibraryTagGroupList]').then((name) => {
    //   let answerExpected = name.split(name.indexOf(groupName));
    //   answerExpected = answerExpected[0];
    //   // expect(groupName).toBe(answerExpected);
    //   expect(answerExpected).toBe(groupName);
    //   return true;
    // });
  });

  test.skip('TST0412 - Should move tag group up [electron]', async () => {
    await clickOn('[data-tid=tagLibraryMoreButton_Common_Tags]');
    await clickOn('[data-tid=moveTagGroupUp]'); // TODO no test confirmation
    // await global.client.getText('[data-tid=tagLibraryTagGroupList]').then((name) => {
    //   let answerExpected = name.split(name.indexOf(groupName));
    //   answerExpected = answerExpected[0];
    //   expect(groupName).toBe(answerExpected);
    //   return true;
    // });
  });

  test.skip('TST0414 - Tag file with drag and drop [manual]', async () => {});

  test.skip('TST0415 - Open export tag groups dialog [electron]', async () => {});

  test.skip('TST0416 - Export tag groups / all / some [manual]', async () => {});

  test.skip('TST0417 - Collect tags from current location [electron, Pro]', async () => {});

  test('TST0419 - Create location based tag group [web,electron, _pro]', async () => {
    await checkSettings(
      '[data-tid=saveTagInLocationTID]',
      true,
      '[data-tid=advancedSettingsDialogTID]',
    );
    await createTagGroup(testGroup, defaultLocationName);
    await clickOn('[data-tid=locationManager]');
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await expectMetaFilesExist(['tsl.json'], true);
    // cleanup
    await deleteTagGroup(testGroup);
  });

  test('TST0420 - Load tag groups from location [web,electron, _pro]', async () => {
    const tslContent =
      '{"appName":"TagSpaces","appVersion":"5.3.6","description":"","lastUpdated":"2023-06-08T16:51:23.926Z","tagGroups":[{"uuid":"collected_tag_group_id","title":"Collected Tags","color":"#61DD61","textcolor":"white","children":[{"title":"Stanimir","color":"#61DD61","textcolor":"white","type":"sidecar"}],"created_date":1686119562860,"modified_date":1686243083871,"expanded":true,"locationId":"dc1ffaaeeb5747e39dd171c7e551afd6"}]}';
    await createFile('tsl.json', tslContent, '.ts');
    await checkSettings(
      '[data-tid=saveTagInLocationTID]',
      true,
      '[data-tid=advancedSettingsDialogTID]',
    );
    await clickOn('[data-tid=locationManager]');
    if (global.isMinio) {
      await createPwMinioLocation('', defaultLocationName, true);
    } else if (global.isS3) {
      await createS3Location('', defaultLocationName, true);
    } else {
      await createPwLocation(defaultLocationPath, defaultLocationName, true);
    }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await clickOn('[data-tid=tagLibrary]');
    await expectElementExist('[data-tid=tagContainer_Stanimir]', true);
  });

  test('TST0421 - Move tag to another tag group with DnD [web,electron]', async () => {
    const tagName = '1star';
    const sourceTagGroup = 'Ratings';
    const destinationTagGroup = 'Priorities';

    await expectElementExist(
      '[data-tid=tagContainer_' + tagName + ']',
      true,
      3000,
      '[data-tid=tagGroupContainer_' + sourceTagGroup + ']',
    );
    await dnd(
      '[data-tid=tagContainer_' + tagName + ']',
      '[data-tid=tagGroupContainer_' + destinationTagGroup + ']',
    );
    await expectElementExist(
      '[data-tid=tagContainer_' + tagName + ']',
      true,
      3000,
      '[data-tid=tagGroupContainer_' + destinationTagGroup + ']',
    );
  });

  test('TST0422 - Add custom date smarttag [web,electron,_pro]', async () => {
    const tagName = 'custom-date';
    const sourceTagGroup = 'Smart Tags';

    await clickOn('[data-tid=locationManager]');
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await clickOn('[data-tid=tagLibrary]');
    await expectElementExist(
      '[data-tid=tagContainer_' + tagName + ']',
      true,
      3000,
      '[data-tid=tagGroupContainer_' + dataTidFormat(sourceTagGroup) + ']',
    );
    await dnd(
      '[data-tid=tagContainer_' + tagName + ']',
      getGridFileSelector('sample.txt'),
    );
    //await clickOn('[data-tid=showTimeTID]');
    await clickOn('[data-tid=confirmEditTagEntryDialog]');

    await expectElementExist(
      '[data-tid=tagContainer_' + formatDateTime4Tag(new Date(), false) + ']',
      true,
      8000,
      '[data-tid=perspectiveGridFileTable]',
    );
  });
});
