import React from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';

import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/popover2/lib/css/blueprint-popover2.css';

import { createStore } from 'polotno/model/store';

const polotnoStore = createStore({
  key: 'FA29LdEvOAJdMenXqqEy',
  showCredit: true,
});
const page = polotnoStore.addPage();

const Editor = ({}) => {
  return (
    <PolotnoContainer style={{ width: '100vw', height: '100vh' }}>
      <SidePanelWrap>
        <SidePanel store={polotnoStore} />
      </SidePanelWrap>
      <WorkspaceWrap>
        <Toolbar store={polotnoStore} downloadButtonEnabled />
        <Workspace store={polotnoStore} />
        <ZoomButtons store={polotnoStore} />
      </WorkspaceWrap>
    </PolotnoContainer>
  );
};

export default Editor;
