let audioContext = null;
let unlocked = false;

function getContext() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;

    if (!Ctx) return null;

    audioContext = new Ctx();
  }

  return audioContext;
}

export async function unlockSiren() {
  const ctx = getContext();

  if (!ctx) return false;

  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    unlocked = ctx.state === "running";

    return unlocked;
  } catch (error) {
    console.error("Siren unlock failed:", error);
    return false;
  }
}

export function isSirenUnlocked() {
  return unlocked;
}

export async function playSiren() {
  const ctx = getContext();

  if (!ctx) return false;

  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (ctx.state !== "running") {
      return false;
    }

    unlocked = true;

    const now = ctx.currentTime;
    const duration = 6;

    const masterGain = ctx.createGain();

    // Lower volume
    masterGain.gain.setValueAtTime(0.35, now);
    masterGain.connect(ctx.destination);

    // Alternating emergency siren
    const cycle = 0.65;

    for (let time = 0; time < duration; time += cycle) {
      const start = now + time;
      const end = Math.min(
        start + cycle,
        now + duration
      );

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sawtooth";

      if (Math.floor(time / cycle) % 2 === 0) {
        oscillator.frequency.setValueAtTime(
          1050,
          start
        );

        oscillator.frequency.linearRampToValueAtTime(
          1350,
          end
        );
      } else {
        oscillator.frequency.setValueAtTime(
          650,
          start
        );

        oscillator.frequency.linearRampToValueAtTime(
          500,
          end
        );
      }

      gain.gain.setValueAtTime(
        0.0001,
        start
      );

      gain.gain.exponentialRampToValueAtTime(
        0.85,
        start + 0.04
      );

      gain.gain.setValueAtTime(
        0.85,
        Math.max(start + 0.05, end - 0.08)
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        end
      );

      oscillator.connect(gain);
      gain.connect(masterGain);

      oscillator.start(start);
      oscillator.stop(end);
    }

    masterGain.gain.setValueAtTime(
      0.35,
      now + duration - 0.2
    );

    masterGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    setTimeout(() => {
      try {
        masterGain.disconnect();
      } catch {
        // Already disconnected
      }
    }, (duration + 0.5) * 1000);

    return true;
  } catch (error) {
    console.error("Siren playback failed:", error);
    return false;
  }
}