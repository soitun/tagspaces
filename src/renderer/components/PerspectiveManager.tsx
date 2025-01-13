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

import React from 'react';
import Typography from '@mui/material/Typography';
import { classes, SidePanel } from '-/components/SidePanels.css';

interface Props {
  style: any;
}

function PerspectiveManager(props: Props) {
  return (
    <SidePanel style={props.style}>
      <Typography className={classes.panelTitle}>Perspectives</Typography>
    </SidePanel>
  );
  //         <TsButton onClick={() => history.push('/login')}>Login</TsButton>
}

export default PerspectiveManager;
