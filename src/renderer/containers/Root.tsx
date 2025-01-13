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
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Store } from 'redux';
import AppConfig from '-/AppConfig';
import { actions as AppActions } from '../reducers/app';
import App from '-/containers/App';
import MainPage from '-/containers/MainPage';
import TsAuth from '-/containers/TsAuth';
import i18nInit from '-/services/i18nInit';
import { OpenedEntryContextProvider } from '-/hooks/OpenedEntryContextProvider';
import { DirectoryContentContextProvider } from '-/hooks/DirectoryContentContextProvider';
import { CurrentLocationContextProvider } from '-/hooks/CurrentLocationContextProvider';
import { NotificationContextProvider } from '-/hooks/NotificationContextProvider';
import { IOActionsContextProvider } from '-/hooks/IOActionsContextProvider';
import { TaggingActionsContextProvider } from '-/hooks/TaggingActionsContextProvider';
import { LocationIndexContextProvider } from '-/hooks/LocationIndexContextProvider';
import { SelectedEntryContextProvider } from '-/hooks/SelectedEntryContextProvider';
import { FSWatcherContextProvider } from '-/hooks/FSWatcherContextProvider';
import { PlatformFacadeContextProvider } from '-/hooks/PlatformFacadeContextProvider';
import { EditedEntryContextProvider } from '-/hooks/EditedEntryContextProvider';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { EditedEntryMetaContextProvider } from '-/hooks/EditedEntryMetaContextProvider';
import { TagGroupsLocationContextProvider } from '-/hooks/TagGroupsLocationContextProvider';
import { EditedTagLibraryContextProvider } from '-/hooks/EditedTagLibraryContextProvider';
import { EditedKanBanMetaContextProvider } from '-/hooks/EditedKanBanMetaContextProvider';
import { PerspectiveActionsContextProvider } from '-/hooks/PerspectiveActionsContextProvider';
import { Pro } from '-/pro';
import { ExtensionsContextProvider } from '-/hooks/ExtensionsContextProvider';
import { PanelsContextProvider } from '-/hooks/PanelsContextProvider';
import { UserContextProvider } from '-/hooks/UserContextProvider';
import { SavedSearchesContextProvider } from '-/hooks/SavedSearchesContextProvider';
import DialogsRoot from '-/containers/DialogsRoot';
import { BrowserHistoryContextProvider } from '-/hooks/BrowserHistoryContextProvider';
import { ChatContextProvider } from '-/hooks/ChatProvider';
import { FileUploadDialogContextProvider } from '-/components/dialogs/hooks/FileUploadDialogContextProvider';
import { EntryPropsTabsContextProvider } from '-/hooks/EntryPropsTabsContextProvider';

type RootType = {
  store: Store<{}>;
  persistor: {};
};

export default function Root({ store, persistor }: RootType) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const language: string = store.getState().settings.interfaceLanguage;
    i18nInit(language).then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return <span />;
  }

  let appContent = (
    <App>
      <NotificationContextProvider>
        <CurrentLocationContextProvider>
          <EditedEntryContextProvider>
            <EditedEntryMetaContextProvider>
              <EditedTagLibraryContextProvider>
                <PerspectiveActionsContextProvider>
                  <EditedKanBanMetaContextProvider>
                    <SelectedEntryContextProvider>
                      <DirectoryContentContextProvider>
                        <FSWatcherContextProvider>
                          <PlatformFacadeContextProvider>
                            <LocationIndexContextProvider>
                              <IOActionsContextProvider>
                                <EntryPropsTabsContextProvider>
                                  <OpenedEntryContextProvider>
                                    <TagGroupsLocationContextProvider>
                                      <TaggingActionsContextProvider>
                                        <DndProvider backend={HTML5Backend}>
                                          <ExtensionsContextProvider>
                                            <PanelsContextProvider>
                                              <UserContextProvider>
                                                <SavedSearchesContextProvider>
                                                  <BrowserHistoryContextProvider>
                                                    <FileUploadDialogContextProvider>
                                                      <ChatContextProvider>
                                                        {Pro ? (
                                                          <Pro.contextProviders.BookmarksContextProvider>
                                                            <Pro.contextProviders.HistoryContextProvider>
                                                              <Pro.contextProviders.KanBanImportDialogContextProvider>
                                                                <DialogsRoot>
                                                                  <MainPage />
                                                                </DialogsRoot>
                                                              </Pro.contextProviders.KanBanImportDialogContextProvider>
                                                            </Pro.contextProviders.HistoryContextProvider>
                                                          </Pro.contextProviders.BookmarksContextProvider>
                                                        ) : (
                                                          <DialogsRoot>
                                                            <MainPage />
                                                          </DialogsRoot>
                                                        )}
                                                      </ChatContextProvider>
                                                    </FileUploadDialogContextProvider>
                                                  </BrowserHistoryContextProvider>
                                                </SavedSearchesContextProvider>
                                              </UserContextProvider>
                                            </PanelsContextProvider>
                                          </ExtensionsContextProvider>
                                        </DndProvider>
                                      </TaggingActionsContextProvider>
                                    </TagGroupsLocationContextProvider>
                                  </OpenedEntryContextProvider>
                                </EntryPropsTabsContextProvider>
                              </IOActionsContextProvider>
                            </LocationIndexContextProvider>
                          </PlatformFacadeContextProvider>
                        </FSWatcherContextProvider>
                      </DirectoryContentContextProvider>
                    </SelectedEntryContextProvider>
                  </EditedKanBanMetaContextProvider>
                </PerspectiveActionsContextProvider>
              </EditedTagLibraryContextProvider>
            </EditedEntryMetaContextProvider>
          </EditedEntryContextProvider>
        </CurrentLocationContextProvider>
      </NotificationContextProvider>
    </App>
  );

  if (AppConfig.isWeb) {
    appContent = <TsAuth>{appContent}</TsAuth>;
  }

  return (
    <Provider
      // @ts-ignore
      store={store}
    >
      {/**
       * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
       * and saved to redux.
       * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
       * for example `loading={<SplashScreen />}`.
       * @see https://github.com/rt2zz/redux-persist/blob/master/docs/PersistGate.md
       */}
      <PersistGate
        // loading={<LoadingScreen />}
        onBeforeLift={() => {
          // eslint-disable-next-line react/prop-types
          if (!AppConfig.isAmplify) {
            // || store.app.user !== undefined
            // @ts-ignore
            store.dispatch(AppActions.initApp());
          }
        }}
        // @ts-ignore
        persistor={persistor}
      >
        {appContent}
      </PersistGate>
    </Provider>
  );
}
