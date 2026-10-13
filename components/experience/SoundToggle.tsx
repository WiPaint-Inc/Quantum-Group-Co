"use client";

import { useEffect, useRef, useState } from "react";

export function SoundToggle() {
  const [on, setOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stop.current?.();
      void audio.current?.close();
    };
  }, []);

  function toggle() {
    if (on) {
      stop.current?.();
      stop.current = null;
      setOn(false);
      return;
    }
    const context = audio.current ?? new AudioContext();
    audio.current = context;
    void context.resume();
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 92;
    filter.type = "lowpass";
    filter.frequency.value = 220;
    gain.gain.value = 0.012;
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    stop.current = () => {
      gain.gain.linearRampToValueAtTime(0.0001, context.currentTime + 0.2);
      oscillator.stop(context.currentTime + 0.22);
    };
    setOn(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="pointer-events-auto border border-gold/40 bg-ink/70 px-3 py-2 text-[0.62rem] tracking-[0.22em] text-sand uppercase"
    >
      Sound {on ? "on" : "off"}
    </button>
  );
}
