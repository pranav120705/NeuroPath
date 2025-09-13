
import React from 'react';

export const LogoIcon: React.FC<{size?: number}> = ({size = 8}) => (
  <svg
    className={`w-${size} h-${size} text-blue-600`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
      clipRule="evenodd"
    />
    <path d="M12.5 12.5a.75.75 0 00-1.5 0v3a.75.75 0 00.75.75h3a.75.75 0 000-1.5h-2.25v-2.25z" />
    <path d="M15.75 8.25a.75.75 0 00-1.5 0v1.5a.75.75 0 00.75.75h1.5a.75.75 0 000-1.5h-.75V8.25z" />
  </svg>
);
