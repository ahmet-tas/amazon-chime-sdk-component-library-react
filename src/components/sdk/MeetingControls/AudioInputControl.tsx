// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';

import { ControlBarButton } from '../../ui/ControlBar/ControlBarItem';
import { Microphone } from '../../ui/icons';
import { useMeetingManager } from '../../../providers/MeetingProvider';
import { useAudioInputs } from '../../../providers/DevicesProvider';
import { useToggleLocalMute } from '../../../hooks/sdk/useToggleLocalMute';
import { DeviceConfig } from '../../../types';
import { isOptionActive } from '../../../utils/device-utils';
import { PopOverItemProps } from '../../ui/PopOver/PopOverItem';

interface Props {
  /** The label that will be shown when microphone is muted , it defaults to `Mute`. */
  muteLabel?: string;
  /** The label that will be shown when microphone is unmuted, it defaults to `Unmute`. */
  unmuteLabel?: string;
  defaultMuted?: boolean;
}

const AudioInputControl: React.FC<Props> = ({
  muteLabel = 'Mute',
  unmuteLabel = 'Unmute',
  defaultMuted = false
}) => {
  const meetingManager = useMeetingManager();
  const { muted, toggleMute, audioVideo } = useToggleLocalMute();
  const audioInputConfig: DeviceConfig = {
    additionalDevices: true
  };
  const { devices, selectedDevice } = useAudioInputs(audioInputConfig);

  const dropdownOptions: PopOverItemProps[] = devices.map(device => ({
    children: <span>{device.label}</span>,
    checked: isOptionActive(selectedDevice, device.deviceId),
    onClick: (): Promise<void> =>
      meetingManager.selectAudioInputDevice(device.deviceId)
  }));

  useEffect(() => {
    if (audioVideo && defaultMuted) {
      toggleMute();
    }
  }, [audioVideo]);

  return (
    <ControlBarButton
      icon={<Microphone muted={muted} />}
      onClick={toggleMute}
      label={muted ? unmuteLabel : muteLabel}
      popOver={dropdownOptions}
    />
  );
};

export default AudioInputControl;
