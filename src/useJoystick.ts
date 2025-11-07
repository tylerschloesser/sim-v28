import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import { PLAYER_SPEED } from "./constants";
import type { AppState } from "./types";

interface UseJoystickOptions {
  setState: Updater<AppState>;
  onJoystickChange?: (state: JoystickState) => void;
}

export interface JoystickState {
  active: boolean;
  centerX: number;
  centerY: number;
  currentX: number;
  currentY: number;
}

const JOYSTICK_MAX_RADIUS = 100; // pixels

export function useJoystick({
  setState,
  onJoystickChange,
}: UseJoystickOptions) {
  const joystickState = useRef<JoystickState>({
    active: false,
    centerX: 0,
    centerY: 0,
    currentX: 0,
    currentY: 0,
  });

  // Handle pointer events
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Place joystick center at pointer position
      joystickState.current = {
        active: true,
        centerX: e.clientX,
        centerY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
      };
      onJoystickChange?.(joystickState.current);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!joystickState.current.active) return;

      // Update current pointer position
      joystickState.current.currentX = e.clientX;
      joystickState.current.currentY = e.clientY;
      onJoystickChange?.(joystickState.current);

      // Calculate velocity based on distance from center
      const dx = e.clientX - joystickState.current.centerX;
      const dy = e.clientY - joystickState.current.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        // Calculate velocity ratio (0 to 1) based on distance from center
        const ratio = Math.min(distance / JOYSTICK_MAX_RADIUS, 1);

        // Normalize direction and scale by ratio and max speed
        const vx = (dx / distance) * ratio * PLAYER_SPEED;
        const vy = (dy / distance) * ratio * PLAYER_SPEED;

        // Update player velocity
        setState((draft) => {
          draft.player.vx = vx;
          draft.player.vy = vy;
        });
      }
    };

    const handlePointerUp = () => {
      if (!joystickState.current.active) return;

      // Stop movement
      setState((draft) => {
        draft.player.vx = 0;
        draft.player.vy = 0;
      });

      joystickState.current.active = false;
      onJoystickChange?.(joystickState.current);
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
  }, [setState, onJoystickChange]);

  return joystickState;
}
