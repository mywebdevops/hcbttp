import { useState, type FormEvent } from 'react';
import type { SiteBlock } from '@/lib/siteContent';
import Reveal from './Reveal';

// Custom blocks from the hub page builder. They render in Michelle's
// own design language — same sections, type, and palette — so a
// block she adds can never clash with the rest of her site.

const HUB_FORM_ENDPOINT = 'https://hub.tabtopro.com/api/form-submissions';
const SITE_SLUG = 'house-call-bronze';

function Paragraphs({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {text
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="mt-4 text-[15px] leading-relaxed text-espresso/75">
            {p}
          </p>
        ))}
    </>
  );
}

function TextBlock({ block }: { block: SiteBlock }) {
  return (
    <section className="bg-ivory px-6 py-16 sm:px-10 lg:px-16">
      <Reveal className="mx-auto max-w-3xl">
        {block.heading ? (
          <h2 className="display text-4xl sm:text-5xl">{block.heading}</h2>
        ) : null}
        <Paragraphs text={block.text} />
      </Reveal>
    </section>
  );
}

function PhotoTextBlock({ block }: { block: SiteBlock }) {
  return (
    <section className="bg-cream px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        {block.image ? (
          <Reveal>
            <img
              src={block.image}
              alt={block.heading || ''}
              className="w-full rounded-sm object-cover"
              loading="lazy"
            />
          </Reveal>
        ) : null}
        <Reveal>
          {block.heading ? (
            <h2 className="display text-4xl sm:text-5xl">{block.heading}</h2>
          ) : null}
          <Paragraphs text={block.text} />
        </Reveal>
      </div>
    </section>
  );
}

function GalleryBlock({ block }: { block: SiteBlock }) {
  const images = block.images || [];
  if (images.length === 0) return null;
  return (
    <section className="bg-ivory px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {block.heading ? (
          <h2 className="display mb-10 text-4xl sm:text-5xl">{block.heading}</h2>
        ) : null}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="aspect-square w-full rounded-sm object-cover"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteBlock({ block }: { block: SiteBlock }) {
  if (!block.text) return null;
  return (
    <section className="bg-petal px-6 py-16 sm:px-10 lg:px-16">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="display text-3xl italic sm:text-4xl">{block.text}</p>
      </Reveal>
    </section>
  );
}

function FormBlock({ block }: { block: SiteBlock }) {
  const fields = block.fields || [];
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  if (fields.length === 0) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(HUB_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          site: SITE_SLUG,
          blockId: block.id,
          values: {
            fields: fields.map((f) => ({
              key: f.key,
              label: f.label,
              type: f.type,
            })),
            values,
          },
        }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const inputCls =
    'mt-1 w-full rounded-sm border border-espresso/20 bg-ivory px-3 py-2 text-[15px]';

  return (
    <section className="bg-cream px-6 py-16 sm:px-10 lg:px-16">
      <Reveal className="mx-auto max-w-xl">
        {block.heading ? (
          <h2 className="display mb-8 text-4xl sm:text-5xl">{block.heading}</h2>
        ) : null}
        {status === 'sent' ? (
          <p className="text-[15px]">Sent.</p>
        ) : (
          <form onSubmit={submit}>
            {fields.map((f) => (
              <label key={f.key} className="mb-4 block text-sm">
                {f.label}
                {f.type === 'message' ? (
                  <textarea
                    className={inputCls}
                    rows={4}
                    required={f.required}
                    value={values[f.key] || ''}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                  />
                ) : (
                  <input
                    className={inputCls}
                    type={
                      f.type === 'email'
                        ? 'email'
                        : f.type === 'phone'
                          ? 'tel'
                          : f.type === 'date'
                            ? 'date'
                            : 'text'
                    }
                    required={f.required}
                    value={values[f.key] || ''}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                  />
                )}
              </label>
            ))}
            {status === 'error' ? (
              <p className="mb-4 text-sm text-red-800">
                Could not send. Please try again.
              </p>
            ) : null}
            <button
              type="submit"
              className="btn-ghost"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send'}
            </button>
          </form>
        )}
      </Reveal>
    </section>
  );
}

export default function CustomBlock({ block }: { block: SiteBlock }) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'photo-text':
      return <PhotoTextBlock block={block} />;
    case 'gallery':
      return <GalleryBlock block={block} />;
    case 'quote':
      return <QuoteBlock block={block} />;
    case 'form':
      return <FormBlock block={block} />;
    default:
      return null;
  }
}
