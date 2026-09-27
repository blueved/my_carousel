/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/EventCarousel.jsx"
/*!*******************************!*\
  !*** ./src/EventCarousel.jsx ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


const AUTOPLAY_INTERVAL = 4000;
const PrevIcon = () => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  viewBox: "0 0 24 24",
  width: "20",
  height: "20",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  d: "M15.5 5 8 12l7.5 7 1.5-1.4-6-5.6 6-5.6z"
}));
const NextIcon = () => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  viewBox: "0 0 24 24",
  width: "20",
  height: "20",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  d: "M8.5 5 16 12l-7.5 7L7 17.6l6-5.6-6-5.6z"
}));
const PauseIcon = () => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  viewBox: "0 0 24 24",
  width: "18",
  height: "18",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  x: "6",
  y: "5",
  width: "4",
  height: "14"
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  x: "14",
  y: "5",
  width: "4",
  height: "14"
}));
const PlayIcon = () => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  viewBox: "0 0 24 24",
  width: "18",
  height: "18",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  d: "M8 5v14l11-7z"
}));
function EventCarousel({
  what,
  restUrl
}) {
  const [images, setImages] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [current, setCurrent] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [isPlaying, setIsPlaying] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [hoverBtn, setHoverBtn] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // tracks which button is hovered, for hover styling
  const timerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setLoading(true);
    setError(null);
    fetch(`${restUrl}?what=${encodeURIComponent(what)}`).then(res => {
      if (!res.ok) throw new Error(`Failed to load images (status ${res.status})`);
      return res.json();
    }).then(data => {
      setImages(data);
      setCurrent(0);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [what, restUrl]);
  const prev = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setCurrent(c => c === 0 ? images.length - 1 : c - 1);
  }, [images.length]);
  const next = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setCurrent(c => c === images.length - 1 ? 0 : c + 1);
  }, [images.length]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!isPlaying || images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => c === images.length - 1 ? 0 : c + 1);
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
  const togglePlay = () => setIsPlaying(p => !p);
  if (loading) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "Loading carousel...");
  if (error) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "Error: ", error);
  if (!images.length) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "No images found for this event.");
  const active = images[current];

  // Helper to merge base button style with hover state
  const btnStyle = name => ({
    ...styles.btn,
    background: hoverBtn === name ? 'rgba(255,255,255,0.2)' : 'transparent'
  });
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    style: styles.carousel
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    style: styles.captionBar
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, active.caption, " "), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    style: styles.captionCount
  }, "(", current + 1, "/", images.length, ")")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    style: styles.imageWrap
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    src: active.url,
    alt: active.caption,
    style: styles.image
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    style: styles.controls
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    style: btnStyle('prev'),
    onMouseEnter: () => setHoverBtn('prev'),
    onMouseLeave: () => setHoverBtn(null),
    onClick: handlePrev,
    "aria-label": "Previous image"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(PrevIcon, null)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    style: btnStyle('play'),
    onMouseEnter: () => setHoverBtn('play'),
    onMouseLeave: () => setHoverBtn(null),
    onClick: togglePlay,
    "aria-label": isPlaying ? 'Pause slideshow' : 'Play slideshow'
  }, isPlaying ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(PauseIcon, null) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(PlayIcon, null)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    style: btnStyle('next'),
    onMouseEnter: () => setHoverBtn('next'),
    onMouseLeave: () => setHoverBtn(null),
    onClick: handleNext,
    "aria-label": "Next image"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(NextIcon, null)))),  false && 0);
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
    maxHeight: '70vh'
  },
  imageWrap: {
    position: 'relative',
    lineHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '70vh',
    border: '2px solid purple'
  },
  image: {
    maxHeight: '65vh',
    display: 'flex',
    borderRadius: '8px',
    boxShadow: 'none',
    border: 'none',
    alignItems: 'center',
    justifyContent: 'center'
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
    boxSizing: 'border-box'
  },
  captionText: {
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: '12px'
  },
  captionCount: {
    padding: '0px 10px',
    opacity: 0.85,
    fontStyle: 'italic'
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
    zIndex: 3
  },
  btn: {
    all: 'unset',
    // strip every inherited/theme button style
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
    transition: 'background 0.15s ease'
  },
  dots: {
    marginTop: '10px'
  },
  dot: isActive => ({
    display: 'inline-block',
    width: '8px',
    height: '8px',
    margin: '0 4px',
    borderRadius: '50%',
    background: isActive ? '#333' : '#ccc',
    cursor: 'pointer'
  })
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EventCarousel);

/***/ },

/***/ "./node_modules/react-dom/client.js"
/*!******************************************!*\
  !*** ./node_modules/react-dom/client.js ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {



var m = __webpack_require__(/*! react-dom */ "react-dom");
if (false) // removed by dead control flow
{} else {
  var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  exports.createRoot = function(c, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.createRoot(c, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
  exports.hydrateRoot = function(c, h, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.hydrateRoot(c, h, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
}


/***/ },

/***/ "react"
/*!************************!*\
  !*** external "React" ***!
  \************************/
(module) {

module.exports = window["React"];

/***/ },

/***/ "react-dom"
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
(module) {

module.exports = window["ReactDOM"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		const getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom/client */ "./node_modules/react-dom/client.js");
/* harmony import */ var _EventCarousel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./EventCarousel */ "./src/EventCarousel.jsx");



const el = document.getElementById('my-carousel-root');
if (el) {
  const {
    what,
    restUrl
  } = window.myCarouselData || {};
  const root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(el);
  root.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_EventCarousel__WEBPACK_IMPORTED_MODULE_2__["default"], {
    what: what,
    restUrl: restUrl
  }));
}
})();

/******/ })()
;
//# sourceMappingURL=index.js.map