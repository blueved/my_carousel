import { createRoot } from 'react-dom/client';
import EventCarousel from './EventCarousel';

const el = document.getElementById('my-carousel-root');

if (el) {
  const { what, restUrl } = window.myCarouselData || {};
  const root = createRoot(el);
  root.render(<EventCarousel what={what} restUrl={restUrl} />);
}


window.addEventListener('load', function () {
  var hash = window.location.hash;
  if (!hash) return;

  var target;
  try { target = document.querySelector(hash); } catch (e) { return; }
  if (!target) return;

  window.scrollTo(0, 0);
  setTimeout(function () {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' , inline:'start'});
  }, 150);
});
