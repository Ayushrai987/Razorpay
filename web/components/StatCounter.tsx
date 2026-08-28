"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface StatCounterProps {
  value: number;
  duration?: number; // in seconds
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function StatCounter({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
}: StatCounterProps) {
  const [count, setCount] = useState<number>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const start = 0;
    const end = value;
    const totalMiliseconds = duration * 1000;
    const frameRate = 60; // 60fps
    const increment = (end - start) / (totalMiliseconds / (1000 / frameRate));

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <span ref={ref}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}
