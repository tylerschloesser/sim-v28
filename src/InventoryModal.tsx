import { Dialog } from "@base-ui-components/react/dialog";
import type { Inventory } from "./types";
import { RESOURCE_COLORS } from "./constants";

interface InventoryModalProps {
  inventory: Inventory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryModal({
  inventory,
  open,
  onOpenChange,
}: InventoryModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 2000,
          }}
        />
        <Dialog.Popup
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#1a1a1a",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            padding: "24px",
            minWidth: "400px",
            zIndex: 2001,
            color: "white",
            fontFamily: "monospace",
          }}
        >
          <Dialog.Title
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Inventory
          </Dialog.Title>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {(Object.entries(inventory) as [keyof Inventory, number][]).map(
              ([resource, amount]) => (
                <div
                  key={resource}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: RESOURCE_COLORS[resource],
                        borderRadius: "4px",
                      }}
                    />
                    <span
                      style={{ fontSize: "16px", textTransform: "capitalize" }}
                    >
                      {resource}
                    </span>
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {amount}
                  </span>
                </div>
              ),
            )}
          </div>
          <Dialog.Close
            style={{
              marginTop: "24px",
              width: "100%",
              padding: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            Close (E)
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
