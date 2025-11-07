import { useEffect, useRef, type RefObject } from "react";
import type { Updater } from "use-immer";
import {
  ENTITY_DEFINITIONS,
  MINE_TIME_MS,
  PLAYER_ACCELERATION,
  PLAYER_SPEED,
  TILE_SIZE,
  UNCOVER_TIME_MS,
} from "./constants";
import {
  calculateMovementAndCollision,
  processMovementInput,
} from "./playerMovement";
import { tileToId } from "./tileUtils";
import type { AppState } from "./types";
import { updateViewport, updateVisibleChunks } from "./viewportUtils";
import { getAvailableAction } from "./actionUtils";
import { getEntityTiles } from "./entityUtils";

interface PointerVelocity {
  vx: number;
  vy: number;
  active: boolean;
}

interface UseKeyboardOptions {
  setState: Updater<AppState>;
  pointerVelocity: RefObject<PointerVelocity>;
}

export function useKeyboard({
  setState,
  pointerVelocity,
}: UseKeyboardOptions) {
  const keysPressed = useRef<Set<string>>(new Set());

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", " "].includes(key)) {
        keysPressed.current.add(key);
      }
      // Toggle inventory with 'e' key
      if (key === "e") {
        setState((draft) => {
          draft.inventoryOpen = !draft.inventoryOpen;
        });
      }
      // Deselect item with 'q' key
      if (key === "q") {
        setState((draft) => {
          draft.selectedItem = null;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setState]);

  // Animation loop for smooth player movement with acceleration
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const updatePlayer = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      setState((draft) => {
        let vx: number;
        let vy: number;

        // Use pointer velocity if active, otherwise use keyboard input
        if (pointerVelocity.current?.active) {
          // Use pointer velocity directly (no acceleration)
          vx = pointerVelocity.current.vx;
          vy = pointerVelocity.current.vy;
        } else {
          // Process keyboard movement input with acceleration
          const result = processMovementInput(
            keysPressed.current,
            draft.player.vx,
            draft.player.vy,
            deltaTime,
            PLAYER_ACCELERATION,
            PLAYER_SPEED,
          );
          vx = result.vx;
          vy = result.vy;
        }

        // Apply velocity to draft
        draft.player.vx = vx;
        draft.player.vy = vy;

        // Calculate movement with collision detection
        if (vx !== 0 || vy !== 0) {
          // Convert velocity in tiles/s to pixels by multiplying by TILE_SIZE
          // Then multiply by deltaTime to get distance traveled this frame
          const dx = vx * TILE_SIZE * deltaTime;
          const dy = vy * TILE_SIZE * deltaTime;

          // Call pure function with readonly state
          const result = calculateMovementAndCollision({
            currentX: draft.player.x,
            currentY: draft.player.y,
            dx,
            dy,
            world: draft.tiles,
          });

          // Apply mutations to draft
          draft.player.x = result.x;
          draft.player.y = result.y;

          // Update viewport and visible chunks
          updateViewport(draft);
          updateVisibleChunks(draft);
        }

        // Get player's current tile position
        const playerTileX = Math.floor(draft.player.x / TILE_SIZE);
        const playerTileY = Math.floor(draft.player.y / TILE_SIZE);
        const currentTileId = tileToId(playerTileX, playerTileY);
        const tile = draft.tiles[playerTileY]?.[playerTileX];

        // Build action takes precedence when an item is selected
        if (draft.selectedItem) {
          const entityDef = ENTITY_DEFINITIONS[draft.selectedItem];
          if (entityDef.placeable) {
            // Calculate where entity would be placed
            // Center entity on player's pixel position, then round to tile alignment
            const entityWidth = entityDef.size.width;
            const entityHeight = entityDef.size.height;

            // Calculate center position in tile coordinates (player position / TILE_SIZE)
            const playerTileXExact = draft.player.x / TILE_SIZE;
            const playerTileYExact = draft.player.y / TILE_SIZE;

            // Calculate top-left position and round to nearest tile
            const targetX = Math.round(playerTileXExact - entityWidth / 2);
            const targetY = Math.round(playerTileYExact - entityHeight / 2);

            // Check if placement is valid
            let isValid = true;
            for (let dy = 0; dy < entityHeight; dy++) {
              for (let dx = 0; dx < entityWidth; dx++) {
                const checkX = targetX + dx;
                const checkY = targetY + dy;

                // Check bounds
                if (
                  checkY < 0 ||
                  checkY >= draft.tiles.length ||
                  checkX < 0 ||
                  checkX >= draft.tiles[0].length
                ) {
                  isValid = false;
                  break;
                }

                const checkTile = draft.tiles[checkY][checkX];

                // Tile must be uncovered and not have an entity
                if (checkTile.covered || checkTile.entityId) {
                  isValid = false;
                  break;
                }
              }
              if (!isValid) break;
            }

            // Set build action
            draft.action = {
              type: "build",
              itemType: draft.selectedItem,
              valid: isValid,
              targetX,
              targetY,
            };

            // Handle spacebar press for building
            const spacebarPressed = keysPressed.current.has(" ");
            if (spacebarPressed && isValid) {
              // Create entity
              const entityId = `entity-${Date.now()}`;
              draft.entities[entityId] = {
                id: entityId,
                type: draft.selectedItem,
                x: targetX,
                y: targetY,
              };

              // Mark tiles with entityId
              for (let dy = 0; dy < entityHeight; dy++) {
                for (let dx = 0; dx < entityWidth; dx++) {
                  const markX = targetX + dx;
                  const markY = targetY + dy;
                  draft.tiles[markY][markX].entityId = entityId;
                }
              }

              // Consume from inventory
              draft.inventory[draft.selectedItem] -= 1;

              // Clear selected item
              draft.selectedItem = null;
              draft.action = null;
            }

            // Skip other action logic when build action is active
            return;
          }
        }

        // Determine what action is available at current position using shared logic
        const availableActionType = getAvailableAction(
          playerTileX,
          playerTileY,
          draft,
        );

        // Set action proactively when available action changes or player moves tiles
        if (availableActionType) {
          // Check if we need to create/update the action
          const needsUpdate =
            !draft.action ||
            draft.action.type !== availableActionType ||
            ("tileId" in draft.action && draft.action.tileId !== currentTileId);

          if (needsUpdate) {
            // Initialize new action at current position
            if (availableActionType === "destroy-entity") {
              draft.action = {
                type: "destroy-entity",
                entityId: tile?.entityId || "",
                tileId: currentTileId,
                progress: 0,
              };
            } else {
              draft.action = {
                type: availableActionType,
                tileId: currentTileId,
                progress: 0,
              };
            }
          }
        } else {
          // No available action - clear action
          draft.action = null;
        }

        // Make progress on action only when spacebar is pressed
        const spacebarPressed = keysPressed.current.has(" ");
        if (spacebarPressed && draft.action && draft.action.type !== "build") {
          const actionTimeMs =
            draft.action.type === "mine"
              ? MINE_TIME_MS
              : draft.action.type === "destroy-entity"
                ? MINE_TIME_MS
                : UNCOVER_TIME_MS;
          const progressIncrement = deltaTime / (actionTimeMs / 1000);
          draft.action.progress += progressIncrement;

          // Check if action is complete
          if (draft.action.progress >= 1) {
            if (draft.action.type === "mine" && tile?.resource) {
              // Add resource to inventory
              draft.inventory[tile.resource] += 1;
              // Reset progress to remainder for continuous mining
              draft.action.progress = draft.action.progress - 1.0;
            } else if (draft.action.type === "uncover" && tile) {
              // Uncover the tile
              tile.covered = false;
              // Clear action (uncovering is one-time)
              draft.action = null;
            } else if (draft.action.type === "destroy-entity") {
              // Look up entity and return it to inventory
              const entity = draft.entities[draft.action.entityId];
              if (entity) {
                // Add entity to inventory
                draft.inventory[entity.type] =
                  (draft.inventory[entity.type] || 0) + 1;

                // Get all tiles the entity occupies
                const entityTiles = getEntityTiles(entity);

                // Clear entityId from all occupied tiles
                for (const tilePos of entityTiles) {
                  const entityTile = draft.tiles[tilePos.y]?.[tilePos.x];
                  if (entityTile) {
                    entityTile.entityId = undefined;
                  }
                }

                // Remove entity from entities dictionary
                delete draft.entities[draft.action.entityId];
              }

              // Clear action (destroying is one-time)
              draft.action = null;
            }
          }
        }
      });

      animationFrameId = requestAnimationFrame(updatePlayer);
    };

    animationFrameId = requestAnimationFrame(updatePlayer);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [setState, pointerVelocity]);
}
