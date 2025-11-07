import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import type { AppState } from "./types";

interface UseCraftingOptions {
  setState: Updater<AppState>;
}

export function useCrafting({ setState }: UseCraftingOptions) {
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const processCrafting = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      setState((draft) => {
        // Only process if there's something in the queue
        if (draft.craftQueue.length === 0) {
          return;
        }

        const currentCraft = draft.craftQueue[0];
        const recipe = currentCraft.recipe;

        // Calculate progress increment based on craft time
        const progressIncrement = deltaTime / (recipe.craftTime / 1000);
        currentCraft.progress += progressIncrement;

        // Check if crafting is complete
        if (currentCraft.progress >= 1) {
          // Add crafted item to inventory
          draft.inventory[recipe.result] += 1;

          // Remove completed craft from queue
          draft.craftQueue.shift();
        }
      });

      animationFrameId = requestAnimationFrame(processCrafting);
    };

    animationFrameId = requestAnimationFrame(processCrafting);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [setState]);
}
