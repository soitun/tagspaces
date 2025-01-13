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

import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import Tooltip from '-/components/Tooltip';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Typography from '@mui/material/Typography';
import TsIconButton from '-/components/TsIconButton';
import { LocalLocationIcon, CloudLocationIcon } from '-/components/CommonIcons';
import DefaultLocationIcon from '@mui/icons-material/Highlight';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import { actions as AppActions, AppDispatch } from '../reducers/app';
import TargetMoveFileBox from './TargetMoveFileBox';
import DragItemTypes from './DragItemTypes';
import DirectoryTreeView, {
  DirectoryTreeViewRef,
} from '-/components/DirectoryTreeView';
import { classes, SidePanel } from '-/components/SidePanels.css';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { CommonLocation } from '-/utils/CommonLocation';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useEntryExistDialogContext } from '-/components/dialogs/hooks/useEntryExistDialogContext';
import CustomDragLayer from '-/components/CustomDragLayer';
import TargetFileBox from '-/components/TargetFileBox';
import { NativeTypes } from 'react-dnd-html5-backend';
import { TS } from '-/tagspaces.namespace';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import { ListItemText } from '@mui/material';

interface Props {
  location: CommonLocation;
  hideDrawer?: () => void;
  setDeleteLocationDialogOpened: (open: boolean) => void;
}

function LocationView(props: Props) {
  const { t } = useTranslation();

  const { moveFiles, uploadFiles } = useIOActionsContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const {
    openLocation,
    currentLocation,
    readOnlyMode,
    setSelectedLocation,
    setLocationDirectoryContextMenuAnchorEl,
  } = useCurrentLocationContext();
  const { handleEntryExist, openEntryExistDialog } =
    useEntryExistDialogContext();
  const { setActions } = usePerspectiveActionsContext();
  const { setSelectedEntries } = useSelectedEntriesContext();
  const { currentLocationPath, openDirectory } = useDirectoryContentContext();
  const { showNotification } = useNotificationContext();
  const directoryTreeRef = useRef<DirectoryTreeViewRef>(null);

  const dispatch: AppDispatch = useDispatch();

  const { location, hideDrawer } = props;
  const isCloudLocation = location.type === locationType.TYPE_CLOUD;

  const handleLocationIconClick = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (directoryTreeRef.current) {
      directoryTreeRef.current.changeLocation(location);
    }
  };

  const handleLocationClick = () => {
    if (currentLocation && location.uuid === currentLocation.uuid) {
      // the same location click
      openDirectory(currentLocationPath).then(() => {
        const action: TS.PerspectiveActions = { action: 'reload' };
        setActions(action);
      });
    } else {
      openLocation(location);
      if (hideDrawer) {
        hideDrawer();
      }
    }
  };

  const handleLocationContextMenuClick = (event: any, chosenLocation) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedLocation(chosenLocation);
    setLocationDirectoryContextMenuAnchorEl(event.currentTarget);
  };

  const onUploadProgress = (progress, response) => {
    dispatch(AppActions.onUploadProgress(progress, response));
  };

  /**
   * https://github.com/react-component/table/blob/master/examples/react-dnd.js
   * @param item
   * @param monitor
   */
  const handleFileMoveDrop = (item, monitor) => {
    if (item) {
      const { path, selectedEntries } = item; //monitor.getItem();
      const arrPath = [];
      if (selectedEntries && selectedEntries.length > 0) {
        selectedEntries.map((entry) => {
          arrPath.push(entry.path);
          return true;
        });
      } else {
        arrPath.push(path);
      }
      if (readOnlyMode) {
        showNotification(t('core:dndDisabledReadOnlyMode'), 'error', true);
        return;
      }
      const targetLocation = item.targetLocation;
      let targetPath = targetLocation ? targetLocation.path : undefined;
      if (targetPath === undefined) {
        targetPath = item.targetPath;
      }

      if (targetPath !== undefined && targetLocation !== undefined) {
        // TODO handle monitor -> isOver and change folder icon
        console.log('Dropped files: ' + path);
        if (targetLocation.type !== currentLocation.type) {
          //locationType.TYPE_CLOUD) {
          dispatch(AppActions.resetProgress());
          openFileUploadDialog(targetPath);
          return uploadFiles(
            arrPath,
            targetPath,
            onUploadProgress,
            true,
            false,
            targetLocation.uuid,
          ).catch((error) => {
            console.log('uploadFiles', error);
          });
        } else if (targetLocation.type === locationType.TYPE_LOCAL) {
          handleEntryExist(
            selectedEntries,
            targetPath,
            targetLocation.uuid,
          ).then((exist) => {
            if (exist) {
              openEntryExistDialog(exist, () => {
                moveFiles(arrPath, targetPath, targetLocation.uuid);
              });
            } else {
              moveFiles(arrPath, targetPath, targetLocation.uuid);
            }
          });
        } else {
          showNotification(t('Moving file not possible'), 'error', true);
          return;
        }
        setSelectedEntries([]);
      }
    }
  };

  let locationNameTitle = currentLocationPath;
  if (isCloudLocation && location.bucketName) {
    if (location.endpointURL) {
      locationNameTitle = location.endpointURL + ' - ' + location.bucketName;
    } else if (location.region) {
      locationNameTitle = location.region + ' - ' + location.bucketName;
    }
  }

  const LocationTitle = (
    <Tooltip title={locationNameTitle}>
      <div
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 240,
        }}
      >
        <Typography
          variant="inherit"
          style={{
            paddingLeft: 5,
            paddingRight: 5,
          }}
          className={classes.header}
          data-tid="locationTitleElement"
          noWrap
        >
          {location.name}
        </Typography>
      </div>
    </Tooltip>
  );
  const { FILE } = NativeTypes;
  return (
    <SidePanel>
      <TargetFileBox
        accepts={[FILE]}
        directoryPath={location.path}
        locationId={location.uuid}
      >
        <CustomDragLayer />
        <ListItem
          data-tid={'location_' + location.name.replace(/ /g, '_')}
          className={
            currentLocation && currentLocation.uuid === location.uuid
              ? classes.listItemSelected
              : classes.listItem
          }
          onClick={handleLocationClick}
          onContextMenu={(event) =>
            handleLocationContextMenuClick(event, location)
          }
        >
          <ListItemIcon
            style={{
              minWidth: 'auto',
              cursor: 'pointer',
            }}
            onClick={handleLocationIconClick}
          >
            <Tooltip title={t('clickToExpand')}>
              {isCloudLocation ? (
                <CloudLocationIcon
                  style={{
                    cursor: 'pointer',
                  }}
                  className={classes.icon}
                />
              ) : (
                <LocalLocationIcon
                  style={{
                    cursor: 'pointer',
                  }}
                  className={classes.icon}
                />
              )}
            </Tooltip>
          </ListItemIcon>
          <ListItemText>
            {isCloudLocation && !AppConfig.isElectron ? (
              <>{LocationTitle}</>
            ) : (
              <TargetMoveFileBox
                accepts={[DragItemTypes.FILE]}
                onDrop={handleFileMoveDrop}
                targetPath={currentLocationPath}
                targetLocation={location}
              >
                {LocationTitle}
              </TargetMoveFileBox>
            )}
          </ListItemText>
          {location.isDefault && (
            <Tooltip title={t('core:thisIsStartupLocation')}>
              <DefaultLocationIcon data-tid="startupIndication" />
            </Tooltip>
          )}
          <TsIconButton
            aria-label={t('core:options')}
            aria-haspopup="true"
            edge="end"
            data-tid={'locationMoreButton_' + location.name}
            onClick={(event) => handleLocationContextMenuClick(event, location)}
            onContextMenu={(event) =>
              handleLocationContextMenuClick(event, location)
            }
          >
            <MoreVertIcon />
          </TsIconButton>
        </ListItem>
      </TargetFileBox>
      <DirectoryTreeView
        key={'tree_' + location.uuid}
        ref={directoryTreeRef}
        classes={classes}
        location={location}
        handleFileMoveDrop={handleFileMoveDrop}
      />
    </SidePanel>
  );
}

export default LocationView;
