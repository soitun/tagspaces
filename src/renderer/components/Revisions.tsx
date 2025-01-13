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

import React, { useEffect, useState } from 'react';
import {
  getBackupFileLocation,
  extractContainingDirectoryPath,
  extractFileNameWithoutExt,
} from '@tagspaces/tagspaces-common/paths';
import { TS } from '-/tagspaces.namespace';
import { format, formatDistanceToNow } from 'date-fns';
import TsIconButton from '-/components/TsIconButton';
import AppConfig from '-/AppConfig';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { Pro } from '-/pro';
import { DeleteIcon, PreviewIcon, RestoreIcon } from '-/components/CommonIcons';
import FilePreviewDialog from '-/components/dialogs/FilePreviewDialog';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';

const initialRowsPerPage = 10;

function Revisions() {
  const { t } = useTranslation();
  const { findLocation } = useCurrentLocationContext();
  const { getMetadataID } = useIOActionsContext();
  const { openedEntry, reloadOpenedFile } = useOpenedEntryContext();
  const { copyFilePromiseOverwrite, deleteEntriesPromise } =
    usePlatformFacadeContext();
  const [rows, setRows] = useState<TS.FileSystemEntry[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] =
    React.useState<number>(initialRowsPerPage);
  const [previewDialogEntry, setPreviewDialogEntry] = useState<
    TS.FileSystemEntry | undefined
  >(undefined);
  // const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    // if no history item path - not loadHistoryItems for items in metaFolder
    if (openedEntry && openedEntry.path.indexOf(AppConfig.metaFolder) === -1) {
      loadHistoryItems(openedEntry);
    }
  }, [openedEntry]);

  function getLmdt(fileName) {
    return parseInt(extractFileNameWithoutExt(fileName));
  }

  function loadHistoryItems(openedFile: TS.OpenedEntry) {
    if (Pro) {
      const location = findLocation(openedFile.locationID);
      if (location) {
        getMetadataID(openedFile.path, openedFile.uuid, location).then((id) => {
          openedFile.uuid = id;
          const backupFilePath = getBackupFileLocation(
            openedFile.path,
            openedFile.uuid,
            location.getDirSeparator(),
          );
          const backupPath = extractContainingDirectoryPath(
            backupFilePath,
            location.getDirSeparator(),
          );
          location.listDirectoryPromise(backupPath, []).then((h) => {
            setRows(
              h.sort((a, b) => (getLmdt(a.name) < getLmdt(b.name) ? 1 : -1)),
            );
          });
        });
      }
    }
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function deleteRevision(path) {
    const location = findLocation(openedEntry.locationID);
    deleteEntriesPromise(location.toFsEntry(path, true)).then(() =>
      loadHistoryItems(openedEntry),
    );
  }

  function deleteRevisions() {
    if (rows.length > 0) {
      const location = findLocation(openedEntry.locationID);
      deleteEntriesPromise(
        ...rows.map((entry) => location.toFsEntry(entry.path, entry.isFile)),
      ).then(() => loadHistoryItems(openedEntry));
    }
  }

  function restoreRevision(revisionPath) {
    const location = findLocation(openedEntry.locationID);
    const targetPath = getBackupFileLocation(
      openedEntry.path,
      openedEntry.uuid,
      location.getDirSeparator(),
    );
    return copyFilePromiseOverwrite(openedEntry.path, targetPath).then(() =>
      copyFilePromiseOverwrite(revisionPath, openedEntry.path).then(() =>
        reloadOpenedFile(),
      ),
    );
  }
  function titleFormat(lmdt) {
    return lmdt ? format(lmdt, 'dd.MM.yyyy HH:mm:ss') : '';
  }

  function cellFormat(lmdt) {
    return lmdt
      ? formatDistanceToNow(lmdt, {
          includeSeconds: true,
          addSuffix: true,
          // locale: https://date-fns.org/v2.29.3/docs/formatDistanceToNow#usage
        })
      : '';
  }

  const paginatedRows = React.useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage],
  );

  return (
    <Paper
      sx={{ width: '100%', overflow: 'hidden', height: '100%' }} //'calc(100% - 30px)' }}
    >
      {rows.length > initialRowsPerPage && (
        <TablePagination
          rowsPerPageOptions={[10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: '100%',
          overflowY: 'auto',
        }}
      >
        <Table
          data-tid="tableRevisionsTID"
          sx={{ width: '100%', height: '100%' }}
          stickyHeader
          size="small"
          aria-label="revisions table"
        >
          <TableHead>
            <TableRow>
              <TableCell>
                {t('revisions')}
                <TsIconButton
                  tooltip={t('core:deleteAllRevisions')}
                  aria-label="delete all revisions"
                  onClick={() =>
                    confirm(
                      'The all revisions will be deleted. Do you want to continue?',
                    ) && deleteRevisions()
                  }
                  data-tid="deleteRevisionsTID"
                >
                  <DeleteIcon />
                </TsIconButton>
              </TableCell>
              <TableCell align="right">{t('created')}</TableCell>
              <TableCell align="right">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow
                data-tid={openedEntry.uuid}
                key={row.path}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  onClick={() => setPreviewDialogEntry(row)}
                >
                  {row.name}
                </TableCell>
                <TableCell align="right" title={titleFormat(row.lmdt)}>
                  {cellFormat(getLmdt(row.name))}
                </TableCell>
                <TableCell align="right">
                  <TsIconButton
                    tooltip={t('core:view')}
                    aria-label="view revision"
                    onClick={() => setPreviewDialogEntry(row)}
                    data-tid="viewRevisionTID"
                  >
                    <PreviewIcon />
                  </TsIconButton>
                  <TsIconButton
                    tooltip={t('core:restore')}
                    aria-label="restore revision"
                    onClick={() => restoreRevision(row.path)}
                    data-tid="restoreRevisionTID"
                  >
                    <RestoreIcon />
                  </TsIconButton>
                  <TsIconButton
                    tooltip={t('core:delete')}
                    aria-label="delete revision"
                    onClick={() => deleteRevision(row.path)}
                    data-tid="deleteRevisionTID"
                  >
                    <DeleteIcon />
                  </TsIconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FilePreviewDialog
        fsEntry={previewDialogEntry}
        open={previewDialogEntry !== undefined}
        onClose={() => setPreviewDialogEntry(undefined)}
      />
    </Paper>
  );
}

export default Revisions;
