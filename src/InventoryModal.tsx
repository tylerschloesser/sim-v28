import { Dialog } from "@base-ui-components/react/dialog";
import type {
  Inventory,
  CraftQueueEntry,
  Recipe,
  CraftedItemType,
  ResourceType,
  ItemType,
} from "./types";
import { ITEM_COLORS, RECIPES } from "./constants";

interface InventoryModalProps {
  inventory: Inventory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  craftQueue: CraftQueueEntry[];
  onCraft: (recipe: Recipe) => void;
}

export function InventoryModal({
  inventory,
  open,
  onOpenChange,
  craftQueue,
  onCraft,
}: InventoryModalProps) {
  // Separate resources and crafted items
  const resources: [ResourceType, number][] = [];
  const craftedItems: [CraftedItemType, number][] = [];

  (Object.entries(inventory) as [ItemType, number][]).forEach(
    ([item, amount]) => {
      if (item === "stone-furnace" || item === "wood-storage") {
        craftedItems.push([item, amount]);
      } else {
        resources.push([item as ResourceType, amount]);
      }
    },
  );

  // Check if we can craft a recipe
  const canCraft = (recipe: Recipe): boolean => {
    return Object.entries(recipe.ingredients).every(
      ([item, required]) => inventory[item as ItemType] >= (required || 0),
    );
  };

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
            minWidth: "800px",
            maxHeight: "80vh",
            overflowY: "auto",
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
            Inventory & Crafting
          </Dialog.Title>

          <div style={{ display: "flex", gap: "24px" }}>
            {/* Left Column - Inventory */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                Resources
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {resources.map(([resource, amount]) => (
                  <div
                    key={resource}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: ITEM_COLORS[resource],
                          borderRadius: "3px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        {resource}
                      </span>
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      {amount}
                    </span>
                  </div>
                ))}
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginTop: "20px",
                  marginBottom: "12px",
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                Crafted Items
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {craftedItems.map(([item, amount]) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: ITEM_COLORS[item],
                          borderRadius: "3px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        {item.replace("-", " ")}
                      </span>
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      {amount}
                    </span>
                  </div>
                ))}
                {craftedItems.length === 0 && (
                  <div
                    style={{
                      padding: "10px 12px",
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "14px",
                      fontStyle: "italic",
                    }}
                  >
                    No crafted items yet
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Crafting */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                Recipes
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {(Object.entries(RECIPES) as [CraftedItemType, Recipe][]).map(
                  ([itemType, recipe]) => {
                    const enabled = canCraft(recipe);
                    return (
                      <button
                        key={itemType}
                        onClick={() => enabled && onCraft(recipe)}
                        disabled={!enabled}
                        style={{
                          padding: "12px",
                          backgroundColor: enabled
                            ? "rgba(100, 150, 255, 0.2)"
                            : "rgba(255, 255, 255, 0.05)",
                          border: `1px solid ${enabled ? "rgba(100, 150, 255, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
                          borderRadius: "6px",
                          color: enabled ? "white" : "rgba(255, 255, 255, 0.4)",
                          cursor: enabled ? "pointer" : "not-allowed",
                          fontFamily: "monospace",
                          fontSize: "14px",
                          textAlign: "left",
                          opacity: enabled ? 1 : 0.6,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            marginBottom: "6px",
                            textTransform: "capitalize",
                          }}
                        >
                          {itemType.replace("-", " ")}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "rgba(255, 255, 255, 0.7)",
                          }}
                        >
                          {Object.entries(recipe.ingredients).map(
                            ([item, count], i) => (
                              <span key={item}>
                                {i > 0 && " + "}
                                {count} {item}
                              </span>
                            ),
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>

              {/* Craft Queue */}
              {craftQueue.length > 0 && (
                <>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      marginTop: "20px",
                      marginBottom: "12px",
                      color: "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    Crafting Queue
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {craftQueue.map((entry, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "10px 12px",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "6px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              textTransform: "capitalize",
                            }}
                          >
                            {entry.recipe.result.replace("-", " ")}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(255, 255, 255, 0.6)",
                            }}
                          >
                            {index === 0
                              ? `${Math.floor(entry.progress * 100)}%`
                              : "Queued"}
                          </span>
                        </div>
                        {index === 0 && (
                          <div
                            style={{
                              width: "100%",
                              height: "4px",
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              borderRadius: "2px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${entry.progress * 100}%`,
                                height: "100%",
                                backgroundColor: "hsl(200, 70%, 60%)",
                                transition: "width 0.1s linear",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
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
