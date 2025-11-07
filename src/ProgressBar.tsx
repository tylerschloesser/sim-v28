import type {
  UncoverAction,
  MineAction,
  BuildAction,
  DestroyEntityAction,
} from "./types";

interface ProgressBarProps {
  action: UncoverAction | MineAction | BuildAction | DestroyEntityAction | null;
}

export function ProgressBar({ action }: ProgressBarProps) {
  // Hide if no action, build action, or progress is 0
  if (!action || action.type === "build") {
    return null;
  }

  if (action.progress === 0) {
    return null;
  }

  const percentage = Math.round(action.progress * 100);
  const actionLabel =
    action.type === "uncover"
      ? "Uncovering"
      : action.type === "destroy-entity"
        ? "Destroying"
        : "Mining";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "300px",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "12px",
            marginBottom: "6px",
            textAlign: "center",
            fontFamily: "monospace",
          }}
        >
          {actionLabel}: {percentage}%
        </div>
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              backgroundColor:
                action.type === "uncover"
                  ? "#4CAF50"
                  : action.type === "destroy-entity"
                    ? "#F44336"
                    : "#FF9800",
            }}
          />
        </div>
      </div>
    </div>
  );
}
