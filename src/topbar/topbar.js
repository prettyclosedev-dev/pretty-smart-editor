import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Navbar,
  Alignment,
  NavbarDivider,
  EditableText,
  Spinner,
  Intent,
} from "@blueprintjs/core";
import { FloppyDisk } from "@blueprintjs/icons";
import { FileMenu } from "./file-menu";
import { DownloadButton } from "./download-button";
import { UserMenu } from "./user-menu";
import { ProfileModal } from "./profile-modal";
import { CategoriesPopover } from "./categories-select";
import { forEveryChild } from "polotno/model/group-model";
import { useProject } from "../data/graphql/project";

import styled from "polotno/utils/styled";
import { TagsPopover } from "./tags-select";
import { IN_APP } from "../data/config";

const NavbarContainer = styled("div")`
  white-space: nowrap;

  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled("div")`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

const PlayButton = observer(({ store }) => {
  let hasAnimations = false;
  forEveryChild({ children: store.pages }, (child) => {
    const hasAnim = child.animations?.find((el) => el.enabled);
    if (hasAnim) {
      hasAnimations = true;
    }
  });
  if (!hasAnimations) {
    return null;
  }
  return (
    <Button
      icon={store.isPlaying ? "pause" : "play"}
      onClick={() => {
        if (store.isPlaying) {
          store.stop();
        } else {
          store.play();
        }
      }}
      style={{
        marginRight: "10px",
      }}
    >
      Preview
    </Button>
  );
});

export default observer(({ store }) => {
  const project = useProject();

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <NavbarContainer className="bp5-navbar">
      <NavInner>
        <Navbar.Group align={Alignment.LEFT}>
          <FileMenu store={store} project={project} />
          {project.isAuthenticated && (
            <Button
              text="My Designs"
              intent="primary"
              style={{ marginLeft: "20px" }}
              onClick={() => {
                store.openSidePanel("my-designs");
              }}
            />
          )}
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          {project.isAuthenticated && (
            <>
              <div
                style={{
                  paddingRight: "10px",
                  maxWidth: "200px",
                }}
              >
                <EditableText
                  value={project.name}
                  placeholder="Untitled Design"
                  onChange={(name) => {
                    project.setName(name);
                    project.requestSave();
                  }}
                  intent={project.name ? Intent.NONE : Intent.WARNING}
                />
              </div>
              <CategoriesPopover store={store} />
              <NavbarDivider />
              <TagsPopover store={store} />
              <NavbarDivider />
              <Button
                text={
                  project.loading
                    ? "Loading..."
                    : project.error
                    ? "---"
                    : project.public
                    ? "Make Private"
                    : "Make Public"
                }
                icon={project.public ? "eye-on" : "eye-off"}
                onClick={() => {
                  project.togglePublic();
                  project.requestSave();
                }}
              />
              <NavbarDivider />
              <Button
                text="Save"
                icon={project.loading ? <Spinner size={20} /> : <FloppyDisk />}
                onClick={() => {
                  project.save(true);
                }}
              />
              <NavbarDivider />
              {/* <ProfileModal
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
            }}
            store={store}
          /> */}
              <PlayButton store={store} />
              <DownloadButton store={store} />
            </>
          )}
          {!IN_APP && (
            <>
              <NavbarDivider />
              <UserMenu store={store} project={project} />
            </>
          )}
          {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
