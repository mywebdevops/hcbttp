import { lazy, Suspense, useCallback, useState } from 'react';
import { getService, type ServiceId, type TravelId } from '@/data/brand';
import Nav from './hcb/Nav';
import Hero from './hcb/Hero';
import ServicesShowcase from './hcb/ServicesShowcase';
import Treatments from './hcb/Treatments';
import About from './hcb/About';
import Retail from './hcb/Retail';
import Footer from './hcb/Footer';
import Community from './hcb/Community';
import CustomBlock from './hcb/Blocks';
import { useSiteContent, type SiteBlock } from '@/lib/siteContent';

const BookingModal = lazy(() => import('./hcb/BookingModal'));
const InstallPrompt = lazy(() => import('./hcb/InstallPrompt'));

export default function AppLayout() {
  const [serviceId, setServiceId] = useState<ServiceId>('house-call');
  const [guests, setGuests] = useState(3);
  const [travel, setTravel] = useState<TravelId>('within');
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const openBooking = useCallback(() => setModalOpen(true), []);
  const closeBooking = useCallback(() => setModalOpen(false), []);

  const handleService = (id: ServiceId) => {
    setServiceId(id);
    const s = getService(id);
    if (s.perPerson && guests < (s.minPeople ?? 1)) setGuests(s.minPeople ?? 1);
  };

  const toggleAddOn = (id: string) =>
    setAddOnIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const content = useSiteContent();

  const renderBlock = (block: SiteBlock) => {
    switch (block.type) {
      case 'hero':
        return <Hero key={block.id} onBook={openBooking} />;
      case 'about':
        return <About key={block.id} />;
      case 'services':
        return (
          <ServicesShowcase
            key={block.id}
            selected={serviceId}
            onSelect={handleService}
            onBook={openBooking}
          />
        );
      case 'treatments':
        return (
          <Treatments
            key={block.id}
            serviceId={serviceId}
            guests={guests}
            travel={travel}
            addOnIds={addOnIds}
            onService={handleService}
            onGuests={setGuests}
            onTravel={setTravel}
            onToggleAddOn={toggleAddOn}
            onClearAddOns={() => setAddOnIds([])}
            onRequest={openBooking}
          />
        );
      case 'retail':
        return <Retail key={block.id} />;
      case 'community':
        return <Community key={block.id} />;
      default:
        return <CustomBlock key={block.id} block={block} />;
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-espresso">
      <Nav onBook={openBooking} />

      <main>
        {content.blocks.filter((b) => b.visible).map(renderBlock)}
      </main>
      <Footer onBook={openBooking} />

      <Suspense fallback={null}>
        <InstallPrompt />
        {modalOpen && (
          <BookingModal
            open={modalOpen}
            onClose={closeBooking}
            serviceId={serviceId}
            guests={guests}
            travel={travel}
            addOnIds={addOnIds}
          />
        )}
      </Suspense>
    </div>
  );
}
