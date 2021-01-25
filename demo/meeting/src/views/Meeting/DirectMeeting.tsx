// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import {
  VideoTileGrid,
  UserActivityProvider,
  useMeetingManager,
  useNotificationDispatch,
  Severity,
  ActionType,
} from 'amazon-chime-sdk-component-library-react';
// import { useAppState } from '../../providers/AppStateProvider';
import { useHistory } from 'react-router-dom';
import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingDetails from '../../containers/MeetingDetails';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import MeetingMetrics from '../../containers/MeetingMetrics';
import {
  fetchMeeting,
  createGetAttendeeCallback,
  getQueryVariable,
  getNearestRegion,
} from '../../utils/api';
import { useAppState } from '../../providers/AppStateProvider';
import { RealitimeSubscribeStateProvider } from '../../providers/RealtimeSubscribeProvider';

const DirectMeeting = () => {
  const { setAppMeetingInfo, meetingId } = useAppState();

  const history = useHistory();

  const meetingManager = useMeetingManager();

  const dispatch = useNotificationDispatch();

  const userType = getQueryVariable('t', history.location);

  useMeetingEndRedirect();

  const { showNavbar, showRoster, showChat, toggleRoster } = useNavigation();

  const fetchData = React.useCallback(async (): Promise<void> => {
    const region = await getNearestRegion();
    const id = getQueryVariable('m', history.location);
    const attendeeName = decodeURIComponent(
      getQueryVariable('n', history.location)
    );
    setAppMeetingInfo(id, attendeeName, region);
    meetingManager.getAttendee = createGetAttendeeCallback(id);
    try {
      const { JoinInfo } = await fetchMeeting(id, attendeeName, region);
      await meetingManager.join({
        meetingInfo: JoinInfo.Meeting,
        attendeeInfo: JoinInfo.Attendee,
      });
      await meetingManager.start();
    } catch (error) {}
  }, [history.location, meetingManager, setAppMeetingInfo]);

  useEffect(() => {
    toggleRoster();

    fetchData();

    if (userType === 'attendee') {
      const notificationPayload = {
        severity: Severity.INFO,
        message: 'You entered in listen-only mode. Your video is not enabled',
        autoClose: true,
        autoCloseDelay: 5000,
      };

      dispatch({
        type: ActionType.ADD,
        payload: notificationPayload,
      });
    }
  }, []);

  return (
    <UserActivityProvider>
      <StyledLayout showNav={showNavbar} showRoster={showRoster || showChat}>
        <RealitimeSubscribeStateProvider>
          <StyledContent>
            <MeetingMetrics />
            <VideoTileGrid
              className="videos"
              noRemoteVideoView={<MeetingDetails type={userType} />}
            />
            <MeetingControls type={userType} meetingId={meetingId} />
          </StyledContent>
          <NavigationControl />
        </RealitimeSubscribeStateProvider>
      </StyledLayout>
    </UserActivityProvider>
  );
};

export default DirectMeeting;
