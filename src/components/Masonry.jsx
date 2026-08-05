'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

const useMedia = (queries, values, defaultValue) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  };

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

// Same brand SVGs used in the navbar / ConnectSection icon row, sized down
// into a small circular badge for the tile overlay.
const PLATFORM_BADGES = {
  Instagram: (
    <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="32" height="32" rx="16" fill="url(#paint0_radial_masonry_insta)" />
      <rect x="0" y="0" width="32" height="32" rx="16" fill="url(#paint1_radial_masonry_insta)" />
      <rect x="0" y="0" width="32" height="32" rx="16" fill="url(#paint2_radial_masonry_insta)" />
      <path d="M23 10.5C23 11.3284 22.3284 12 21.5 12C20.6716 12 20 11.3284 20 10.5C20 9.67157 20.6716 9 21.5 9C22.3284 9 23 9.67157 23 10.5Z" fill="white" />
      <path fillRule="evenodd" clipRule="evenodd" d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21ZM16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19Z" fill="white" />
      <path fillRule="evenodd" clipRule="evenodd" d="M6 15.6C6 12.2397 6 10.5595 6.65396 9.27606C7.2292 8.14708 8.14708 7.2292 9.27606 6.65396C10.5595 6 12.2397 6 15.6 6H16.4C19.7603 6 21.4405 6 22.7239 6.65396C23.8529 7.2292 24.7708 8.14708 25.346 9.27606C26 10.5595 26 12.2397 26 15.6V16.4C26 19.7603 26 21.4405 25.346 22.7239C24.7708 23.8529 23.8529 24.7708 22.7239 25.346C21.4405 26 19.7603 26 16.4 26H15.6C12.2397 26 10.5595 26 9.27606 25.346C8.14708 24.7708 7.2292 23.8529 6.65396 22.7239C6 21.4405 6 19.7603 6 16.4V15.6ZM15.6 8H16.4C18.1132 8 19.2777 8.00156 20.1779 8.0751C21.0548 8.14674 21.5032 8.27659 21.816 8.43597C22.5686 8.81947 23.1805 9.43139 23.564 10.184C23.7234 10.4968 23.8533 10.9452 23.9249 11.8221C23.9984 12.7223 24 13.8868 24 15.6V16.4C24 18.1132 23.9984 19.2777 23.9249 20.1779C23.8533 21.0548 23.7234 21.5032 23.564 21.816C23.1805 22.5686 22.5686 23.1805 21.816 23.564C21.5032 23.7234 21.0548 23.8533 20.1779 23.9249C19.2777 23.9984 18.1132 24 16.4 24H15.6C13.8868 24 12.7223 23.9984 11.8221 23.9249C10.9452 23.8533 10.4968 23.7234 10.184 23.564C9.43139 23.1805 8.81947 22.5686 8.43597 21.816C8.27659 21.5032 8.14674 21.0548 8.0751 20.1779C8.00156 19.2777 8 18.1132 8 16.4V15.6Z" fill="white" />
      <defs>
        <radialGradient id="paint0_radial_masonry_insta" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 23) rotate(-55.3758) scale(25.5196)">
          <stop stopColor="#B13589" /><stop offset="0.79309" stopColor="#C62F94" /><stop offset="1" stopColor="#8A3AC8" />
        </radialGradient>
        <radialGradient id="paint1_radial_masonry_insta" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11 31) rotate(-65.1363) scale(22.5942)">
          <stop stopColor="#E0E8B7" /><stop offset="0.444662" stopColor="#FB8A2E" /><stop offset="0.71474" stopColor="#E2425C" /><stop offset="1" stopColor="#E2425C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="paint2_radial_masonry_insta" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.500002 3) rotate(-8.1301) scale(38.8909 8.31836)">
          <stop offset="0.156701" stopColor="#406ADC" /><stop offset="0.467799" stopColor="#6A45BE" /><stop offset="1" stopColor="#6A45BE" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  ),
  Facebook: (
    <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="url(#paint0_linear_masonry_fb)" />
      <path d="M21.2137 20.2816L21.8356 16.3301H17.9452V13.767C17.9452 12.6857 18.4877 11.6311 20.2302 11.6311H22V8.26699C22 8.26699 20.3945 8 18.8603 8C15.6548 8 13.5617 9.89294 13.5617 13.3184V16.3301H10V20.2816H13.5617V29.8345C14.2767 29.944 15.0082 30 15.7534 30C16.4986 30 17.2302 29.944 17.9452 29.8345V20.2816H21.2137Z" fill="white" />
      <defs>
        <linearGradient id="paint0_linear_masonry_fb" x1="16" y1="2" x2="16" y2="29.917" gradientUnits="userSpaceOnUse">
          <stop stopColor="#18ACFE" /><stop offset="1" stopColor="#0163E0" />
        </linearGradient>
      </defs>
    </svg>
  ),
  YouTube: (
    <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#FC0D1B" />
      <path d="M13 12V20L21 16L13 12Z" fill="white" />
    </svg>
  ),
  TikTok: (
    <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#000000" />
      <path d="M22.9016 11.5513C24.4594 12.6428 26.3603 13.2961 28.4131 13.2961V9.43816C28.0249 9.43824 27.6377 9.39813 27.2577 9.31846V12.4256C25.2049 12.4256 23.3042 11.7723 21.7461 10.6809V18.601C21.7461 22.5629 18.5636 25.7761 14.6379 25.7761C13.1584 25.7761 11.7834 25.3193 10.6461 24.5379C11.9439 25.8735 13.7477 26.7 15.7461 26.7C19.6721 26.7 22.8543 23.4868 22.8543 19.5251V11.605H22.9016V11.5513ZM24.288 7.68309C23.5109 6.82869 23.0018 5.72825 22.8543 4.51636V4H21.8434C22.0851 5.51106 22.9959 6.79671 24.288 7.5461V7.68309ZM13.0995 21.8951C12.6573 21.3122 12.4185 20.5951 12.4198 19.858C12.4198 18.0071 13.9285 16.5051 15.7873 16.5051C16.1362 16.505 16.4834 16.5602 16.8155 16.6687V12.7247C16.4332 12.6716 16.0479 12.6494 15.6626 12.6584V15.8317C15.3299 15.7231 14.9825 15.6678 14.6329 15.668C12.7741 15.668 11.2654 17.1698 11.2654 19.0206C11.2654 20.3186 12.0084 21.4434 13.0995 21.8951Z" fill="#25F4EE" />
      <path d="M21.7461 10.6809C23.3042 11.7723 25.2049 12.4256 27.2577 12.4256V9.31846C26.0897 9.07752 25.0554 8.47871 24.288 7.5461C22.9959 6.79671 22.0851 5.51106 21.8434 4H18.9808V19.5251C18.9744 21.3712 17.4681 22.8686 15.6195 22.8686C14.5379 22.8686 13.5771 22.3512 12.9682 21.5514C11.877 20.9997 11.1341 19.8749 11.1341 18.577C11.1341 16.7262 12.6427 15.2244 14.5015 15.2244C14.858 15.2243 15.213 15.2795 15.5535 15.3881V12.2148C11.7 12.2965 8.60083 15.457 8.60083 19.3298C8.60083 21.2618 9.36546 23.0159 10.6126 24.3082C11.6501 25.0895 12.8877 25.5463 14.2143 25.5463C18.1403 25.5463 21.3226 22.3331 21.3226 18.3714V10.6809H21.7461Z" fill="#000000" />
      <path d="M27.2577 9.31846V8.42496C26.2159 8.42645 25.1954 8.13757 24.288 7.5461C25.0656 8.49664 26.109 9.08897 27.2577 9.31846ZM21.8434 4C21.8172 3.86008 21.7969 3.71958 21.7827 3.5788V3.07178H17.8199V18.5969C17.8138 20.4429 16.3074 21.9403 14.4589 21.9403C13.9145 21.9403 13.4009 21.8109 12.9455 21.5813C13.5544 22.3811 14.5152 22.8985 15.5968 22.8985C17.4453 22.8985 18.9518 21.4011 18.9578 19.555V4H21.8434ZM15.5535 12.2148V11.2672C15.1994 11.2189 14.8427 11.1946 14.4855 11.1948C10.5591 11.1946 7.37659 14.4078 7.37659 18.3697C7.37659 20.8072 8.60084 22.9601 10.4655 24.257C9.21837 22.9648 8.45327 21.2107 8.45327 19.2786C8.45327 15.4059 11.5525 12.2453 15.5535 12.2148Z" fill="#FE2C55" />
    </svg>
  ),
};

const preloadImages = async urls => {
  await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

/**
 * @param {{
 *   items: Array<{ id: string, img: string, url?: string, height: number, name?: string, followers?: string }>,
 *   ease?: string, duration?: number, stagger?: number, animateFrom?: string,
 *   scaleOnHover?: boolean, hoverScale?: number, blurToFocus?: boolean, colorShiftOnHover?: boolean
 * }} props
 */
const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);

  const getInitialPosition = item => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    preloadImages(items.map(i => i.img)).then(() => setImagesReady(true));
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return [];
    const colHeights = new Array(columns).fill(0);
    const gap = 16;
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const height = child.height / 2;
      const y = colHeights[col];

      colHeights[col] += height + gap;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: 'blur(10px)' })
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 0.8,
            ease: 'power3.out',
            delay: index * stagger
          }
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: 'auto'
        });
      }
    });

    hasMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (id, element) => {
    if (scaleOnHover) {
      gsap.to(element, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id, element) => {
    if (scaleOnHover) {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute box-content"
          style={{ willChange: 'transform, width, height, opacity' }}
          onClick={() => item.url && window.open(item.url, '_blank', 'noopener')}
          onMouseEnter={e => handleMouseEnter(item.id, e.currentTarget)}
          onMouseLeave={e => handleMouseLeave(item.id, e.currentTarget)}
        >
          <div className="relative w-full h-full rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)] uppercase text-[10px] leading-[10px] p-2 bg-white">
            <div
              className="relative w-full h-full bg-cover bg-center rounded-[8px] overflow-hidden"
              style={{ backgroundImage: `url("${encodeURI(item.img)}")` }}
            >
              {colorShiftOnHover && (
                <div className="color-overlay absolute inset-0 rounded-[8px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none" />
              )}
              {item.platform && PLATFORM_BADGES[item.platform] && (
                <div className="absolute top-2 right-2 w-6 h-6 shadow-[0px_2px_6px_rgba(0,0,0,0.3)] rounded-full">
                  {PLATFORM_BADGES[item.platform]}
                </div>
              )}
              {(item.name || item.followers) && (
                <div className="absolute inset-x-0 bottom-0 px-3 py-2.5 bg-gradient-to-t from-black/70 via-black/25 to-transparent normal-case">
                  {item.name && (
                    <p className="text-white text-[13px] font-semibold leading-tight truncate">{item.name}</p>
                  )}
                  {item.followers && (
                    <p className="text-white/85 text-[11px] leading-tight truncate">{item.followers}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
