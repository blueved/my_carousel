import { createRoot } from 'react-dom/client';
import EventCarousel from './EventCarousel';

const el = document.getElementById('my-carousel-root');

if (el) {
  const { what, restUrl } = window.myCarouselData || {};
  const root = createRoot(el);
  root.render(<EventCarousel what={what} restUrl={restUrl} />);
}