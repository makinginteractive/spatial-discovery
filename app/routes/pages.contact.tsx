import {useState} from 'react';
import type {Route} from './+types/pages.contact';
import {SiteHeader} from '~/components/SiteHeader';
import {PolicyBar} from '~/components/PolicyBar';

export const meta: Route.MetaFunction = () => [
  {title: 'Help Center — P3XIV'},
  {name: 'description', content: 'Shipping, returns, and support for Press On.'},
];

export async function loader() {
  return {};
}

const FAQS = [
  {
    q: 'How long does shipping take?',
    a: 'We ship from Tallahassee, FL. Orders are fulfilled within 14 days and typically arrive within 5 business days after shipping. All domestic orders ship free — no minimums, no conditions.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Not yet. We currently ship within the United States only. International shipping is on the roadmap.',
  },
  {
    q: 'What is your return policy?',
    a: "We accept returns within 30 days of delivery. Items can be worn — we don't require unworn condition. Returned items are donated, not resold, so nothing goes to waste. You're responsible for return shipping since we cover all outbound shipping costs.",
  },
  {
    q: 'Can I choose between a refund or store credit?',
    a: 'Yes — your choice. When you initiate a return, let us know if you want a refund to your original payment method or store credit. No exclusions apply.',
  },
  {
    q: 'How do I start a return?',
    a: 'Email us at pressonclothingcompany@gmail.com with your order number and whether you want a refund or store credit. We\'ll reply within 1–2 business days with next steps.',
  },
  {
    q: 'What happens to returned items?',
    a: "We donate every returned item. If something comes back to us, it goes to someone who needs it — not back to a shelf. We think that's better for everyone.",
  },
  {
    q: 'I haven\'t received my order — what do I do?',
    a: 'If your tracking shows delivered but you haven\'t received it, or if it\'s been more than 21 days since you ordered, reach out at pressonclothingcompany@gmail.com and we\'ll sort it out.',
  },
];

function Accordion({q, a}: {q: string; a: string}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-medium">{q}</span>
        <span className="text-muted-foreground text-lg leading-none shrink-0 transition-transform duration-200" style={{transform: open ? 'rotate(45deg)' : 'none'}}>+</span>
      </button>
      {open && (
        <p className="text-sm text-muted-foreground leading-relaxed pb-4 max-w-lg">{a}</p>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-16 pb-16">
      <SiteHeader />

      <main className="max-w-2xl mx-auto px-6 sm:px-12 py-16">

        {/* Header */}
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-4">Support</p>
        <h1 className="font-display text-5xl sm:text-6xl leading-[0.92] tracking-tight mb-4">
          Help Center
        </h1>
        <p className="text-sm text-muted-foreground mb-16 max-w-md">
          Answers to the most common questions about shipping, returns, and orders. Can't find what you need? Email us directly.
        </p>

        {/* Quick facts */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {[
            {label: 'Free Shipping', sub: 'All US orders'},
            {label: 'Ships in 14 Days', sub: 'From Tallahassee, FL'},
            {label: '30-Day Returns', sub: 'Worn OK · We donate'},
          ].map(({label, sub}) => (
            <div key={label} className="border border-border p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] font-medium mb-1">{label}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="font-display text-2xl tracking-tight mb-6">Frequently Asked</h2>
        <div className="mb-20">
          {FAQS.map((item) => (
            <Accordion key={item.q} {...item} />
          ))}
        </div>

        {/* Contact form */}
        <h2 className="font-display text-2xl tracking-tight mb-2">Still need help?</h2>
        <p className="text-sm text-muted-foreground mb-8">We respond within 1–2 business days.</p>

        {sent ? (
          <div className="border border-border p-8 text-center">
            <p className="font-display text-2xl mb-2">Sent.</p>
            <p className="text-sm text-muted-foreground">We'll get back to you within 1–2 business days.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
              window.location.href = `mailto:pressonclothingcompany@gmail.com?subject=Help Request from ${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`)}`;
              setSent(true);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Name</label>
                <input
                  name="name"
                  required
                  className="w-full h-11 bg-transparent border border-border px-4 text-sm focus:border-foreground transition-colors"
                  style={{outline: 'none'}}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full h-11 bg-transparent border border-border px-4 text-sm focus:border-foreground transition-colors"
                  style={{outline: 'none'}}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Order number (if applicable)</label>
              <input
                name="order"
                className="w-full h-11 bg-transparent border border-border px-4 text-sm focus:border-foreground transition-colors"
                style={{outline: 'none'}}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full bg-transparent border border-border px-4 py-3 text-sm focus:border-foreground transition-colors resize-none"
                style={{outline: 'none'}}
              />
            </div>
            <button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground text-xs uppercase tracking-[0.25em] hover:bg-accent transition-colors"
            >
              Send Message
            </button>
          </form>
        )}
      </main>

      <PolicyBar />
    </div>
  );
}
