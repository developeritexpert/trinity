import localFont from 'next/font/local';

export const shirtIcons = localFont({
  src: '../../../public/fonts/custom-icons.woff2',
  variable: '--font-shirt-icons',
  display: 'swap',
});

export const trouserIcons = localFont({
  src: '../../../public/fonts/custom-pants.woff2',
  variable: '--font-trouser-icons',
  display: 'swap',
});
