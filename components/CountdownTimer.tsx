"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpire: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function getSecondsLeft() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      return Math.max(0, Math.floor(diff / 1000));
    }

    setSecondsLeft(getSecondsLeft());

    const interval = setInterval(() => {
      const remaining = getSecondsLeft();
      setSecondsLeft(remaining);

      if (remaining === 0 && !expired) {
        setExpired(true);
        onExpire();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire, expired]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const isUrgent = secondsLeft <= 60;
  const isEmpty = secondsLeft === 0;

  if (isEmpty) {
    return (
      <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
        <p className="text-destructive font-semibold text-lg">Reservation Expired</p>
        <p className="text-sm text-muted-foreground mt-1">This reservation is no longer valid.</p>
      </div>
    );
  }

  return (
    <div
      className={`text-center p-4 rounded-lg border ${
        isUrgent
          ? "bg-destructive/10 border-destructive/20"
          : "bg-orange-50 border-orange-200"
      }`}
    >
      <p className="text-sm text-muted-foreground mb-1">Reservation expires in</p>
      <p
        className={`text-4xl font-bold font-mono ${
          isUrgent ? "text-destructive" : "text-orange-600"
        }`}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </p>
      <p className="text-xs text-muted-foreground mt-1">Complete your purchase before time runs out</p>
    </div>
  );
}
