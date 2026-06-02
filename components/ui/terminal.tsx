"use client";

import {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

interface SequenceContextValue {
  completeItem: (index: number) => void;
  activeIndex: number;
  sequenceStarted: boolean;
}

const SequenceContext = createContext<SequenceContextValue | null>(null);
const ItemIndexContext = createContext<number | null>(null);

const useSequence = () => useContext(SequenceContext);
const useItemIndex = () => useContext(ItemIndexContext);

function useInView(ref: RefObject<Element | null>, startOnView: boolean) {
  const [isInView, setIsInView] = useState(!startOnView);

  useEffect(() => {
    if (!startOnView) {
      return;
    }

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      const timeout = window.setTimeout(() => setIsInView(true), 0);
      return () => window.clearTimeout(timeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, startOnView]);

  return isInView;
}

interface AnimatedSpanProps extends ComponentPropsWithoutRef<"div"> {
  delay?: number;
  startOnView?: boolean;
}

export function AnimatedSpan({
  children,
  className,
  delay = 0,
  startOnView = false,
  ...props
}: AnimatedSpanProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(elementRef, startOnView);
  const sequence = useSequence();
  const itemIndex = useItemIndex();
  const [delayComplete, setDelayComplete] = useState(delay === 0);
  const sequenceIsActive =
    sequence !== null &&
    itemIndex !== null &&
    sequence.sequenceStarted &&
    sequence.activeIndex === itemIndex;
  const sequenceHasReached =
    sequence !== null &&
    itemIndex !== null &&
    sequence.sequenceStarted &&
    sequence.activeIndex >= itemIndex;

  useEffect(() => {
    if (sequence || !isInView) {
      return;
    }

    const timeout = window.setTimeout(() => setDelayComplete(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, isInView, sequence]);

  useEffect(() => {
    if (!sequence || itemIndex === null || !sequenceIsActive) {
      return;
    }

    const timeout = window.setTimeout(() => sequence.completeItem(itemIndex), 340);
    return () => window.clearTimeout(timeout);
  }, [itemIndex, sequence, sequenceIsActive]);

  const shouldAnimate = sequence ? sequenceHasReached : isInView && delayComplete;

  return (
    <div
      ref={elementRef}
      className={cn(
        "grid text-sm font-normal tracking-tight transition duration-300 ease-out",
        shouldAnimate ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type TerminalElementType =
  | "article"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "li"
  | "p"
  | "section"
  | "span";

interface TypingAnimationProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  children: string;
  duration?: number;
  delay?: number;
  as?: TerminalElementType;
  startOnView?: boolean;
}

export function TypingAnimation({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = "span",
  startOnView = true,
  ...props
}: TypingAnimationProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(elementRef, startOnView);
  const sequence = useSequence();
  const itemIndex = useItemIndex();
  const [displayedText, setDisplayedText] = useState("");
  const [unsequencedStarted, setUnsequencedStarted] = useState(false);
  const completedRef = useRef(false);
  const TypedElement = Component as ElementType;
  const sequenceIsActive =
    sequence !== null &&
    itemIndex !== null &&
    sequence.sequenceStarted &&
    sequence.activeIndex === itemIndex;
  const shouldType = sequence ? sequenceIsActive : unsequencedStarted;

  useEffect(() => {
    if (sequence || unsequencedStarted || !isInView) {
      return;
    }

    const timeout = window.setTimeout(() => setUnsequencedStarted(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, isInView, sequence, unsequencedStarted]);

  useEffect(() => {
    if (!shouldType) {
      return;
    }

    if (displayedText.length >= children.length) {
      if (sequence && itemIndex !== null && !completedRef.current) {
        completedRef.current = true;
        sequence.completeItem(itemIndex);
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      setDisplayedText(children.slice(0, displayedText.length + 1));
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [children, displayedText, duration, itemIndex, sequence, shouldType]);

  return (
    <TypedElement
      ref={elementRef}
      className={cn("text-sm font-normal tracking-tight", className)}
      {...props}
    >
      {displayedText}
    </TypedElement>
  );
}

interface TerminalProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  loop?: boolean;
  loopDelay?: number;
  sequence?: boolean;
  startOnView?: boolean;
}

export function Terminal({
  children,
  className,
  loop = false,
  loopDelay = 1200,
  sequence = true,
  startOnView = true,
  ...props
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, startOnView);
  const [activeIndex, setActiveIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const childArray = useMemo(() => Children.toArray(children), [children]);
  const itemCount = childArray.length;
  const sequenceStarted = sequence ? !startOnView || isInView : false;
  const sequenceComplete = sequence && sequenceStarted && itemCount > 0 && activeIndex >= itemCount;

  useEffect(() => {
    if (!loop || !sequenceComplete) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActiveIndex(0);
      setRunId((current) => current + 1);
    }, loopDelay);

    return () => window.clearTimeout(timeout);
  }, [loop, loopDelay, sequenceComplete]);

  const contextValue = useMemo<SequenceContextValue | null>(() => {
    if (!sequence) {
      return null;
    }

    return {
      completeItem: (index: number) => {
        setActiveIndex((current) => (index === current ? current + 1 : current));
      },
      activeIndex,
      sequenceStarted,
    };
  }, [activeIndex, sequence, sequenceStarted]);

  const wrappedChildren = useMemo(() => {
    if (!sequence) {
      return children;
    }

    return childArray.map((child, index) => (
      <ItemIndexContext.Provider key={`${runId}-${index}`} value={index}>
        {child}
      </ItemIndexContext.Provider>
    ));
  }, [childArray, children, runId, sequence]);

  const content = (
    <div
      ref={containerRef}
      className={cn(
        "z-0 h-full max-h-[30rem] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background",
        className,
      )}
      {...props}
    >
      <div className="border-b border-border p-4">
        <div className="flex flex-row gap-x-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <div className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="grid gap-y-2 whitespace-pre-wrap font-mono text-sm leading-6">
          {wrappedChildren}
        </code>
      </pre>
    </div>
  );

  if (!sequence) {
    return content;
  }

  return <SequenceContext.Provider value={contextValue}>{content}</SequenceContext.Provider>;
}
