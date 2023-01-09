import React from 'react';
import ReactDOM from 'react-dom/client';

import { createStore } from 'polotno/model/store';
import { unstable_setRemoveBackgroundEnabled } from 'polotno/config';
import { Auth0Provider } from '@auth0/auth0-react';
import { createProject, ProjectContext } from './data/graphql/project';
import { SubscriptionProvider } from './tools/subscription-context'; // TODO: - REMOVE

import './ui/index.css';
import App from './App';

unstable_setRemoveBackgroundEnabled(true);

const store = createStore({ key: 'FA29LdEvOAJdMenXqqEy' });
window.store = store;
store.addPage();

const project = createProject({ store });
window.project = project;

const root = ReactDOM.createRoot(document.getElementById('root'));

const AUTH_DOMAIN = 'prettysmart.us.auth0.com';
const AUTH_ID = 'ioDLFKxzfv1TprtHgwB0lZy4Vy5pQlN1';

root.render(
  <ProjectContext.Provider value={project}>
    <Auth0Provider domain={AUTH_DOMAIN} clientId={AUTH_ID} redirectUri={window.location.origin}>
      <SubscriptionProvider>
        <App store={store} />
      </SubscriptionProvider>
    </Auth0Provider>
  </ProjectContext.Provider>
);
