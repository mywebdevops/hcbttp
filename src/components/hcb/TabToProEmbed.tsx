import { useEffect, useState } from 'react';

// TabToPro booking embed for House Call Bronze (provider 184010).
// The embed page posts its content height to the parent
// ({ type: 'ttp-embed-height', height }) from the tabtopro.com
// origin; the iframe is resized to match so the full booking
// window is always visible without inner scrolling.
const EMBED_URL =
  'https://tabtopro.com/embed/book/house-call-bronze-custom-mobile-spray-tans-by-meesh-in-spokane-spokane-wa';
const EMBED_ORIGIN = 'https://tabtopro.com';

export default function TabToProEmbed() {
  const [height, setHeight] = useState(720);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== EMBED_ORIGIN) return;
      const data = e.data as { type?: string; height?: number } | null;
      if (
        data &&
        data.type === 'ttp-embed-height' &&
        typeof data.height === 'number' &&
        data.height > 0
      ) {
        setHeight(Math.ceil(data.height));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <iframe
      src={EMBED_URL}
      title="Book an appointment with House Call Bronze"
      style={{ width: '100%', height, border: 0, display: 'block' }}
    />
  );
}
