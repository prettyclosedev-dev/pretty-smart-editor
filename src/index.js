import React from "react";
import ReactDOM from "react-dom/client";

import { createStore } from "polotno/model/store";
import { unstable_setRemoveBackgroundEnabled } from "polotno/config";
import { unstable_setAnimationsEnabled } from "polotno/config";
import { createProject, ProjectContext } from "./data/graphql/project";
import { POLOTNO_KEY } from "./data/config";
import { OverlayToaster, Position } from "@blueprintjs/core";

/* redux */
import { Provider } from "react-redux";
import reduxStore from "./data/redux/store";

/* graphql */
import { client } from "./data/graphql/client";
import { ApolloProvider } from "@apollo/client";

import { setTranslations } from "polotno/config";
import fr from "./translations/fr.json";

import "./ui/index.css";
import App from "./App";
import "./logger";
import { ErrorBoundary } from "react-error-boundary";

export function mountEditor(elem, { mode, email, designId, additional = {} }) {
  unstable_setRemoveBackgroundEnabled(true);
  unstable_setAnimationsEnabled(true);

  const store = createStore({ key: POLOTNO_KEY });
  window.store = store;
  store.addPage();

  window.mode = mode;

  const project = createProject({ store, email, id: designId, additional });
  window.project = project;

  function Fallback({ error, resetErrorBoundary }) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
  
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
        <div style={{ textAlign: "center", paddingTop: "40px" }}>
          <p>Something went wrong in the app.</p>
          <p>Try to reload the page.</p>
          <p>If it does not work, clear cache and reload.</p>
          <button
            onClick={async () => {
              await project.clear();
              window.location.reload();
            }}
          >
            Clear cache and reload
          </button>
        </div>
      </div>
    );
  }

  const root = ReactDOM.createRoot(elem ?? document.getElementById("root"));

  root.render(
    <ErrorBoundary
      FallbackComponent={Fallback}
      onReset={(details) => { /* Reset logic */ }}
      onError={(e) => {
        if (window.Sentry) {
          window.Sentry.captureException(e);
        }
      }}
    >
      <Provider store={reduxStore}>
        <ApolloProvider client={client}>
          <ProjectContext.Provider value={project}>
            <App store={store} />
          </ProjectContext.Provider>
        </ApolloProvider>
      </Provider>
      <OverlayToaster position={Position.TOP} usePortal={true} ref={r => project.setToastRef(r)} />
    </ErrorBoundary>
  );
}
