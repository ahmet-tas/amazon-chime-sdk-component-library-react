// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';

import { BaseProps } from '../Base';
import { StyledBadge } from './Styled';

export interface BadgeProps extends BaseProps {
  /** The value shows in the badge*/
  value: string | number;
  /** The status of the badge */
  status?: "default" | "alert";
}

export const Badge: FC<BadgeProps> = ({ value, status = "default", className, tag, ...rest }) => {
  return (
    <StyledBadge className={className || ''} as={tag} status={status} data-testid='badge' {...rest}>
      {value}
    </StyledBadge>
  );
};

Badge.displayName = 'Badge';

export default Badge;