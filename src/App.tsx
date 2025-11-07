import { useImmer } from "use-immer";
import { TileGrid } from "./TileGrid";
import { TileHighlight } from "./TileHighlight";
import { EntityRenderer } from "./EntityRenderer";
import { BuildPreview } from "./BuildPreview";
import { useKeyboard } from "./useKeyboard";
import { usePointerJoystick } from "./usePointerJoystick";
import { useCrafting } from "./useCrafting";
import { DebugOverlay } from "./DebugOverlay";
import { ProgressBar } from "./ProgressBar";
import { InventoryModal } from "./InventoryModal";
import { initializeAppState } from "./initializeAppState";
import type { AppState, Recipe } from "./types";

export function App() {
  const [state, setState] = useImmer<AppState>(initializeAppState);

  const pointerVelocity = usePointerJoystick();
  useKeyboard({ setState, pointerVelocity });
  useCrafting({ setState });

  const handleCraft = (recipe: Recipe) => {
    setState((draft) => {
      // Check if we have the ingredients
      const hasIngredients = Object.entries(recipe.ingredients).every(
        ([item, required]) =>
          draft.inventory[item as keyof typeof draft.inventory] >=
          (required || 0),
      );

      if (!hasIngredients) return;

      // Deduct ingredients
      Object.entries(recipe.ingredients).forEach(([item, required]) => {
        draft.inventory[item as keyof typeof draft.inventory] -= required || 0;
      });

      // Add to craft queue
      draft.craftQueue.push({
        recipe,
        progress: 0,
      });
    });
  };

  return (
    <>
      <svg
        width="100%"
        height="100%"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#000000",
        }}
      >
        <g
          transform={`translate(${window.innerWidth / 2 - state.player.x}, ${window.innerHeight / 2 - state.player.y})`}
        >
          <TileGrid tiles={state.tiles} visibleChunks={state.visibleChunks} />
          <EntityRenderer
            entities={state.entities}
            visibleChunks={state.visibleChunks}
          />
          {state.action?.type === "build" && (
            <BuildPreview action={state.action} />
          )}
          <TileHighlight state={state} />
        </g>
        <circle
          cx={window.innerWidth / 2}
          cy={window.innerHeight / 2}
          r={4}
          fill="#0000ff"
        />
      </svg>
      <ProgressBar action={state.action} />
      <InventoryModal
        inventory={state.inventory}
        open={state.inventoryOpen}
        onOpenChange={(open) =>
          setState((draft) => {
            draft.inventoryOpen = open;
          })
        }
        craftQueue={state.craftQueue}
        onCraft={handleCraft}
        selectedItem={state.selectedItem}
        onSelectItem={(item) =>
          setState((draft) => {
            draft.selectedItem = item;
          })
        }
      />
      <DebugOverlay
        player={state.player}
        viewport={state.viewport}
        visibleChunks={state.visibleChunks}
        action={state.action}
        inventory={state.inventory}
        selectedItem={state.selectedItem}
        entities={state.entities}
      />
    </>
  );
}
