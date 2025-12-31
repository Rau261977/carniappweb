'use client';

import type { HTMLAttributes } from 'react';
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, useAnimation, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

export interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface IconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const DURATION = 0.5;

// --- Helper for consistent delay logic ---
const useIconAnimation = (ref: React.RefObject<HTMLDivElement | null>) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);
  const isInView = useInView(ref);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isControlledRef.current && isInView) {
      controls.start('animate');
      interval = setInterval(async () => {
        controls.start('normal'); 
        setTimeout(() => {
          controls.start('animate');
        }, 100);
      }, 5000); // Loop every 5 seconds
    } else {
      controls.start('normal');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInView, controls]);

  return { controls, isControlledRef };
};

// --- Phone Icon ---
const PhoneIcon = forwardRef<IconHandle, IconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { controls, isControlledRef } = useIconAnimation(containerRef);

    useImperativeHandle(ref, () => ({
      startAnimation: () => { isControlledRef.current = true; controls.start('animate'); },
      stopAnimation: () => { isControlledRef.current = true; controls.start('normal'); },
    }));

    return (
      <div ref={containerRef} className={cn('bg-[#333]', className)} {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <motion.rect x="5" y="2" width="14" height="20" rx="2" ry="2" 
            variants={{
                normal: { scale: 1 },
                animate: { scale: [1, 1.05, 1], transition: { duration: DURATION } }
            }}
            animate={controls}
           />
           <motion.line x1="12" y1="18" x2="12.01" y2="18" 
             variants={{
                 normal: { opacity: 0.5 },
                 animate: { opacity: [0.5, 1, 0.5], transition: { duration: DURATION, repeat: 2 } }
             }}
             animate={controls}
           />
        </svg>
      </div>
    );
  }
);
PhoneIcon.displayName = 'PhoneIcon';

// --- Network/Centralization Icon ---
const NetworkIcon = forwardRef<IconHandle, IconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { controls, isControlledRef } = useIconAnimation(containerRef);

    useImperativeHandle(ref, () => ({
      startAnimation: () => { isControlledRef.current = true; controls.start('animate'); },
      stopAnimation: () => { isControlledRef.current = true; controls.start('normal'); },
    }));

    return (
      <div ref={containerRef} className={cn('bg-[#333]', className)} {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           {/* Center node */}
           <motion.circle cx="12" cy="12" r="3" 
            variants={{
                normal: { scale: 1 },
                animate: { scale: [1, 1.2, 1], transition: { duration: DURATION } }
            }}
            animate={controls}
           />
           {/* Satellite nodes */}
           <motion.circle cx="6" cy="6" r="2" variants={{ normal: { opacity: 0.5 }, animate: { opacity: 1, scale: [1, 1.2, 1], transition: { delay: 0.1 } } }} animate={controls} />
           <motion.circle cx="18" cy="6" r="2" variants={{ normal: { opacity: 0.5 }, animate: { opacity: 1, scale: [1, 1.2, 1], transition: { delay: 0.2 } } }} animate={controls} />
           <motion.circle cx="6" cy="18" r="2" variants={{ normal: { opacity: 0.5 }, animate: { opacity: 1, scale: [1, 1.2, 1], transition: { delay: 0.3 } } }} animate={controls} />
           <motion.circle cx="18" cy="18" r="2" variants={{ normal: { opacity: 0.5 }, animate: { opacity: 1, scale: [1, 1.2, 1], transition: { delay: 0.4 } } }} animate={controls} />
           
           {/* Connections */}
           <motion.path d="M10 10L7.5 7.5" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { duration: 0.3 } } }} animate={controls} />
           <motion.path d="M14 10L16.5 7.5" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { duration: 0.3 } } }} animate={controls} />
           <motion.path d="M10 14L7.5 16.5" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { duration: 0.3 } } }} animate={controls} />
           <motion.path d="M14 14L16.5 16.5" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { duration: 0.3 } } }} animate={controls} />
        </svg>
      </div>
    );
  }
);
NetworkIcon.displayName = 'NetworkIcon';

// --- Brand/Identity Icon (Shield/Star) ---
const BrandIcon = forwardRef<IconHandle, IconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const { controls, isControlledRef } = useIconAnimation(containerRef);
  
      useImperativeHandle(ref, () => ({
        startAnimation: () => { isControlledRef.current = true; controls.start('animate'); },
        stopAnimation: () => { isControlledRef.current = true; controls.start('normal'); },
      }));
  
      return (
        <div ref={containerRef} className={cn('bg-[#333]', className)} {...props}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <motion.path 
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                variants={{
                    normal: { scale: 1 },
                    animate: { 
                        scale: [1, 1.05, 1],
                        transition: { duration: DURATION * 1.5 } 
                    }
                }}
                animate={controls}
            />
            <motion.path 
                d="M9 12l2 2 4-4" 
                variants={{
                    normal: { pathLength: 0, opacity: 0 },
                    animate: { pathLength: 1, opacity: 1, transition: { delay: 0.3, duration: 0.4 } }
                }}
                animate={controls}
            />
          </svg>
        </div>
      );
    }
  );
  BrandIcon.displayName = 'BrandIcon';

// --- Growth/Scalability Icon ---
const GrowthIcon = forwardRef<IconHandle, IconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const { controls, isControlledRef } = useIconAnimation(containerRef);
  
      useImperativeHandle(ref, () => ({
        startAnimation: () => { isControlledRef.current = true; controls.start('animate'); },
        stopAnimation: () => { isControlledRef.current = true; controls.start('normal'); },
      }));
  
      return (
        <div ref={containerRef} className={cn('bg-[#333]', className)} {...props}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M12 2v20" variants={{ normal: { height: 0 }, animate: { height: "100%" } }} />
            <motion.path d="M2 12h20" variants={{ normal: { width: 0 }, animate: { width: "100%" } }} />
            
            {/* Arrows expanding out */}
            <motion.path d="M12 2l-4 4" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { delay: 0.1 } } }} animate={controls} />
            <motion.path d="M12 2l4 4" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { delay: 0.1 } } }} animate={controls} />

            <motion.path d="M22 12l-4 -4" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { delay: 0.2 } } }} animate={controls} />
            <motion.path d="M22 12l-4 4" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { delay: 0.2 } } }} animate={controls} />

            <motion.path d="M12 22l-4 -4" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { delay: 0.3 } } }} animate={controls} />
            <motion.path d="M12 22l4 -4" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { delay: 0.3 } } }} animate={controls} />

            <motion.path d="M2 12l4 -4" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { delay: 0.4 } } }} animate={controls} />
            <motion.path d="M2 12l4 4" variants={{ normal: { pathLength: 0 }, animate: { pathLength: 1, transition: { delay: 0.4 } } }} animate={controls} />
          </svg>
        </div>
      );
    }
  );
  GrowthIcon.displayName = 'GrowthIcon';

export { NetworkIcon, BrandIcon, GrowthIcon, PhoneIcon };
