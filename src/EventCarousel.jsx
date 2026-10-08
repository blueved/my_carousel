import { useState, useEffect, useRef, useCallback } from 'react';

const AUTOPLAY_INTERVAL = 8000;
const NARROW_QUERY = '(max-width: 704px)'; // narrower than 705px
const TEST_IMAGE_DELAY = 0; // ms; TEST ONLY. Set to e.g. 9000 to simulate slow loading, 0 to disable

const PrevIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M15.5 5 8 12l7.5 7 1.5-1.4-6-5.6 6-5.6z" />
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M8.5 5 16 12l-7.5 7L7 17.6l6-5.6-6-5.6z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" />
    <rect x="14" y="5" width="4" height="14" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// Spinner: SVG with a built-in SMIL animation, so no CSS @keyframes needed
const Spinner = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    role="status"
    aria-label="Loading"
  >
    <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="5" />
    <path
      d="M25 5 a20 20 0 0 1 20 20"
      fill="none"
      stroke="#102030"
      strokeWidth="5"
      strokeLinecap="round"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="0.9s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

// Inline styles can't use @media, so we track the query in JS instead.
function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);

    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function EventCarousel({ what, restUrl }) {
  // All hooks must stay above the early returns below.
  const isNarrow = useMediaQuery(NARROW_QUERY);
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoverBtn, setHoverBtn] = useState(null); // tracks which button is hovered
  const [captionOpen, setCaptionOpen] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState(null); // URL of the last image that finished loading
  const [readyUrl, setReadyUrl] = useState(null); // TEST ONLY: URL allowed to start loading
  const timerRef = useRef(null);

  // True while the current image is still downloading
  const imgLoading = images.length > 0 && loadedUrl !== images[current]?.url;

  // Close the caption overlay whenever the slide changes
  useEffect(() => {
    setCaptionOpen(false);
  }, [current]);

  // Fetch the image list
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${restUrl}?what=${encodeURIComponent(what)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load images (status ${res.status})`);
        return res.json();
      })
      .then((data) => {
        setImages(data);
        setCurrent(0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [what, restUrl]);

  // Preload the next image in the background so slide changes feel instant
  useEffect(() => {
    if (TEST_IMAGE_DELAY) return; // skip preload while testing the spinner
    if (images.length < 2) return;
    const nextImg = new Image();
    nextImg.src = images[(current + 1) % images.length].url;
  }, [current, images]);

  // TEST ONLY: artificially delay each image so the spinner stays visible
  useEffect(() => {
    if (!images.length) return;
    const url = images[current].url;

    if (!TEST_IMAGE_DELAY) {
      setReadyUrl(url);
      return;
    }

    const t = setTimeout(() => setReadyUrl(url), TEST_IMAGE_DELAY);
    return () => clearTimeout(t);
  }, [current, images]);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  // Autoplay: the countdown only runs while the current image is fully loaded,
  // and restarts with a fresh full interval for every image.
  useEffect(() => {
    if (!isPlaying || images.length <= 1 || imgLoading) return;

    timerRef.current = setTimeout(() => {
      setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    }, AUTOPLAY_INTERVAL);

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, images.length, imgLoading, current]);

  const handlePrev = () => {
    setIsPlaying(false);
    prev();
  };

  const handleNext = () => {
    setIsPlaying(false);
    next();
  };

  const togglePlay = () => setIsPlaying((p) => !p);

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <Spinner />
      </div>
    );
  }
  if (error) return <p>Error: {error}</p>;
  if (!images.length) return <p>No images found for this event.</p>;

  const active = images[current];

  // Merge base button style with hover state
  const btnStyle = (name) => ({
    ...styles.btn,
    background: hoverBtn === name ? 'rgba(255,255,255,0.2)' : 'transparent',
  });

  return (
    <div style={styles.carousel}>
      {/* Fixed-height caption box: same size on every slide */}
      <div
        style={{
          ...styles.captionBar,
          height: isNarrow ? '80px' : '53px',
        }}
      >
        <span
          title={active.caption} // tooltip on hover (desktop)
          onClick={() => setCaptionOpen((o) => !o)} // full text on click (touch too)
          style={{
            ...styles.captionText,
            WebkitLineClamp: isNarrow ? 3 : 2,
            cursor: 'pointer',
          }}
        >
          {active.caption}
        </span>
        <span style={styles.captionCount}>
          ({current + 1}/{images.length})
        </span>
      </div>

      {/* Image area fills all remaining height; image sits on its bottom edge */}
      <div style={styles.imageWrap}>
        {imgLoading && (
          <div style={styles.spinnerWrap}>
            <Spinner />
          </div>
        )}

        <img
          key={active.url}
          src={readyUrl === active.url ? active.url : undefined}
          alt={active.caption}
          onLoad={() => setLoadedUrl(active.url)}
          onError={() => setLoadedUrl(active.url)} // don't spin forever on a broken image
          style={{
            ...styles.image,
            opacity: imgLoading ? 0 : 1,
            transition: 'opacity 0.25s ease',
          }}
        />

        {captionOpen && (
          <div
            style={styles.captionOverlay}
            onClick={() => setCaptionOpen(false)}
          >
            {active.caption}
          </div>
        )}

        <div style={styles.controls}>
          <button
            style={btnStyle('prev')}
            onMouseEnter={() => setHoverBtn('prev')}
            onMouseLeave={() => setHoverBtn(null)}
            onClick={handlePrev}
            aria-label="Previous image"
          >
            <PrevIcon />
          </button>
          <button
            style={btnStyle('play')}
            onMouseEnter={() => setHoverBtn('play')}
            onMouseLeave={() => setHoverBtn(null)}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            style={btnStyle('next')}
            onMouseEnter={() => setHoverBtn('next')}
            onMouseLeave={() => setHoverBtn(null)}
            onClick={handleNext}
            aria-label="Next image"
          >
            <NextIcon />
          </button>
        </div>
      </div>

      {false && (
        <div style={styles.dots}>
          {images.map((_, i) => (
            <span
              key={i}
              style={styles.dot(i === current)}
              onClick={() => {
                setIsPlaying(false);
                setCurrent(i);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// All styles defined as plain JS objects — no external CSS file,
// no class names, nothing for a theme stylesheet to ever touch.
const styles = {
  carousel: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
    height: '70vh', // one fixed total height
    display: 'flex',
    flexDirection: 'column',
  },
  loadingBox: {
    height: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionBar: {
    flex: '0 0 auto', // never grows or shrinks
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    textAlign: 'left',
    padding: '0 10px',
    color: '#102030',
    fontSize: '1rem',
    lineHeight: '1.3',
    overflow: 'hidden',
    // height is set in the component (53px wide, 80px narrow)
  },
  captionText: {
    flex: '1 1 auto',
    minWidth: 0,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    // WebkitLineClamp is set in the component (2 wide, 3 narrow)
    overflow: 'hidden',
    marginRight: '12px',
  },
  captionCount: {
    flex: '0 0 auto', // always visible, never clipped
    whiteSpace: 'nowrap',
    opacity: 0.85,
    fontStyle: 'italic',
  },
  captionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '10px 12px',
    background: 'rgba(0,0,0,0.75)',
    color: '#fff',
    fontSize: '1rem',
    lineHeight: '1.3',
    textAlign: 'left',
    borderRadius: '8px 8px 0 0',
    maxHeight: '80%',
    overflowY: 'auto',
    zIndex: 2, // above the image; controls stay at zIndex 1 at the bottom
    cursor: 'pointer',
  },
  imageWrap: {
    flex: '1 1 0', // takes all remaining height
    minHeight: 0, // lets the flex item shrink below its content size
    position: 'relative',
    lineHeight: 0,
    display: 'flex',
    alignItems: 'flex-end', // image sits on the bottom edge
    justifyContent: 'center',
  },
  spinnerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none', // the controls stay clickable while loading
  },
  image: {
    maxHeight: '100%',
    maxWidth: '100%',
    borderRadius: '8px',
    boxShadow: 'none',
    border: 'none',
  },
  controls: {
    position: 'absolute',
    bottom: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '5px',
    background: 'rgba(0,0,0,0.3)',
    padding: '2px 0px',
    borderRadius: '999px',
    zIndex: 1,
  },
  btn: {
    all: 'unset', // strip every inherited/theme button style
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  dots: {
    marginTop: '10px',
  },
  dot: (isActive) => ({
    display: 'inline-block',
    width: '8px',
    height: '8px',
    margin: '0 4px',
    borderRadius: '50%',
    background: isActive ? '#333' : '#ccc',
    cursor: 'pointer',
  }),
};

export default EventCarousel;