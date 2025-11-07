import type { JoystickState } from "./useJoystick";

interface JoystickUIProps {
  joystickState: JoystickState;
}

const JOYSTICK_MAX_RADIUS = 100;

export function JoystickUI({ joystickState }: JoystickUIProps) {
  if (!joystickState.active) return null;

  // Calculate current position relative to center
  const dx = joystickState.currentX - joystickState.centerX;
  const dy = joystickState.currentY - joystickState.centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Clamp visual position to max radius
  const clampedDistance = Math.min(distance, JOYSTICK_MAX_RADIUS);
  const angle = Math.atan2(dy, dx);
  const visualX = joystickState.centerX + Math.cos(angle) * clampedDistance;
  const visualY = joystickState.centerY + Math.sin(angle) * clampedDistance;

  return (
    <svg
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {/* Outer boundary circle */}
      <circle
        cx={joystickState.centerX}
        cy={joystickState.centerY}
        r={JOYSTICK_MAX_RADIUS}
        fill="rgba(255, 255, 255, 0.1)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="2"
      />

      {/* Center dot */}
      <circle
        cx={joystickState.centerX}
        cy={joystickState.centerY}
        r={8}
        fill="rgba(255, 255, 255, 0.5)"
      />

      {/* Current position indicator (stick) */}
      <line
        x1={joystickState.centerX}
        y1={joystickState.centerY}
        x2={visualX}
        y2={visualY}
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Current position circle */}
      <circle
        cx={visualX}
        cy={visualY}
        r={20}
        fill="rgba(255, 255, 255, 0.4)"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="2"
      />
    </svg>
  );
}
