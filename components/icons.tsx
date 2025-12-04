import React from 'react';

interface IconProps {
    className?: string;
}

export const HeartIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

export const FlowerIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm5.12-6.34C15.93 7.2 13.57 6 12 6s-3.93 1.2-5.12 3.66C5.69 11.23 8.5 14 12 14s6.31-2.77 5.12-4.34zM12 4c1.33 0 2.59.36 3.71 1.02C13.83 2.86 10.37 2 9 2c-3.31 0-6 2.69-6 6 0 1.5.55 2.87 1.45 3.93C3.36 10.59 3 9.33 3 8c0-3.31 2.69-6 6-6h3zm-3 18c-1.33 0-2.59-.36-3.71-1.02C10.17 21.14 13.63 22 15 22c3.31 0 6-2.69 6-6 0-1.5-.55-2.87-1.45-3.93C20.64 13.41 21 14.67 21 16c0 3.31-2.69 6-6 6h-3z" />
    </svg>
);

export const SaturnIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm-8.82-3.82c.49 2.53 2.56 4.6 5.09 5.09-2.11-.9-3.79-2.58-5.09-5.09zm12.55 0c-1.3 2.51-2.98 4.19-5.09 5.09 2.53-.49 4.6-2.56 5.09-5.09z" />
    </svg>
);

export const BuddhaIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2c2.48 0 4.7.94 6.39 2.5S21 7.52 21 10c0 2.29-1.23 4.65-3.03 6.13-.9.74-1.99 1.5-3.22 1.95V19h1.25c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25H9.99c-.69 0-1.25-.56-1.25-1.25S9.3 19 9.99 19H11.25v-1.03c-1.23-.45-2.32-1.21-3.22-1.95C6.23 14.65 5 12.29 5 10c0-2.48.94-4.7 2.61-6.5S10.52 2 13 2h-1zm0 2c-3.86 0-7 3.14-7 7 0 2.5 1.55 5.2 3.61 6.89.78.63 1.63 1.15 2.39 1.48V18h2v-1.63c.76-.33 1.61-.85 2.39-1.48C17.45 13.2 19 10.5 19 8c0-3.86-3.14-7-7-7z" />
    </svg>
);

export const FireworksIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2v2m0 16v2m8-10h-2M4 12H2m15.66-5.66l-1.42 1.42M5.76 18.24l-1.42 1.42m14.14 0l-1.42-1.42M5.76 5.76L4.34 4.34m.7 7.24a5 5 0 0 0 10 0 5 5 0 0 0-10 0z" />
    </svg>
);