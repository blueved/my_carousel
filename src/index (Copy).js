import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef } from 'react';
import apiFetch from '@wordpress/api-fetch';

const IMAGE_PREFIX = 'dv';
const DISPLAY_DURATION_MS = 10000;

// Extracts the numeric index from a title like "dv-12-beach-sunset"
const parseImageMeta = (item) => {
    const title = item.title?.rendered || '';
    const match = title.match(/^dv-(\d+)-/i);

    return {
        title,
        index: match ? parseInt(match[1], 10) : null,
    };
};

const Icon = ({ type }) => {
    const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'white' };

    if (type === 'prev') {
        return (
            <svg {...common}>
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
        );
    }

    if (type === 'next') {
        return (
            <svg {...common}>
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
        );
    }

    if (type === 'pause') {
        return (
            <svg {...common}>
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
            </svg>
        );
    }

    if (type === 'play') {
        return (
            <svg {...common}>
                <path d="M8 5v14l11-7z" />
            </svg>
        );
    }

    return null;
};

const App = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [status, setStatus] = useState('loading'); // loading | found | not-found | error
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);

    // Fetch and filter media on mount
    useEffect(() => {
        const fetchAllMedia = async () => {
            let all = [];
            let page = 1;
            const perPage = 100;

            try {
                while (true) {
                    const results = await apiFetch({
                        path: `/wp/v2/media?media_type=image&per_page=${perPage}&page=${page}`,
                    });

                    all = all.concat(results);

                    if (results.length < perPage) {
                        break;
                    }
                    page += 1;
                }

                const filtered = all
                    .map((item) => ({ item, meta: parseImageMeta(item) }))
                    .filter(({ item, meta }) =>
                        item.title?.rendered?.toLowerCase().startsWith(IMAGE_PREFIX) &&
                        meta.index !== null
                    )
                    .sort((a, b) => a.meta.index - b.meta.index)
                    .map(({ item }) => item);

                if (filtered.length > 0) {
                    setImages(filtered);
                    setStatus('found');
                } else {
                    setStatus('not-found');
                }
            } catch (err) {
                console.error('Error fetching media:', err);
                setStatus('error');
            }
        };

        fetchAllMedia();
    }, []);

    // Restart the auto-advance timer (used on mount, on manual nav, and on pause toggle)
    const restartTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (!isPaused && images.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, DISPLAY_DURATION_MS);
        }
    };

    useEffect(() => {
        restartTimer();
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [images, isPaused]);

    const goToPrev = () => {
        if (images.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        restartTimer();
    };

    const goToNext = () => {
        if (images.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % images.length);
        restartTimer();
    };

    const togglePause = () => {
        setIsPaused((prev) => !prev);
    };

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'not-found') {
        return <p>No images found with title prefix "{IMAGE_PREFIX}".</p>;
    }

    if (status === 'error') {
        return <p>Something went wrong loading the images.</p>;
    }

    const media = images[currentIndex];
    const caption = media.caption?.rendered
        ? media.caption.rendered.replace(/<[^>]+>/g, '')
        : '';

    return (
        <div style={styles.container}>
            <div style={styles.captionBox}>           
                
                <p>{caption || 'No caption set for this image.'}</p>
                <p style={styles.counter}>
                    {currentIndex + 1} / {images.length}
                </p>
                
            </div>
            <div style={styles.imageBox}>
                <img
                    key={media.id}
                    src={media.source_url}
                    alt={media.alt_text || caption}
                    style={styles.image}
                />
                <div style={styles.controls}>
                    <button style={styles.iconButton} onClick={goToPrev} aria-label="Previous">
                        <Icon type="prev" />
                    </button>
                    <button style={styles.iconButton} onClick={togglePause} aria-label={isPaused ? 'Play' : 'Pause'}>
                        <Icon type={isPaused ? 'play' : 'pause'} />
                    </button>
                    <button style={styles.iconButton} onClick={goToNext} aria-label="Next">
                        <Icon type="next" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        width: '100%',
        height: '85vh',
        alignItems: 'stretch',
        gap: '16px',
        boxSizing: 'border-box',
    },
    captionBox: {
        width: '20%',
        boxSizing: 'border-box',
        padding: '12px',
        position: 'relative',       
        alignItems: 'top',
        fontSize: '1.1rem',
    },
    counter: {
        marginTop: '8px',
        fontSize: '0.85em',
        color: '#666',
        display: 'flex',
        justifyContent: 'center',
    },
    imageBox: {
        width: '80%',
        height: '80vh',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        alignItems: 'top',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'transparent',                
    },
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
        display: 'block',
        objectFit: 'contain',
        objectPosition: '0px 0px',
    },
    controls: {
        position: 'absolute',
        top: '-13px',
        left: '50%',
        transform: 'translateX(-50%)',
        /*
        position: 'relative',
        right:'50%',
        height:'30px',
        */
        
        display: 'flex',
        gap: '12px',
        background: 'rgba(0, 0, 0, 0.01)',
        padding: '8px 16px',
        borderRadius: '999px',
    },
    iconButton: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('mrp-root');
    if (rootElement) {
        const root = createRoot(rootElement);
        root.render(<App />);
    }
});