/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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

import React, { createContext, useMemo, useRef } from 'react';
import FileUploadContainer, {
  FileUploadContainerRef,
} from '-/components/FileUploadContainer';

type FileUploadContextData = {
  openFileUpload: (dPath: string) => void;
};

export const FileUploadContext = createContext<FileUploadContextData>({
  openFileUpload: undefined,
});

export type FileUploadContextProviderProps = {
  children: React.ReactNode;
};

export const FileUploadContextProvider = ({
  children,
}: FileUploadContextProviderProps) => {
  const fileUploadContainerRef = useRef<FileUploadContainerRef>(null);

  function openFileUpload(dPath: string) {
    fileUploadContainerRef.current.onFileUpload(dPath);
  }

  const context = useMemo(() => {
    return {
      openFileUpload: openFileUpload,
    };
  }, []);

  return (
    <FileUploadContext.Provider value={context}>
      {children}
      <FileUploadContainer ref={fileUploadContainerRef} />
    </FileUploadContext.Provider>
  );
};
