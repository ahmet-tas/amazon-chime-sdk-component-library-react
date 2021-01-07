// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  ControlBar,
  AudioInputControl,
  VideoInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
  Dots
} from 'amazon-chime-sdk-component-library-react';

import EndMeetingControl from '../EndMeetingControl';
import { useNavigation } from '../../providers/NavigationProvider';
import { StyledControls } from './Styled';


const ControlsByType = {
 moderator: [
  <AudioInputControl />,
  <VideoInputControl />,
  <ContentShareControl />,
  <AudioOutputControl />,
  <EndMeetingControl />
 ],
 attendee: [
  <AudioInputControl />,
  <VideoInputControl />,
  <AudioOutputControl />
 ],
 chat: [
  <AudioInputControl />,
  <VideoInputControl />,
  <AudioOutputControl />
 ]
};

const MeetingControls = (props : any) => {
  const { toggleNavbar, closeRoster, showRoster } = useNavigation();
  const { isUserActive } = useUserActivityState();
  const  type: 'moderator' | 'attendee' | 'chat'  = props.type;
  const handleToggle = () => {
    if (showRoster) {
      closeRoster();
    }

    toggleNavbar();
  };

  return (
    <StyledControls className="controls" active={!!isUserActive}>
      <ControlBar
        className="controls-menu"
        layout="undocked-horizontal"
        showLabels
      >
        <ControlBarButton
          className="mobile-toggle"
          icon={<Dots />}
          onClick={handleToggle}
          label="Menu"
        />
        {type ? 
          ControlsByType[type] 
        :
        <>
          <AudioInputControl />
          <VideoInputControl />
          <ContentShareControl />
          <AudioOutputControl />
          <EndMeetingControl />
        </>
        }
      </ControlBar>
    </StyledControls>
  );
};

export default MeetingControls;
