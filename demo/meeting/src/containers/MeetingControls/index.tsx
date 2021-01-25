/* eslint-disable no-unused-expressions */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import {
  ControlBar,
  AudioInputControl,
  VideoInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
  Dots,
  useAudioVideo,
  useNotificationDispatch,
  Severity,
  ActionType,
} from 'amazon-chime-sdk-component-library-react';

import { DataMessage } from 'amazon-chime-sdk-js';

/* import EndMeetingControl from '../EndMeetingControl'; */
import MuteAllControl from '../MuteAllControl';
import { useNavigation } from '../../providers/NavigationProvider';
import { useLocalVideo } from '../../../../../src/providers/LocalVideoProvider';
import { StyledControls } from './Styled';

const ControlsByType = {
  moderator: (
    <>
      <AudioInputControl />
      <VideoInputControl onByDefault />
      <ContentShareControl />
      <AudioOutputControl />
      <MuteAllControl />
      {/* <EndMeetingControl /> */}
    </>
  ),
  attendee: (
    <>
      <AudioInputControl defaultMuted />
      <VideoInputControl onByDefault={false} />
      <AudioOutputControl />
    </>
  ),
  chat: (
    <>
      <AudioInputControl />
      <AudioOutputControl />
      <VideoInputControl onByDefault />
    </>
  ),
};

interface Props {
  type?: string;
  meetingId?: string;
}

const MeetingControls: React.FC<Props> = ({ type, meetingId = null }) => {
  const {
    toggleNavbar,
    closeRoster,
    showRoster,
    showChat,
    closeChat,
  } = useNavigation();
  const { isUserActive } = useUserActivityState();
  const audioVideo = useAudioVideo();
  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const dispatch = useNotificationDispatch();

  const handleToggle = (): void => {
    if (showRoster) {
      closeRoster();
    }

    if (showChat) {
      closeChat();
    }

    toggleNavbar();
  };

  const showMutedNotification = React.useCallback((): void => {
    const notificationPayload = {
      severity: Severity.INFO,
      message: 'You were muted by the moderator',
      autoClose: true,
      autoCloseDelay: 5000,
    };

    dispatch({
      type: ActionType.ADD,
      payload: notificationPayload,
    });
  }, [dispatch]);

  const handleMuteEvent = React.useCallback(
    (eventData: DataMessage): void => {
      const data = JSON.parse(eventData.text());
      console.log('data', data);
      const muted = audioVideo?.realtimeIsLocalAudioMuted() || false;
      // const videoEnabled = audioVideo?.hasStartedLocalVideoTile() || false;
      if (meetingId && data.meetingId === meetingId) {
        const alreadyMuted = !muted && !isVideoEnabled;
        if (!muted) {
          audioVideo?.realtimeMuteLocalAudio();
        }

        if (isVideoEnabled) {
          toggleVideo();
        }

        if (!alreadyMuted) {
          showMutedNotification();
        }
      }
    },
    [audioVideo, isVideoEnabled, meetingId, toggleVideo, showMutedNotification]
  );

  useEffect(() => {
    if (type && type !== 'moderator' && audioVideo) {
      audioVideo?.realtimeSubscribeToReceiveDataMessage(
        'MUTE_ALL',
        handleMuteEvent
      );
    }
    return (): void => {
      audioVideo?.realtimeUnsubscribeFromReceiveDataMessage('MUTE_ALL');
    };
  }, [type, audioVideo, handleMuteEvent]);

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
        {type ? ControlsByType[type] : ControlsByType.moderator}
      </ControlBar>
    </StyledControls>
  );
};

export default MeetingControls;
