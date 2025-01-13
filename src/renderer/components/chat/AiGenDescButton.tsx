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
import TsButton, { TSButtonProps } from '-/components/TsButton';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useChatContext } from '-/hooks/useChatContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { formatDateTime } from '@tagspaces/tagspaces-common/misc';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AIIcon } from '../CommonIcons';
import { actions as SettingsActions } from '-/reducers/settings';
import { AppDispatch } from '-/reducers/app';
import { useDispatch } from 'react-redux';

type Props = TSButtonProps & {};

function AiGenDescButton(props: Props) {
  const { t } = useTranslation();
  const { style, disabled } = props;
  const dispatch: AppDispatch = useDispatch();
  const { openedEntry } = useOpenedEntryContext();
  const { generate, openedEntryModel } = useChatContext();
  const { setDescription, saveDescription } = useFilePropertiesContext();
  const { showNotification } = useNotificationContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (
    !openedEntry ||
    !openedEntryModel ||
    ![
      ...AppConfig.aiSupportedFiletypes.text,
      ...AppConfig.aiSupportedFiletypes.image,
    ].includes(openedEntry.extension)
  ) {
    return null;
  }

  const ext = extractFileExtension(openedEntry.name).toLowerCase();

  function handleGenerationResults(response) {
    //console.log('newOllamaMessage response:' + response);
    setIsLoading(false);
    if (response) {
      dispatch(SettingsActions.setEntryContainerTab(TabNames.descriptionTab));
      response =
        response +
        '\\\n *Generated with AI on ' +
        formatDateTime(new Date(), true) +
        '* \n';
      if (openedEntry.meta.description) {
        setDescription(openedEntry.meta.description + '\n *** \n' + response);
      } else {
        setDescription(response);
      }
      saveDescription();
      //openEntry(openedEntry.path).then(() => {
      showNotification(
        'Description for ' + openedEntry.name + ' generated by an AI.',
      );
    }
  }

  return (
    <TsButton
      loading={isLoading}
      disabled={isLoading || disabled}
      tooltip="Uses currently configured AI model to generate description for this file"
      startIcon={<AIIcon />}
      data-tid="generateDescriptionAITID"
      style={style}
      onClick={() => {
        setIsLoading(true);
        if (AppConfig.aiSupportedFiletypes.image.includes(ext)) {
          generate('image', 'description').then((results) =>
            handleGenerationResults(results),
          );
        } else if (AppConfig.aiSupportedFiletypes.text.includes(ext)) {
          generate(ext === 'pdf' ? 'image' : 'text', 'summary').then(
            (results) => handleGenerationResults(results),
          );
        }
      }}
    >
      {t('core:generateDescription')}
    </TsButton>
  );
}

export default AiGenDescButton;
