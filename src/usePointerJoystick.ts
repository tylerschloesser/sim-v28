import { useEffect, useRef } from "react";
import { PLAYER_SPEED } from "./constants";

interface PointerVelocity {
  vx: number; // velocity in tiles/second
  vy: number; // velocity in tiles/second
  active: boolean;
}

/**
 * Hook that provides pointer/touch-based joystick control.
 * On pointerdown, establishes a joystick center point.
 * Distance from center determines velocity magnitude (up to PLAYER_SPEED).
 * Direction from center determines velocity direction.
 * On pointerup, stops movement.
 */
export function usePointerJoystick() {
  const velocityRef = useRef<PointerVelocity>({
    vx: 0,
    vy: 0,
    active: false,
  });

  useEffect(() => {
    let centerX = 0;
    let centerY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      // Establish joystick center at pointer down position
      centerX = e.clientX;
      centerY = e.clientY;
      velocityRef.current.active = true;
      velocityRef.current.vx = 0;
      velocityRef.current.vy = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!velocityRef.current.active) return;

      // Calculate distance and direction from center
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Max distance in pixels for full speed (adjust for comfort)
      const maxDistance = 100;

      // Clamp distance to max
      const clampedDistance = Math.min(distance, maxDistance);

      // Calculate speed as fraction of PLAYER_SPEED (0 to 1)
      const speedFraction = clampedDistance / maxDistance;

      if (distance > 0) {
        // Normalize direction and scale by speed
        // velocity is in tiles/second
        velocityRef.current.vx =
          (dx / distance) * speedFraction * PLAYER_SPEED;
        velocityRef.current.vy =
          (dy / distance) * speedFraction * PLAYER_SPEED;
      } else {
        velocityRef.current.vx = 0;
        velocityRef.current.vy = 0;
      }
    };

    const handlePointerUp = () => {
      // Stop movement on pointer up
      velocityRef.current.active = false;
      velocityRef.current.vx = 0;
      velocityRef.current.vy = 0;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  return velocityRef;
}
