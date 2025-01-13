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

import { TS } from '-/tagspaces.namespace';
import Grid from '@mui/material/Grid';
import React, { useContext } from 'react';
import TsButton from '-/components/TsButton';
import ListItem from '@mui/material/ListItem';
import { Tooltip } from '@mui/material';
import { Pro } from '-/pro';
import BookmarkTwoToneIcon from '@mui/icons-material/BookmarkTwoTone';
import {
  extractDirectoryName,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import TsIconButton from '-/components/TsIconButton';
import { RemoveIcon, HistoryIcon } from '-/components/CommonIcons';
import { dataTidFormat } from '-/services/test';
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';
import TooltipTS from '-/components/Tooltip';
import { useBrowserHistoryContext } from '-/hooks/useBrowserHistoryContext';

interface Props {
  historyKey: string;
  items: Array<TS.HistoryItem> | Array<TS.BookmarkItem>;
  update: () => void;
  maxItems?: number | undefined;
  showDelete?: boolean;
}
function RenderHistory(props: Props) {
  const { t } = useTranslation();
  const { openHistoryItem } = useBrowserHistoryContext();
  const bookmarksContext = Pro?.contextProviders?.BookmarksContext
    ? useContext<TS.BookmarksContextData>(Pro.contextProviders.BookmarksContext)
    : undefined;
  const historyContext = Pro?.contextProviders?.HistoryContext
    ? useContext<TS.HistoryContextData>(Pro.contextProviders.HistoryContext)
    : undefined;
  const { historyKey, items, update, maxItems, showDelete = true } = props;

  return (
    <>
      {items &&
        items.slice(0, maxItems || items.length).map((item) => {
          const itemName = item.path.endsWith(AppConfig.dirSeparator)
            ? extractDirectoryName(item.path, AppConfig.dirSeparator)
            : extractFileName(item.path, AppConfig.dirSeparator);
          return (
            <ListItem
              dense
              style={{ paddingLeft: 0 }}
              key={item.creationTimeStamp}
            >
              <Grid item xs={10} style={{ minWidth: 245, maxWidth: 245 }}>
                <TsButton
                  data-tid={historyKey + 'TID' + dataTidFormat(itemName)}
                  variant="text"
                  style={{
                    textTransform: 'none',
                    fontWeight: 'normal',
                    justifyContent: 'start',
                  }}
                  onClick={() => openHistoryItem(item as TS.HistoryItem)}
                >
                  <Tooltip
                    title={
                      <span style={{ fontSize: 14 }}>
                        <b>{t('core:filePath')}:</b> {item.path}
                        <br />
                        <br />
                        {/* <b>Opened on: </b>{' '} */}
                        {new Date(item.creationTimeStamp)
                          .toISOString()
                          .substring(0, 19)
                          .split('T')
                          .join(' ')}
                      </span>
                    }
                  >
                    {historyKey === Pro.keys.bookmarksKey ? (
                      <BookmarkTwoToneIcon />
                    ) : (
                      <HistoryIcon />
                    )}
                  </Tooltip>
                  &nbsp;
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      maxWidth: 220,
                    }}
                  >
                    {itemName}
                  </span>
                </TsButton>
              </Grid>
              {showDelete && (
                <Grid item xs={2}>
                  <TsIconButton
                    tooltip={t('delete')}
                    aria-label={t('core:clearHistory')}
                    onClick={() => {
                      if (historyKey === Pro.keys.bookmarksKey) {
                        //del bookmarks
                        bookmarksContext.delBookmark(item.path);
                      } else {
                        historyContext.delHistory(
                          historyKey,
                          item.creationTimeStamp,
                        );
                      }
                      update();
                    }}
                    data-tid="deleteHistoryItemTID"
                  >
                    <RemoveIcon />
                  </TsIconButton>
                </Grid>
              )}
            </ListItem>
          );
        })}
    </>
  );
}

export default RenderHistory;
