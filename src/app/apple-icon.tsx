import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Menshly Wire';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#166f4f',
          borderRadius: '36px',
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M23.4 7.5l-1.2 1.7c-.2.3-.5.4-.9.4H10V7.5h13.4z" fill="white" />
          <path d="M24.5 7.5L13.8 22.1c-.2.3-.5.4-.9.4H8.5L19.2 7.9c.2-.3.5-.4.9-.4h4.4z" fill="white" />
          <path d="M12.6 24.5l1.2-1.7c.2-.3.5-.4.9-.4H22v2.1h-9.4z" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
