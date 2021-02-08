// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import {
  Navbar,
  NavbarHeader,
  NavbarItem,
  Attendees,
  Chat,
  Information,
} from 'amazon-chime-sdk-component-library-react';
import { useRealitimeSubscribeChatState } from '../../providers/RealtimeSubscribeChatProvider';

import { useNavigation } from '../../providers/NavigationProvider';
//import { useAppState } from '../../providers/AppStateProvider';

const Navigation: React.FC<any> = () => {
  const {
    toggleRoster,
    toggleMetrics,
    closeNavbar,
    toggleChat,
    showChat,
    showRoster,
  } = useNavigation();
  // const { theme } = useAppState();
  const {
    hasUnReadMessages,
    setHasUnReadMessages,
  } = useRealitimeSubscribeChatState();

  const toggleChatList = (): void => {
    if (showRoster) {
      toggleRoster();
    }
    setHasUnReadMessages(false);
    toggleChat();
  };

  const toggleAttendeeList = (): void => {
    if (showChat) {
      toggleChat();
    }
    toggleRoster();
  };

  return (
    <Navbar className="nav" flexDirection="column" container>
      <NavbarHeader title="Navigation" onClose={closeNavbar} />
      <NavbarItem
        icon={<Chat unReadIcon={!showChat && hasUnReadMessages} />}
        onClick={toggleChatList}
        label="Chat"
      />
      <NavbarItem
        icon={<Attendees />}
        onClick={toggleAttendeeList}
        label="Attendees"
      />
      <NavbarItem
        icon={<Information />}
        onClick={toggleMetrics}
        label="Meeting metrics"
      />
    </Navbar>
  );
};

export default Navigation;
