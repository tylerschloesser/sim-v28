import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { Application, Graphics } from "pixi.js";

// Initialize Pixi.js canvas
const app = new Application();

await app.init({
  background: "#000000",
  resizeTo: window,
});

// Add the canvas to the DOM
document.body.appendChild(app.canvas);

// Create a blue circle in the center
const circle = new Graphics();
circle.circle(0, 0, 50);
circle.fill(0x0000ff);

// Position the circle in the center of the screen
circle.x = app.screen.width / 2;
circle.y = app.screen.height / 2;

app.stage.addChild(circle);

// Handle window resize to keep circle centered
window.addEventListener("resize", () => {
  circle.x = app.screen.width / 2;
  circle.y = app.screen.height / 2;
});

// Render React (currently empty)
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
