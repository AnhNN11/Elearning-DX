"use client";

import { useInView } from "motion/react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation, RoughPadding } from "rough-notation/lib/model.js";
import { cn } from "@/lib/utils";

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket";

type HighlighterProps = {
  children: ReactNode;
  action?: AnnotationAction;
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  jitter?: number;
  padding?: RoughPadding;
  multiline?: boolean;
  isView?: boolean;
  className?: string;
};

const defaultPadding: RoughPadding = [2, 8, 2, 8];

function jitterAnnotation(element: HTMLElement, action: AnnotationAction, amount: number) {
  const annotationElement = action === "highlight" ? element.previousElementSibling : element.nextElementSibling;

  if (!(annotationElement instanceof SVGSVGElement) || !annotationElement.classList.contains("rough-annotation")) {
    return;
  }

  const paths = annotationElement.querySelectorAll("path");

  paths.forEach((path, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    const offsetX = (Math.random() - 0.42) * amount;
    const offsetY = (Math.random() - 0.5) * amount * 0.42;
    const rotation = (Math.random() - 0.5) * amount * 0.34 * direction;
    const scaleX = 1 + (Math.random() - 0.44) * 0.08;

    path.style.strokeLinecap = "butt";
    path.style.strokeLinejoin = "miter";
    path.style.strokeMiterlimit = "2";
    path.style.opacity = String(0.84 + Math.random() * 0.16);
    path.style.transformBox = "fill-box";
    path.style.transformOrigin = "center";
    path.style.transform = `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px) rotate(${rotation.toFixed(2)}deg) scaleX(${scaleX.toFixed(3)})`;
  });
}

export function Highlighter({
  children,
  action = "highlight",
  color = "var(--main)",
  strokeWidth = 1.5,
  animationDuration = 700,
  iterations = 2,
  jitter = 3,
  padding = defaultPadding,
  multiline = true,
  isView = false,
  className,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(elementRef, {
    margin: "-10%",
    once: true,
  });
  const shouldShow = !isView || isInView;

  useLayoutEffect(() => {
    const element = elementRef.current;
    let annotation: RoughAnnotation | null = null;
    let resizeObserver: ResizeObserver | null = null;

    if (shouldShow && element) {
      const currentAnnotation = annotate(element, {
        animationDuration,
        color,
        iterations,
        multiline,
        padding,
        strokeWidth,
        type: action,
      });

      annotation = currentAnnotation;
      currentAnnotation.show();
      requestAnimationFrame(() => jitterAnnotation(element, action, jitter));

      resizeObserver = new ResizeObserver(() => {
        currentAnnotation.hide();
        currentAnnotation.show();
        requestAnimationFrame(() => jitterAnnotation(element, action, jitter));
      });

      resizeObserver.observe(element);
      resizeObserver.observe(document.body);
    }

    return () => {
      annotation?.remove();
      resizeObserver?.disconnect();
    };
  }, [action, animationDuration, color, iterations, jitter, multiline, padding, shouldShow, strokeWidth]);

  return (
    <span ref={elementRef} className={cn("rough-highlighter relative inline bg-transparent", className)}>
      {children}
    </span>
  );
}
