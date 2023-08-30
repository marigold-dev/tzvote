import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);

// Add or remove the "dark" class based on if the media query matches
document.body.classList.add("dark");

root.render(<App />);
