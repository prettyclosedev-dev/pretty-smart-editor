import React from "react";
import ReactDOM from "react-dom/client";

// polotno
import { createStore } from "polotno/model/store";
import { unstable_setRemoveBackgroundEnabled } from "polotno/config";

// auth
import { Auth0Provider } from "@auth0/auth0-react";

/* redux */
import { Provider } from "react-redux";
import reduxStore from "./data/redux/store";

/* graphql */
import {client} from "./data/graphql/client";
import { ApolloProvider } from "react-apollo";
import { createProject, ProjectContext } from "./data/graphql/project";
import { SubscriptionProvider } from "./tools/subscription-context"; // TODO: - REMOVE

import "./ui/index.css";
import App from "./App";
import { AUTH_DOMAIN, AUTH_ID, POLOTNO_KEY } from "./data/config";

unstable_setRemoveBackgroundEnabled(true);

const store = createStore({ key: POLOTNO_KEY });
window.store = store;
store.addPage();

const project = createProject({ store });
window.project = project;

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={reduxStore}>
    <ApolloProvider client={client}>
      <ProjectContext.Provider value={project}>
        <Auth0Provider
          domain={AUTH_DOMAIN}
          clientId={AUTH_ID}
          redirectUri={window.location.origin}
        >
          <SubscriptionProvider>
            <App store={store} />
          </SubscriptionProvider>
        </Auth0Provider>
      </ProjectContext.Provider>
    </ApolloProvider>
  </Provider>
);
