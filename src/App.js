import React from 'react';
import { observer } from 'mobx-react-lite';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { Tooltip } from 'polotno/canvas/tooltip';
import { setTranslations } from 'polotno/config';
import { useAuth0 } from '@auth0/auth0-react';

import { loadFile } from './tools/file';
import { QrSection } from './sections/qr-section';
// import { ThenounprojectSection } from './thenounproject-section';
// import { TemplatesSection } from "./sections/templates-section";
import { QuotesSection } from './sections/quotes-section';
import { IconsSection } from './sections/icons-section';
import { ShapesSection } from './sections/shapes-section';
import { StableDiffusionSection } from './sections/stable-diffusion-section';
import { MyDesignsSection } from './sections/my-designs-section';
import { MyBrandsSection } from './sections/brands-section';
import { useProject } from './data/graphql/project';

import { ImageRemoveBackground } from './tools/background-remover';

import fr from './translations/fr';
import en from './translations/en';
import id from './translations/id';
import ru from './translations/ru';
import ptBr from './translations/pt-br';

import Topbar from './topbar/topbar';

// DEFAULT_SECTIONS.splice(3, 0, IllustrationsSection);
// replace elements section with just shapes
// DEFAULT_SECTIONS.splice(3, 1, ShapesSection);
// DEFAULT_SECTIONS.splice(2, 0, StableDiffusionSection);
// add icons
// DEFAULT_SECTIONS.splice(3, 0, IconsSection);
// add two more sections
// DEFAULT_SECTIONS.push(QuotesSection, QrSection);
// DEFAULT_SECTIONS.unshift(MyDesignsSection);

// DEFAULT_SECTIONS.push(StableDiffusionSection);


const App = observer(({ store }) => {
  const project = useProject();

  const { isAuthenticated, getAccessTokenSilently, isLoading, user } = useAuth0();

  React.useEffect(() => {
    if (project.language.startsWith('fr')) {
      setTranslations(fr);
    } else if (project.language.startsWith('id')) {
      setTranslations(id);
    } else if (project.language.startsWith('ru')) {
      setTranslations(ru);
    } else if (project.language.startsWith('pt')) {
      setTranslations(ptBr);
    } else {
      setTranslations(en);
    }
  }, [project.language]);

  const load = () => {
    let url = new URL(window.location.href);
    // url example https://studio.polotno.com/design/5f9f1b0b
    const reg = new RegExp('design/([a-zA-Z0-9_-]+)').exec(url.pathname);
    const designId = (reg && reg[1]) || 'local';
    project.loadById(designId);
  };

  React.useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isAuthenticated) {
      project.setUser({email: user.email})
      getAccessTokenSilently()
        .then((token) => {
          project.authToken = token;
          load();
        })
        .catch((err) => {
          project.authToken = null;
          load();
          console.log(err);
        });
    } else {
      project.authToken = null;
      load();
    }
  }, [isAuthenticated, project, getAccessTokenSilently, isLoading, user]);

  const handleDrop = (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // skip the case if we dropped DOM element from side panel
    // in that case Safari will have more data in "items"
    if (ev.dataTransfer.files.length !== ev.dataTransfer.items.length) {
      return;
    }
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFile(ev.dataTransfer.files[i], store);
    }
  };

  const customSections = [...DEFAULT_SECTIONS];

  // customSections.unshift(TemplatesSection)
  customSections.splice(3, 1, ShapesSection);
  customSections.splice(3, 0, IconsSection);
  customSections.push(QuotesSection, QrSection);
  customSections.unshift(MyDesignsSection);
  customSections.push(StableDiffusionSection);
  customSections.push(MyBrandsSection);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onDrop={handleDrop}
    >
      {!window.PrettySmartEmbeddedMode && <Topbar store={store} />}
      <div style={{ height: !window.PrettySmartEmbeddedMode ? 'calc(100% - 50px)' : "100%" }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel store={store} sections={customSections} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar
              store={store}
              components={{
                ImageRemoveBackground,
              }}
            />
            <Workspace store={store} components={{ Tooltip }} />
            <ZoomButtons store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
    </div>
  );
});

export default App;
