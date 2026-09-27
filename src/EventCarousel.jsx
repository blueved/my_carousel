import { useState, useEffect, useRef, useCallback } from 'react';

const AUTOPLAY_INTERVAL = 4000;

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

function EventCarousel({ what, restUrl }) {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoverBtn, setHoverBtn] = useState(null); // tracks which button is hovered, for hover styling
  const timerRef = useRef(null);

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

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, images.length]);

  const handlePrev = () => {
    setIsPlaying(false);
    prev();
  };

  const handleNext = () => {
    setIsPlaying(false);
    next();
  };

  const togglePlay = () => setIsPlaying((p) => !p);

  if (loading) return <p>Loading carousel...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!images.length) return <p>No images found for this event.</p>;

  const active = images[current];

  // Helper to merge base button style with hover state
  const btnStyle = (name) => ({
    ...styles.btn,
    background: hoverBtn === name ? 'rgba(255,255,255,0.2)' : 'transparent',
  });

  return (
    <div style={styles.carousel}>
      <div style={styles.captionBar}>
          <span >{active.caption} </span>
          <span style={styles.captionCount}>({current + 1}/{images.length})</span>
        </div>
      <div style={styles.imageWrap}>
        <img src={active.url} alt={active.caption} style={styles.image} />

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
    {false &&
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
    }
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
    height: '70vh',
    maxHeight: '70vh',    
  },
  imageWrap: {
    position: 'relative',
    lineHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent:'center',
    height:'70vh',    
    border: '2px solid purple',
  },
  image: {    
    maxHeight: '65vh',
    display: 'flex',
    borderRadius: '8px',
    boxShadow: 'none',
    border: 'none',  
    
    alignItems: 'center',
    justifyContent:'center',
  },
  captionBar: {
    position: 'relative',   
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'right',
    textAlign: 'left',
    paddingLeft: '10px',
    //background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0.1))',
    color: '#102030',
    fontSize: '1rem',
    zIndex: 2,
    borderRadius: '8px 8px 0 0',
    boxSizing: 'border-box',
  },
  captionText: {
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: '12px',
  },
  captionCount: {
    padding: '0px 10px',
    opacity: 0.85,
    fontStyle:'italic',
  },
  controls: {
    position: 'absolute',
    top: '25px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0,0,0,0.3)',
    padding: '6px 0px',
    borderRadius: '999px',
    zIndex: 3,
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