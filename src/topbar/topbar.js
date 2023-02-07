import React from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Navbar,
  Alignment,
  AnchorButton,
  NavbarDivider,
  EditableText,
  MenuItem,
} from "@blueprintjs/core";
import { Select2, ItemPredicate, ItemRenderer } from "@blueprintjs/select";
import FaDiscord from "@meronex/icons/fa/FaDiscord";
import BiCodeBlock from "@meronex/icons/bi/BiCodeBlock";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "polotno/utils/styled";

import { useProject } from "../data/graphql/project";

import { FileMenu } from "./file-menu";
import { DownloadButton } from "./download-button";
import { UserMenu } from "./user-menu";
import { ProfileModal } from "./profile-modal";
import { Tooltip2 } from "@blueprintjs/popover2";

const NavbarContainer = styled("div")`
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

const CATEGORIES = [
  { name: "General", id: 1 },
  { name: "Brand assets", id: 2 },
]; //.map((f, index) => ({ ...f, rank: index + 1 }));

const filterCategory = (query, category, _index, exactMatch) => {
  const normalizedTitle = category.name.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
  }
};

const renderCategory = (
  category,
  { handleClick, handleFocus, modifiers, query }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={category.id}
      label={category.id.toString()}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={`${category.name}`}
    />
  );
};

function createCategory(name) {
  return {
    name,
  };
}

function renderCreateCategoryOption(query, active, handleClick) {
  return (
    <MenuItem
      icon="add"
      text={`Create "${query}"`}
      roleStructure="listoption"
      active={active}
      onClick={handleClick}
      shouldDismissPopover={false}
    />
  );
}

export default observer(({ store }) => {
  const project = useProject();

  const {
    loginWithPopup,
    isLoading,
    getAccessTokenSilently,
    isAuthenticated,
    logout,
  } = useAuth0();

  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <NavbarContainer className="bp4-navbar">
      <NavInner>
        <Navbar.Group align={Alignment.LEFT}>
          <FileMenu store={store} project={project} />
          {isAuthenticated && (
            <>
              <NavbarDivider />
              <Button
                text="My Designs"
                intent="primary"
                onClick={() => {
                  store.openSidePanel("my-designs");
                }}
              />
            </>
          )}
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          {/* {project.id !== 'local' && ( */}
          {isAuthenticated && (
            <>
              <div
                style={{
                  maxWidth: "200px",
                }}
              >
                <Select2
                  createNewItemFromQuery={createCategory}
                  createNewItemRenderer={renderCreateCategoryOption}
                  items={CATEGORIES}
                  itemPredicate={filterCategory}
                  itemRenderer={renderCategory}
                  noResults={
                    <MenuItem
                      disabled={true}
                      text="No results."
                      roleStructure="listoption"
                    />
                  }
                  onItemSelect={({name, id}) => {
                    if (!CATEGORIES.map(cat => cat.name).includes(name)) {
                      CATEGORIES.push({name, id: CATEGORIES.length + 1})
                    }
                    
                    if (!project.category) {
                      project.category = {};
                    }

                    project.category.name = name;
                    // project.requestSave();
                  }}
                >
                  <Button
                    text={project.category?.name || "Select a category"}
                    rightIcon="double-caret-vertical"
                    placeholder="Select a category"
                  />
                </Select2>
              </div>
              <NavbarDivider />
              <div
                style={{
                  paddingRight: "10px",
                  maxWidth: "200px",
                }}
              >
                <EditableText
                  value={project.name}
                  placeholder="Design Name"
                  onChange={(name) => {
                    project.name = name;
                    project.requestSave();
                  }}
                />
              </div>

              <Button
                text="Save"
                icon={"floppy-disk"}
                onClick={() => {
                  project.requestSave();
                }}
              />
              <NavbarDivider />
              <Button
                text="Make Private"
                icon={project.public ? "eye-on" : "eye-off"}
                onClick={() => {
                  project.public = !project.public;
                  project.requestSave();
                }}
              />
              <NavbarDivider />
            </>
          )}
          {/* )} */}

          <ProfileModal
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
            }}
            store={store}
          />
          {/* <AnchorButton
            href="https://polotno.com"
            target="_blank"
            minimal
            icon={
              <BiCodeBlock className="bp4-icon" style={{ fontSize: "20px" }} />
            }
          >
            API
          </AnchorButton> */}
          {/* <NavbarDivider /> */}
          <DownloadButton store={store} />
          <NavbarDivider />
          <UserMenu store={store} project={project} />
          {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
