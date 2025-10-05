import React from 'react';
import styled from 'styled-components';
import Button from '../Button';
import { getValueFromTheme } from '../../common/utils/getValueFromTheme';

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
      fill="currentColor"
    />
  </svg>
);

const StyledButton = styled(Button)`
  font-size: 12px;
  padding: 6px 8px;
  min-height: auto;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

interface GoogleCalendarButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const GoogleCalendarButton: React.FC<GoogleCalendarButtonProps> = ({
  onClick,
  children,
  variant = 'tertiary',
  size = 'sm',
  disabled = false,
}) => {
  return (
    <StyledButton
      $type={variant}
      $size={size}
      onClick={onClick}
      disabled={disabled}
      title="Додати до Google Calendar"
    >
      <CalendarIcon />
      {children}
    </StyledButton>
  );
};

export default GoogleCalendarButton;
