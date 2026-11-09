import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { registerModelCacheServiceWorker } from "./lib/serviceWorker.js";
import { connectHostSession } from "./lib/hostSession.js";
import { getStoredLanguage } from "./i18n.js";
import { hostText } from "./i18nHost.js";
import "./styles.css";

registerModelCacheServiceWorker();

// GitHub Pages khong cap header COOP/COEP: lan tai dau service worker moi
// dang ky xong thi reload 1 lan de service worker chen header vao response
// dieu huong (xem withIsolationHeaders trong model-cache-sw.js). Cac host
// khac da co header san thi crossOriginIsolated = true, khong reload.
void registerModelCacheServiceWorker().then(() => {
  if (!window.location.hostname.endsWith(".github.io")) return;
  if (window.crossOriginIsolated) return;
  if (!navigator.serviceWorker?.controller) return;
  if (window.sessionStorage.getItem("timeline-coi-reload")) return;
  window.sessionStorage.setItem("timeline-coi-reload", "1");
  window.location.reload();
});

const rootElement = document.getElementById("root");
void connectHostSession().then((hostSession) => {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App hostSession={hostSession} />
    </React.StrictMode>,
  );
}).catch(() => {
  const message = document.createElement("p");
  message.setAttribute("role", "alert");
  message.textContent = hostText(getStoredLanguage(), "expired");
  rootElement.replaceChildren(message);
});
