import localFont from 'next/font/local';

// Load Chillax font
export const chillax = localFont({
  src: [
    {
      path: '../../public/fonts/chillax/Chillax-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/chillax/Chillax-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-chillax',
  display: 'swap',
});

// Load Satoshi font
export const satoshi = localFont({
  src: [
    {
      path: '../../public/fonts/satoshi/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
}); 