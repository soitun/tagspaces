/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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
import { useChatContext } from '-/hooks/useChatContext';
import { TS } from '-/tagspaces.namespace';
import { alpha, useTheme } from '@mui/material/styles';
import { Identifier } from 'dnd-core';
import React, { ReactNode } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';

type DragItem = {
  files?: File[];
  path?: string;
  selectedEntries?: TS.FileSystemEntry[];
  items: DataTransferItemList;
};
type DragProps = {
  isActive: boolean;
  handlerId: Identifier | null;
};

interface Props {
  children: ReactNode;
  accepts: Array<string>;
  style?: React.CSSProperties;
}

function ChatDndTargetFile(props: Props) {
  const theme = useTheme();
  const { children, accepts, style } = props;
  //const { findLocalLocation } = useCurrentLocationContext();
  const { setImages } = useChatContext();

  const [collectedProps, drop] = useDrop<DragItem, unknown, DragProps>(
    () => ({
      accept: accepts,
      drop: (item, m) => {
        const { files, path, selectedEntries } = item;
        const didDrop = m.didDrop();
        if (didDrop || !AppConfig.isElectron) {
          return;
        }

        if (files && files.length) {
          const filePaths = files.map((file) => {
            if (!file.path) {
              file.path = window.electronIO.ipcRenderer.getPathForFile(file);
            }
            return file.path;
          });
          setImages(filePaths);
        } else {
          const arrPath = [];
          if (selectedEntries && selectedEntries.length > 0) {
            selectedEntries.map((entry) => {
              if (entry.path.endsWith('.jpg') || entry.path.endsWith('.jpeg')) {
                arrPath.push(entry.path);
              }
              return true;
            });
          } else if (
            (path && path.endsWith('.jpg')) ||
            path.endsWith('.jpeg')
          ) {
            arrPath.push(path);
          }
          setImages(arrPath);
        }
      },
      collect: (m: DropTargetMonitor) => ({
        handlerId: m.getHandlerId(),
        /*isOver: m.isOver(),*/
        isActive: m.isOver({ shallow: true }) && m.canDrop(),
      }),
    }),
    [],
  );

  const { isActive, handlerId } = collectedProps;
  return (
    <div
      ref={drop}
      style={{
        ...style,
        ...(isActive && {
          boxShadow: 'inset 0px 0px 0 5px ' + theme.palette.primary.main,
          borderRadius: 5,
          backgroundColor: alpha(theme.palette.primary.main, 0.5),
        }),
      }}
    >
      {children}
    </div>
  );
}

export default ChatDndTargetFile;
