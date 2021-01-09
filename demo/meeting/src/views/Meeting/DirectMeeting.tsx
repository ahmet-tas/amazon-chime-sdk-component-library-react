// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import {
  VideoTileGrid,
  UserActivityProvider,
  useMeetingManager
} from 'amazon-chime-sdk-component-library-react';
// import { useAppState } from '../../providers/AppStateProvider';
import { useHistory } from 'react-router-dom'
import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingDetails from '../../containers/MeetingDetails';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import MeetingMetrics from '../../containers/MeetingMetrics';
import { fetchMeeting, createGetAttendeeCallback } from '../../utils/api';
import { useAppState } from '../../providers/AppStateProvider';
import { RealitimeSubscribeStateProvider } from '../../providers/RealtimeSubscribeProvider';


const DirectMeeting = () => {
  const { setAppMeetingInfo } = useAppState();

  let history = useHistory();

  const meetingManager = useMeetingManager();
  
  useMeetingEndRedirect();
  
  const { showNavbar, showRoster, showChat, toggleRoster } = useNavigation();



  function getQueryVariable(variable: string) {
    var query = history.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable){return pair[1];}
    }
    return('');
  }
  
  useEffect(() => {
    toggleRoster();

    fetchData();
  }, [])

  const getNearestRegion = async () => {

    try {
      const res = await fetch(`https://nearest-media-region.l.chime.aws`, {
        method: 'GET'
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      const data = await res.json();
      return data.region;
    } catch (e) {
      console.error('Could not fetch nearest region: ', e.message);
    }
  }

  const fetchData = async () => {
    const region = await getNearestRegion();
    const id = getQueryVariable('m');
    const attendeeName = decodeURIComponent(getQueryVariable('n'));
    await setAppMeetingInfo(id, attendeeName, region);
    meetingManager.getAttendee = createGetAttendeeCallback(id);
    try {
      const { JoinInfo } = await fetchMeeting(id, attendeeName, region);
      await meetingManager.join({
        meetingInfo: JoinInfo.Meeting,
        attendeeInfo: JoinInfo.Attendee
      });
      await meetingManager.start();
    } catch (error) {
    
    }
  }

  return (
    <UserActivityProvider>
      <StyledLayout showNav={showNavbar} showRoster={showRoster || showChat}>
      <RealitimeSubscribeStateProvider>
        <StyledContent>
          <MeetingMetrics />
          <VideoTileGrid
            className="videos"
            noRemoteVideoView={<MeetingDetails />}
          />
          <MeetingControls type={getQueryVariable('t')} />
        </StyledContent>
        <NavigationControl />
        </RealitimeSubscribeStateProvider>
      </StyledLayout>
    </UserActivityProvider>
  );
};

export default DirectMeeting;
