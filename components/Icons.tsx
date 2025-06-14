import React from 'react';

interface IconProps {
  className?: string;
  title?: string; 
}

const IconDownloadComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
export const IconDownload = React.memo(IconDownloadComponent);

const IconUploadComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
export const IconUpload = React.memo(IconUploadComponent);

const IconClipboardCopyComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);
export const IconClipboardCopy = React.memo(IconClipboardCopyComponent);

const IconDocumentTextComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
export const IconDocumentText = React.memo(IconDocumentTextComponent);

const IconFileTypeDocComponent: React.FC<IconProps> = ({ className, title }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
  {title && <title>{title}</title>}
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25.075V3.75c0 .621.504 1.125 1.125 1.125H13.5m-3 0V3.75m0 0h-.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h.375m-3.75 0h.375M10.5 3.75h.375m0 0c.053 0 .106.002.158.005M16.5 21H7.5a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 017.5 3h6a2.25 2.25 0 012.25 2.25v3.75m.75 6.75v.008c.005.05.01.1.018.147m.026.155a4.502 4.502 0 01-5.193 4.103M16.5 21V10.5M16.5 21v-1.875a.375.375 0 00-.375-.375H13.5A2.625 2.625 0 0110.875 16.5V18a2.25 2.25 0 002.25 2.25h.375M16.5 21h-3.375c-.621 0-1.125-.504-1.125-1.125V18.75m0 0V16.5m0 2.25v-2.25m0 0H12m0 0h2.625m0 0h.375a2.25 2.25 0 012.25 2.25V21" />
 </svg>
);
export const IconFileTypeDoc = React.memo(IconFileTypeDocComponent);

const IconTrashComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.678-.112 1.017-.165M10.5 5.79V4.687c0-.265-.213-.48-.478-.48H4.978a.479.479 0 00-.478.48v1.103m10.526 0V4.687c0-.265-.213-.48-.478-.48h-.758M14.741 5.79c0 .265-.213.48-.478.48H9.737c-.265 0-.478-.213-.478-.48V4.687c0-.265.213-.48.478-.48h4.526c.265 0 .478.213.478.48v1.103z" />
  </svg>
);
export const IconTrash = React.memo(IconTrashComponent);

const IconFileCheckComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
export const IconFileCheck = React.memo(IconFileCheckComponent);

const IconXCircleComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
export const IconXCircle = React.memo(IconXCircleComponent);

const IconCoffeeComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25L18.735 7.355A3 3 0 0016.5 6.75H7.5a3 3 0 00-2.235.605L4.5 8.25m15 0v9.75A2.25 2.25 0 0117.25 20.25H6.75A2.25 2.25 0 014.5 18V8.25m15 0H4.5M7.5 12.75h9" />
  </svg>
);
export const IconCoffee = React.memo(IconCoffeeComponent);

const IconAlertTriangleComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);
export const IconAlertTriangle = React.memo(IconAlertTriangleComponent);

const IconCloudArrowUpComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.096" />
  </svg>
);
export const IconCloudArrowUp = React.memo(IconCloudArrowUpComponent);

const IconSparklesComponent: React.FC<IconProps> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75l-1.25-1.75L14.25 12l1.5-1.75L17 8.5l1.25 1.75L19.75 12l-1.5 1.75z" />
  </svg>
);
export const IconSparkles = React.memo(IconSparklesComponent);
