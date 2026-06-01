"use client";

import { useEffect, useRef } from "react";

export function SmoothCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!supportsFinePointer || reduceMotion) {
      return;
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let animationFrame = 0;

    const reveal = () => {
      dotRef.current?.classList.add("is-visible");
      ringRef.current?.classList.add("is-visible");
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      reveal();
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
    };

    const handlePointerDown = () => ringRef.current?.classList.add("is-pressed");
    const handlePointerUp = () => ringRef.current?.classList.remove("is-pressed");

    const animate = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <div aria-hidden className="smooth-cursor-dot" ref={dotRef} />
      <div aria-hidden className="smooth-cursor-ring" ref={ringRef} />
    </>
  );
}
