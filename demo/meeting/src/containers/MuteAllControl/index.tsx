// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useAudioVideo } from 'amazon-chime-sdk-component-library-react';
import { ControlBarButton } from '../../../../../src/components/ui/ControlBar/ControlBarItem';
import { Remove } from '../../../../../src/components/ui/icons';
import { useAppState } from '../../providers/AppStateProvider';

interface Props {}

const MuteAllControl: React.FC<Props> = () => {
  const { meetingId } = useAppState();
  const audioVideo = useAudioVideo();

  const muteAll = (): void => {
    console.log('on mute');
    const data = {
      meetingId,
    };
    // eslint-disable-next-line no-unused-expressions
    audioVideo?.realtimeSendDataMessage('MUTE_ALL', JSON.stringify(data));
  };

  return (
    <ControlBarButton
      icon={<Remove />}
      onClick={muteAll}
      label="Mute All"
      popOver={null}
    />
  );
};

export default MuteAllControl;
