import { test, expect } from '@playwright/test';
import { AppConfig } from '@tagspaces/tagspaces-common';

const {
  baseName,
  extractFileExtension,
  getMetaDirectoryPath,
  getMetaFileLocationForFile,
  getMetaFileLocationForDir,
} = require('@tagspaces/tagspaces-common/paths');

const dirSeparatorUnix = '/';
const dirSeparatorWin = '\\';

executeTests('/home/user', 'filename', 'txt', dirSeparatorUnix);
executeTests('c:\\Users\\testuser', 'filename', 'txt', dirSeparatorWin);
//c:\\users\\tester\\file.jpg
executeTests('c:\\users\\tester', 'file', 'jpg', dirSeparatorWin);
///users/tester/file.jpg
executeTests('users/tester', 'file', 'jpg', dirSeparatorUnix);
//without file Extension
executeTests('../remote.php/webdav/somefilename', '', '', dirSeparatorUnix);
executeTests(
  '../remote.php/webdav/[20120125 89.4kg 19.5% 2.6kg]',
  '',
  '',
  dirSeparatorUnix,
);

function executeTests(dirPath, fileName, fileExtension, dirSeparator) {
  const platform = dirSeparator === '\\' ? 'Windows' : 'UNIX';
  const filepath =
    dirPath +
    dirSeparator +
    fileName +
    (fileExtension ? '.' + fileExtension : '');

  test(platform + ' extract baseName ' + filepath, () => {
    const name = baseName(filepath, dirSeparator);
    expect(
      name === fileName + (fileExtension ? '.' + fileExtension : '') ||
        name === filepath,
    ).toBeTruthy();
  });

  test(platform + ' extractFileExtension ' + filepath, () => {
    expect(extractFileExtension(filepath, dirSeparator)).toBe(fileExtension);
  });

  test(platform + ' getMetaDirectoryPath ' + filepath, () => {
    expect(getMetaDirectoryPath(dirPath, dirSeparator)).toBe(
      dirPath + dirSeparator + AppConfig.metaFolder,
    );
  });

  test(platform + ' getMetaFileLocationForFile ' + filepath, () => {
    const isDir = filepath.endsWith(dirSeparator);
    const metaFilePath = isDir
      ? getMetaFileLocationForDir(filepath, dirSeparator)
      : getMetaFileLocationForFile(filepath, dirSeparator);
    expect(metaFilePath).toBe(
      dirPath +
        dirSeparator +
        AppConfig.metaFolder +
        dirSeparator +
        (isDir
          ? AppConfig.metaFolderFile
          : fileName +
            (fileExtension ? '.' + fileExtension : '') +
            AppConfig.metaFileExt),
    );
  });
}
