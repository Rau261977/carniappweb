'use client';

import type { HTMLAttributes } from 'react';
import { useRef, useEffect, forwardRef, useCallback, useImperativeHandle } from 'react';
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

// --- Advertising Icon (Megaphone / Target) ---
const AdvertisingIcon = forwardRef<IconHandle, IconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { controls, isControlledRef } = useIconAnimation(containerRef);

    useImperativeHandle(ref, () => ({
      startAnimation: () => { isControlledRef.current = true; controls.start('animate'); },
      stopAnimation: () => { isControlledRef.current = true; controls.start('normal'); },
    }));

    return (
      <div
        ref={containerRef}
        className={cn('bg-[#333]', className)}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Megaphone body */}
          <motion.path
            d="M3 11l15-6v14l-15-6Z" // Simplified cone
            variants={{
                normal: { scale: 1, rotate: 0 },
                animate: { 
                    scale: [1, 1.1, 1], 
                    rotate: [0, -5, 5, 0],
                    transition: { duration: DURATION, repeat: 1 } 
                }
            }}
            animate={controls}
          />
          {/* Sound waves */}
          <motion.path
             d="M21 9a2 2 0 0 1 0 6"
             variants={{
                normal: { opacity: 0, pathLength: 0 },
                animate: { opacity: [0, 1, 0], pathLength: [0, 1], transition: { delay: 0.2, duration: DURATION } }
             }}
             animate={controls}
          />
           <motion.path
             d="M24 7a5 5 0 0 1 0 10"
             variants={{
                normal: { opacity: 0, pathLength: 0 },
                animate: { opacity: [0, 1, 0], pathLength: [0, 1], transition: { delay: 0.4, duration: DURATION } }
             }}
             animate={controls}
          />
        </svg>
      </div>
    );
  }
);
AdvertisingIcon.displayName = 'AdvertisingIcon';

// --- Scalability Icon (Chart Rising) ---
const ScalabilityIcon = forwardRef<IconHandle, IconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const { controls, isControlledRef } = useIconAnimation(containerRef);
  
      useImperativeHandle(ref, () => ({
        startAnimation: () => { isControlledRef.current = true; controls.start('animate'); },
        stopAnimation: () => { isControlledRef.current = true; controls.start('normal'); },
      }));
  
      return (
        <div
          ref={containerRef}
          className={cn('bg-[#333]', className)}
          {...props}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 21h18"/> {/* Axis */}
            <motion.path
              d="M3 17l6-6 4 4 8-8"
              variants={{
                normal: { pathLength: 1, opacity: 1 },
                animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: DURATION * 1.5, ease: "easeInOut" } }
              }}
              animate={controls}
            />
            {/* Arrow Head */}
            <motion.path 
                d="M17 7h4v4" 
                variants={{
                    normal: { opacity: 1, scale: 1 },
                    animate: { opacity: [0, 1], scale: [0, 1], transition: { delay: DURATION, duration: 0.2 } }
                }}
                animate={controls}
            />
          </svg>
        </div>
      );
    }
  );
  ScalabilityIcon.displayName = 'ScalabilityIcon';

// --- Smart Notification Icon (Bell) ---
const SmartNotificationIcon = forwardRef<IconHandle, IconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const { controls, isControlledRef } = useIconAnimation(containerRef);
  
      useImperativeHandle(ref, () => ({
        startAnimation: () => { isControlledRef.current = true; controls.start('animate'); },
        stopAnimation: () => { isControlledRef.current = true; controls.start('normal'); },
      }));
  
      return (
        <div
          ref={containerRef}
          className={cn('bg-[#333]', className)}
          {...props}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                variants={{
                    normal: { rotate: 0 },
                    animate: { 
                        rotate: [0, -10, 10, -10, 10, 0],
                        transition: { duration: DURATION * 1.5, ease: "linear" }
                    }
                }}
                animate={controls}
                style={{ originX: "50%", originY: "0%" }} // Pivot from top
            />
            <motion.path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                variants={{
                    normal: { opacity: 1 },
                    animate: { opacity: 1 } // Stays visible
                }}
            />
          </svg>
        </div>
      );
    }
  );
  SmartNotificationIcon.displayName = 'SmartNotificationIcon';

// --- Impact Icon (Zap / Pulse) ---
const ImpactIcon = forwardRef<IconHandle, IconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const { controls, isControlledRef } = useIconAnimation(containerRef);
  
      useImperativeHandle(ref, () => ({
        startAnimation: () => { isControlledRef.current = true; controls.start('animate'); },
        stopAnimation: () => { isControlledRef.current = true; controls.start('normal'); },
      }));
  
      return (
        <div
          ref={containerRef}
          className={cn('bg-[#333]', className)}
          {...props}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
             <motion.polygon
                points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                variants={{
                    normal: { scale: 1, opacity: 1, fillOpacity: 0 },
                    animate: { 
                        scale: [1, 1.2, 1],
                        filter: ["drop-shadow(0px 0px 0px rgba(255,202,0,0))", "drop-shadow(0px 0px 8px rgba(255,202,0,0.5))", "drop-shadow(0px 0px 0px rgba(255,202,0,0))"],
                        stroke: ["currentColor", "#ffca00", "currentColor"], // Flash yellow
                        transition: { duration: 0.4 } 
                    }
                }}
                animate={controls}
             />
          </svg>
        </div>
      );
    }
  );
  ImpactIcon.displayName = 'ImpactIcon';

export { AdvertisingIcon, ScalabilityIcon, SmartNotificationIcon, ImpactIcon };
