import React from "react";
import { observer } from "mobx-react-lite";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Toolbar } from "polotno/toolbar/toolbar";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import {
  SidePanel,
  DEFAULT_SECTIONS,
  TemplatesSection,
} from "polotno/side-panel";
import { Workspace } from "polotno/canvas/workspace";
import { Tooltip } from "polotno/canvas/tooltip";
import { setTranslations } from "polotno/config";

import { loadFile } from "./tools/file";
import { QrSection } from "./sections/qr-section";
// import { ThenounprojectSection } from './thenounproject-section';
// import { TemplatesSection } from "./sections/templates-section";
import { QuotesSection } from "./sections/quotes-section";
import { IconsSection } from "./sections/icons-section";
import { ShapesSection } from "./sections/shapes-section";
import { StableDiffusionSection } from "./sections/stable-diffusion-section";
import { MyDesignsSection } from "./sections/my-designs-section";
import { MyBrandsSection } from "./sections/brands-section";
import { useProject } from "./data/graphql/project";
import { Intent } from "@blueprintjs/core";

import { ImageRemoveBackground } from "./tools/background-remover";

import fr from "./translations/fr";
import en from "./translations/en";
import id from "./translations/id";
import ru from "./translations/ru";
import ptBr from "./translations/pt-br";

import Topbar from "./topbar/topbar";
import { BrandedDesignsSection } from "./sections/branded-designs-section";
import { IN_APP, URL_PREFIX } from "./data/config";
import { CategoriesSection } from "./sections/categories-section";

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

  const [disabled, setDisabled] = React.useState(false);

  const load = () => {
    let url = new URL(window.location.href);

    const email = url.searchParams.get("email");
    if (email) {
      project.setUser({ email });
    }

    if (project.isAuthenticated) {
      // Match both 'design/id' and 'branded-design/id'
      // This regex matches 'design/id' explicitly and excludes 'branded-design/id'
      const regDesign = new RegExp(
        `^\/?${URL_PREFIX}design\/([a-zA-Z0-9_-]+)$`
      ).exec(url.pathname);
      const regBrandedDesign = new RegExp(
        `^\/?${URL_PREFIX}branded-design\/([a-zA-Z0-9_-]+)$`
      ).exec(url.pathname);

      project.brandedDesignId = regBrandedDesign ? regBrandedDesign[1] : "";

      if (regDesign) {
        const designId = regDesign[1] || "local";
        project.loadById(designId);
      } else if (regBrandedDesign) {
        const designId = regBrandedDesign[1] || "local";
        project.loadBrandedById(designId);
      }
    } else {
      project.toastRef?.show({
        timeout: 5000,
        action: {
          onClick: () => {
            project.logout();
          },
          text: "Ok",
        },
        onDismiss: (didTimeoutExpire) => {
          if (didTimeoutExpire) {
            project.logout();
          }
        },
        isCloseButtonShown: false,
        intent: Intent.DANGER,
        message: "You need to login!",
      });
    }
  };

  React.useEffect(() => {
    if (project.language.startsWith("fr")) {
      setTranslations(fr);
    } else if (project.language.startsWith("id")) {
      setTranslations(id);
    } else if (project.language.startsWith("ru")) {
      setTranslations(ru);
    } else if (project.language.startsWith("pt")) {
      setTranslations(ptBr);
    } else {
      setTranslations(en);
    }
  }, [project.language]);

  React.useEffect(() => {
    if (project.loading) {
      return;
    }
    if (!project.isAuthenticated) {
      setDisabled(true);
      project.toastRef?.show({
        timeout: 5000,
        action: {
          onClick: () => {
            project.logout();
            setDisabled(false);
          },
          text: "Ok",
        },
        onDismiss: (didTimeoutExpire) => {
          if (didTimeoutExpire) {
            project.logout();
            setDisabled(false);
          }
        },
        isCloseButtonShown: false,
        intent: Intent.DANGER,
        message: "You need to login!",
      });

      return;
    }
    if (project.isAuthenticated) {
      load();
    }
  }, [project]);

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

  if (!IN_APP && project.isAuthenticated) {
    customSections.unshift(BrandedDesignsSection);
  }

  // customSections.push(BrandedDesignsSection);
  // customSections.push(ShapesSection);
  customSections.push(IconsSection);
  customSections.push(QuotesSection, QrSection);
  customSections.push(MyDesignsSection);
  customSections.push(StableDiffusionSection);

  if (project.isAuthenticated) {
    customSections.push(MyBrandsSection);
  }

  if (!IN_APP && project.isAuthenticated) {
    customSections.push(CategoriesSection);
  }

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          pointerEvents: disabled ? "none" : "auto",
          opacity: disabled ? "0.5" : "1",
        }}
        onDrop={handleDrop}
      >
        <Topbar store={store} />
        <div
          style={{
            height: "calc(100% - 50px)",
          }}
        >
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
    </>
  );
});

export default App;
