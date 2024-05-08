import React from "react";
import ReactDOM from "react-dom/client";

import { createStore } from "polotno/model/store";
import { unstable_setRemoveBackgroundEnabled } from "polotno/config";
import { unstable_setAnimationsEnabled } from "polotno/config";
import { createProject, ProjectContext } from "./data/graphql/project";
import { AUTH_DOMAIN, AUTH_ID, POLOTNO_KEY } from "./data/config";
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

// need to get config
// mode: "standalone" | "integrated"
// email
// token
// project id

// than ditch auth0 and make pretteysmart privide token and clyps to use the tokens
export function mountEditor(elem, { mode, authToken, email, designId }) {
  
  if (window.location.host !== "studio.polotno.com") {
    console.log(
      `%cWelcome to Polotno Studio! Thanks for your interest in the project!
  This repository has many customizations from the default version Polotno SDK.
  I don't recommend to use it as starting point. 
  Instead, you can start from any official demos, e.g.: https://polotno.com/docs/demo-full-editor 
  or direct sandbox: https://codesandbox.io/s/github/polotno-project/polotno-site/tree/source/examples/polotno-demo?from-embed.
  But feel free to use this repository as a reference for your own project and to learn how to use Polotno SDK.`,
      "background: rgba(54, 213, 67, 1); color: white; padding: 5px;"
    );
  }
  
  unstable_setRemoveBackgroundEnabled(true);
  unstable_setAnimationsEnabled(true);
  
  const store = createStore({ key: POLOTNO_KEY });
  window.store = store;
  store.addPage();
  
  const project = createProject({ store, authToken, email, id: designId });
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
      onReset={(details) => {
        // Reset the state of your app so the error doesn't happen again
      }}
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