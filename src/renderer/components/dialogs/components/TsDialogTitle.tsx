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

import React from 'react';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ArrowBackIcon } from '-/components/CommonIcons';
import TsIconButton from '-/components/TsIconButton';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import DialogTitle, { DialogTitleProps } from '@mui/material/DialogTitle';
import { isDesktopMode } from '-/reducers/settings';
import AppConfig from '-/AppConfig';

export type TSDialogTitle = DialogTitleProps & {
  dialogTitle: string;
  closeButtonTestId: string;
  onClose: () => void;
  actionSlot?: any;
};

function TsDialogTitle(props: TSDialogTitle) {
  const {
    style,
    dialogTitle: title,
    onClose,
    closeButtonTestId,
    children,
    actionSlot,
  } = props;
  const { t } = useTranslation();
  const desktopMode = useSelector(isDesktopMode);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const closeButton = (
    <DialogCloseButton testId={closeButtonTestId} onClose={onClose} />
  );
  const backButton = (
    <TsIconButton
      title={t('closeButtonDialog')}
      aria-label="close"
      tabIndex={-1}
      style={{
        float: 'left',
      }}
      data-tid={closeButtonTestId && closeButtonTestId}
      onClick={onClose}
    >
      <ArrowBackIcon />
    </TsIconButton>
  );

  return (
    <DialogTitle
      id="draggable-dialog-title"
      {...props}
      style={{
        cursor: 'move',
        ...style,
      }}
    >
      {fullScreen ? (
        <div style={{ textAlign: 'center' }}>
          {backButton}
          {title}
          {actionSlot && <span style={{ float: 'right' }}>{actionSlot}</span>}
          {children}
        </div>
      ) : (
        <>
          {title}
          {children}
          {closeButton}
        </>
      )}
    </DialogTitle>
  );
}

export default TsDialogTitle;