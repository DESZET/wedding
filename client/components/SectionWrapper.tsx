import { useEffect, useRef, useState } from "react";
import { usePageLoader } from "@/hooks/usePageLoader";

interface SectionWrapperProps {
  children: React.ReactNode;
  id: string;
  delay?: number;
  threshold?: number;
  className?: string;
  animationType?: 'fade-in-up' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
}

export default function SectionWrapper({
  children,
  id,
  delay = 0,
  threshold = 0.15,
  className = "",
  animationType = 'fade-in-up'
}: SectionWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { isPageLoading } = usePageLoader();

  useEffect(() => {
    if (isPageLoading) {
      setIsVisible(false);
      return;
    }

    const currentRef = sectionRef.current;
    
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            // Trigger animation after delay
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          }
        });
      },
      { 
        threshold,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (currentRef && observerRef.current) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [delay, threshold, isVisible, isPageLoading]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`
        scroll-triggered
        ${animationType}
        ${isVisible ? 'is-visible' : ''}
        ${className}
        transition-all duration-700 ease-out
      `}
      style={{
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </section>
  );
}