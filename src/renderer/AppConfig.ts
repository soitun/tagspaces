import { AppConfig } from '@tagspaces/tagspaces-common';

AppConfig.aiSupportedFiletypes = {
  text: ['pdf', 'txt', 'md'], //, 'html'],
  image: ['jpg', 'jpeg', 'png'],
};
AppConfig.editableFiles = [
  'txt',
  'md',
  'markdown',
  'mdown',
  'html',
  'htm',
  'coffee',
  'c',
  'cpp',
  'css',
  'groovy',
  'haxe',
  'xml',
  'java',
  'js',
  'json',
  'less',
  'php',
  'pl',
  'py',
  'rb',
  'ini',
  'sh',
  'sql',
];
AppConfig.autoSaveInterval = 40000;
AppConfig.maxCollectedTag = 500;
AppConfig.maxLoops = 2;
AppConfig.defaultFolderColor = '#a466aa'; // 'gray';
AppConfig.defaultFileColor = '#33b5be';
AppConfig.defaultCSSRadius = 10;
AppConfig.defaultSpaceBetweenButtons = 10;
AppConfig.aiFolder = 'ai';

export default AppConfig;
