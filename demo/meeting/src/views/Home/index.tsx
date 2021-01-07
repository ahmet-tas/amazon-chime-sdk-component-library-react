// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useHistory } from 'react-router-dom'
import MeetingFormSelector from '../../containers/MeetingFormSelector';
import { StyledLayout } from './Styled';
import { VersionLabel } from '../../utils/VersionLabel';
import DirectMeeting from '../Meeting/DirectMeeting';

const Home = () => {
  let history = useHistory();
  if(history.location.search === "") {
    return (
    <StyledLayout>
      <MeetingFormSelector />
      <VersionLabel />
    </StyledLayout>);
  }else{
    return <DirectMeeting/>
  }
};

export default Home;
