import { useEffect, useState } from 'react';

// TabToPro booking embed for House Call Bronze (provider 184010).
// The embed page posts its content height to the parent
// ({ type: 'ttp-embed-height', height }) from the tabtopro.com
// origin; the iframe is resized to match so the full booking
// window is always visible without inner scrolling.
// ?theme=bronze renders the embed in the House Call Bronze look
// (ivory/cream, espresso, bronze + gold, Cormorant Garamond / Jost).
const EMBED_URL =
  'https://tabtopro.com/embed/book/house-call-bronze-custom-mobile-spray-tans-by-meesh-in-spokane-spokane-wa?theme=bronze';
const EMBED_ORIGIN = 'https://tabtopro.com';

export default function TabToProEmbed() {
  const [height, setHeight] = useState(720);
  const [loaded, setLoaded] = useState(false);

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
    <div className="relative w-full" style={{ minHeight: height }}>
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-ivory"
          aria-hidden="true"
        >
          <p className="text-sm tracking-[0.2em] text-espresso/60 uppercase">
            Loading booking…
          </p>
        </div>
      )}
      <iframe
        src={EMBED_URL}
        title="Book an appointment with House Call Bronze"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height,
          border: 0,
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}
      />
    </div>
  );
}
