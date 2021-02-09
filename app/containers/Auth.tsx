/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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
import {
  AmplifyAuthenticator,
  AmplifySignIn,
  AmplifySignUp
} from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import HandleAuth from '-/utils/HandleAuth';
import LogoIcon from '-/assets/images/icon100x100.svg';

const Auth: React.FC<any> = props => {
  let awsconfig;
  try {
    // eslint-disable-next-line global-require
    awsconfig = require('-/aws-exports');
  } catch (e) {
    if (e && e.code && e.code === 'MODULE_NOT_FOUND') {
      console.debug(
        'Auth functionality not available aws-exports.js is missing. Are you sure that you have run "amplitude init"?'
      );
      return props.children;
    }
    throw e;
  }

  if (awsconfig !== undefined) {
    Amplify.configure(awsconfig.default);
    return (
      <>
        <HandleAuth />
        <AmplifyAuthenticator
          usernameAlias="email"
          style={{
            // @ts-ignore
            '--amplify-primary-color': '#1dd19f',
            '--amplify-primary-tint': '#1dd19f',
            '--amplify-primary-shade': '#4A5568'
          }}
        >
          <AmplifySignUp
            slot="sign-up"
            usernameAlias="email"
            formFields={[
              {
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email',
                required: true
              },
              {
                type: 'password',
                label: 'Password',
                placeholder: 'Enter your password',
                required: true
              }
            ]}
          />
          <AmplifySignIn
            headerText="Sign in to your TagSpaces account"
            slot="sign-in"
            usernameAlias="email"
          >
            <div slot="header-subtitle" style={{ textAlign: 'center' }}>
              <img alt="logo" src={LogoIcon} />
            </div>
          </AmplifySignIn>
          {props.children}
        </AmplifyAuthenticator>
      </>
    );
  }
  return <h1>Loading...</h1>;
};

export default Auth;
