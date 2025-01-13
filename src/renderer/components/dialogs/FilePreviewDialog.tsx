/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import AppConfig from '-/AppConfig';
import DraggablePaper from '-/components/DraggablePaper';
import FileView from '-/components/FileView';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { getCurrentTheme } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import useEventListener from '-/utils/useEventListener';
import { Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { MutableRefObject, useRef } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  open: boolean;
  onClose: () => void;
  fsEntry: TS.FileSystemEntry;
}

function FilePreviewDialog(props: Props) {
  const { open = false, onClose, fsEntry } = props;
  const { findLocation } = useCurrentLocationContext();
  const { openedEntry } = useOpenedEntryContext();
  const { isEditMode } = useFilePropertiesContext();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  // const supportedFileTypes = useSelector(getSupportedFileTypes);
  const currentTheme = useSelector(getCurrentTheme);
  const fileViewer: MutableRefObject<HTMLIFrameElement> =
    useRef<HTMLIFrameElement>(null);
  const fileViewerContainer: MutableRefObject<HTMLDivElement> =
    useRef<HTMLDivElement>(null);
  const eventID = useRef<string>(getUuid());

  const openedFile: TS.OpenedEntry =
    fsEntry && openedEntry
      ? {
          ...openedEntry,
          ...(fsEntry.uuid && { uuid: fsEntry.uuid }),
          path: fsEntry.path,
          isFile: fsEntry.isFile,
          // editMode: false,
        }
      : undefined;

  useEventListener('message', (e) => {
    if (typeof e.data === 'string') {
      try {
        const dataObj = JSON.parse(e.data);
        if (dataObj.eventID === eventID.current) {
          handleMessage(dataObj);
        }
      } catch (ex) {
        console.debug(
          'useEventListener message:' + e.data + ' parse error:',
          ex,
        );
      }
    }
  });

  const handleMessage = (data: any) => {
    let message;
    let textFilePath;
    switch (
      data.command // todo use diff command
    ) {
      case 'loadDefaultTextContent':
        if (!openedFile || !openedFile.path) {
          break;
        }
        textFilePath = openedFile.path;

        /*if (
          fileViewer &&
          fileViewer.current &&
          fileViewer.current.contentWindow &&
          // @ts-ignore
          fileViewer.current.contentWindow.setTheme
        ) {
          // @ts-ignore call setContent from iframe
          fileViewer.current.contentWindow.setTheme(currentTheme);
        }*/
        const openLocation = findLocation(openedFile.locationID);

        openLocation
          ?.loadTextFilePromise(
            textFilePath,
            data.preview ? data.preview : false,
          )
          .then((content) => {
            const UTF8_BOM = '\ufeff';
            if (content.indexOf(UTF8_BOM) === 0) {
              content = content.substr(1);
            }
            let fileDirectory = extractContainingDirectoryPath(
              textFilePath,
              openLocation?.getDirSeparator(),
            );
            if (AppConfig.isWeb) {
              const webDir = extractContainingDirectoryPath(
                // eslint-disable-next-line no-restricted-globals
                location.href,
                openLocation?.getDirSeparator(),
              );
              fileDirectory =
                (webDir && webDir !== '/' ? webDir + '/' : '') + fileDirectory;
            }
            if (
              fileViewer &&
              fileViewer.current &&
              fileViewer.current.contentWindow &&
              // @ts-ignore
              fileViewer.current.contentWindow.setContent
            ) {
              // @ts-ignore call setContent from iframe
              fileViewer.current.contentWindow.setContent(
                content,
                fileDirectory,
                !isEditMode,
                currentTheme,
              );
            }
          })
          .catch((err) => {
            console.log('Error loading text content ' + err);
          });
        break;
    }
  };

  if (!fsEntry) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      fullWidth
      maxWidth="md"
      fullScreen={smallScreen}
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      PaperProps={{ sx: { width: '100%', height: '100%' } }}
      slotProps={{ backdrop: { style: { backgroundColor: 'transparent' } } }}
    >
      <TsDialogTitle
        dialogTitle="Preview"
        closeButtonTestId="closeFilePreviewTID"
        onClose={onClose}
      />
      <DialogContent
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          overflowY: 'hidden',
          padding: smallScreen ? '0' : 'inherited',
          flexGrow: 1,
        }}
      >
        <Typography
          variant="body2"
          gutterBottom
          style={{ wordBreak: 'break-all', margin: 10 }}
        >
          {fsEntry.path}
        </Typography>
        <FileView
          key="FileViewPreviewID"
          fileViewer={fileViewer}
          fileViewerContainer={fileViewerContainer}
          height={'90%'}
          eventID={eventID.current}
        />
      </DialogContent>
    </Dialog>
  );
}

export default FilePreviewDialog;
