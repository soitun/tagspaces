/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2021-present TagSpaces GmbH
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

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { emphasize, Theme } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Tooltip from '-/components/Tooltip';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/MoreVert';
import {
  normalizePath,
  extractShortDirectoryName,
} from '@tagspaces/tagspaces-common/paths';
import DirectoryMenu from './menus/DirectoryMenu';
import { LocalLocationIcon, CloudLocationIcon } from '-/components/CommonIcons';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import AppConfig from '-/AppConfig';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    borderRadius: AppConfig.defaultCSSRadius,
    height: theme.spacing(4),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
    '& ol': {
      flexWrap: 'nowrap',
    },
  };
}) as typeof Chip; // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

// const NoWrapBreadcrumb = styled(StyledBreadcrumb)(({ theme }) => {
//   return { flexWrap: 'nowrap' };
// });

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => {
  return {
    '& ol': {
      flexWrap: 'nowrap',
    },
  };
}) as typeof Breadcrumbs; // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

interface Props {
  switchPerspective: (perspectiveId: string) => void;
  openRenameDirectoryDialog: () => void;
  isDesktopMode: boolean;
}

function PathBreadcrumbs(props: Props) {
  const { t } = useTranslation();
  const { openDirectory, currentDirectoryPath } = useDirectoryContentContext();
  const { currentLocation } = useCurrentLocationContext();
  const { setSelectedEntries } = useSelectedEntriesContext();
  let pathParts: Array<string> = [];

  const [directoryContextMenuAnchorEl, setDirectoryContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const { openRenameDirectoryDialog, isDesktopMode } = props;

  const openDirectoryMenu = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    setSelectedEntries([]);
    // @ts-ignore
    setDirectoryContextMenuAnchorEl(event.currentTarget);
  };

  const closeDirectoryMenu = () => {
    setDirectoryContextMenuAnchorEl(null);
  };

  const normalizedCurrentDirPath = currentDirectoryPath
    ? normalizePath(currentDirectoryPath.split('\\').join('/'))
    : undefined;

  const locationTypeIcon =
    currentLocation && currentLocation.type === locationType.TYPE_CLOUD ? (
      <CloudLocationIcon />
    ) : (
      <LocalLocationIcon />
    );

  let currentFolderChipIcon = undefined;

  if (currentDirectoryPath) {
    // Make the path unix like ending always with /
    const addSlash =
      currentLocation && currentLocation.haveObjectStoreSupport() ? '//' : '/';
    let normalizedCurrentPath =
      addSlash + normalizePath(currentDirectoryPath.split('\\').join('/'));

    let normalizedCurrentLocationPath = '';
    if (currentLocation && currentLocation.path) {
      normalizedCurrentLocationPath =
        addSlash + normalizePath(currentLocation.path.split('\\').join('/'));
    }

    while (
      currentLocation &&
      normalizedCurrentPath.lastIndexOf('/') > 0 &&
      normalizedCurrentPath.startsWith(normalizedCurrentLocationPath)
    ) {
      pathParts.push(
        normalizedCurrentPath
          .substring(currentLocation.haveObjectStoreSupport() ? 2 : 1)
          .split('/')
          .join(currentLocation.getDirSeparator()),
      ); // TODO: optimization needed
      normalizedCurrentPath = normalizedCurrentPath.substring(
        0,
        normalizedCurrentPath.lastIndexOf('/'),
      );
    }

    currentFolderChipIcon = pathParts.length === 1 && locationTypeIcon;

    if (pathParts.length >= 1) {
      pathParts = pathParts.slice(1, pathParts.length); // remove current directory
    }
    pathParts = pathParts.reverse();
  }

  let currentFolderName = extractShortDirectoryName(
    normalizePath(normalizedCurrentDirPath),
    '/',
  );
  if (currentLocation && (!currentFolderName || currentFolderName === '/')) {
    currentFolderName = currentLocation.name;
  }

  function getBreadcrumbs() {
    let breadcrumbs = [];
    if (pathParts.length > 0) {
      breadcrumbs = pathParts.map((pathPart, index) => {
        const folderName = extractShortDirectoryName(
          pathPart,
          currentLocation?.getDirSeparator(),
        );
        return (
          <Tooltip key={pathPart} title={t('core:navigateTo') + ' ' + pathPart}>
            <StyledBreadcrumb
              component="a"
              href="#"
              label={folderName}
              icon={index === 0 && locationTypeIcon}
              onClick={() => openDirectory(pathPart)}
            />
          </Tooltip>
        );
      });
    }
    if (currentLocation) {
      const curDirBreadcrumb = (
        <Tooltip
          key="lastBreadcrumb"
          title={
            t('core:openDirectoryMenu') + ' - ' + (currentDirectoryPath || '')
          }
        >
          <StyledBreadcrumb
            data-tid="folderContainerOpenDirMenu"
            label={currentFolderName}
            icon={currentFolderChipIcon}
            deleteIcon={<ExpandMoreIcon />}
            onDelete={openDirectoryMenu}
            onClick={openDirectoryMenu}
            onContextMenu={openDirectoryMenu}
            style={{ marginRight: 2 }}
          />
        </Tooltip>
      );
      return [...breadcrumbs, curDirBreadcrumb];
    }
    return breadcrumbs;
  }

  return (
    <>
      <StyledBreadcrumbs
        style={{
          overflowX: 'scroll',
          marginTop: 8,
          // @ts-ignore
          WebkitAppRegion: 'no-drag',
        }}
        maxItems={isDesktopMode ? 2 : 1}
        itemsAfterCollapse={isDesktopMode ? 1 : 1}
        itemsBeforeCollapse={isDesktopMode ? 1 : 0}
        aria-label="breadcrumb"
        separator={
          <span
            style={{
              marginLeft: -4,
              marginRight: -5,
            }}
          >
            {'›'}
          </span>
        }
      >
        {getBreadcrumbs()}
      </StyledBreadcrumbs>
      <DirectoryMenu
        open={Boolean(directoryContextMenuAnchorEl)}
        onClose={closeDirectoryMenu}
        anchorEl={directoryContextMenuAnchorEl}
        perspectiveMode={false}
        directoryPath={currentDirectoryPath}
        openRenameDirectoryDialog={openRenameDirectoryDialog}
      />
    </>
  );
}

export default PathBreadcrumbs;
