// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import {
  Flex,
  Heading,
  // PrimaryButton,
  // useMeetingManager,
} from 'amazon-chime-sdk-component-library-react';

// import { useAppState } from '../../providers/AppStateProvider';
// import { StyledList } from './Styled';

interface Props {
  type?: string;
}

const MeetingDetails: React.FC<Props> = ({ type = 'chat' }) => {
  // const { meetingId /* toggleTheme, theme */ } = useAppState();
  // const manager = useMeetingManager();

  return (
    <Flex container layout="fill-space-centered">
      <Flex mb="2rem" mr={{ md: '2rem' }} px="1rem">
        <Heading level={4} tag="h1" mb={2}>
          Meeting information
        </Heading>
        {/* <StyledList>
          <div>
            <dt>Meeting ID</dt>
            <dd>{meetingId}</dd>
          </div>
          <div>
            <dt>Hosted region</dt>
            <dd>{manager.meetingRegion}</dd>
          </div>
        </StyledList> */}

        {type && (type === 'moderator' || type === 'attendee') ? (
          <Heading level={4} tag="h1" mb={2}>
            Invite more people to your speeed networking event to start the chat
          </Heading>
        ) : (
          <div>
            <Heading level={4} tag="h1" mb={2}>
              Connecting to your chat partner
            </Heading>
            <b>Chat will begin shortly. Please hold on</b>
          </div>
        )}
        {/*         <Heading level={4} tag="h1" mb={2}>
        Invite more people to start the event
        </Heading> */}
        {/*         <PrimaryButton
          mt={4}
          label={theme === 'light' ? 'Dark mode' : 'Light mode'}
          onClick={toggleTheme}
        ></PrimaryButton> */}
      </Flex>
    </Flex>
  );
};

export default MeetingDetails;
