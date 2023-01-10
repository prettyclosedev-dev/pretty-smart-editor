import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Navbar,
  Alignment,
  AnchorButton,
  NavbarDivider,
  EditableText,
} from '@blueprintjs/core';
import FaDiscord from '@meronex/icons/fa/FaDiscord';
import BiCodeBlock from '@meronex/icons/bi/BiCodeBlock';
import { useAuth0 } from '@auth0/auth0-react';
import styled from 'polotno/utils/styled';

import { useProject } from '../data/graphql/project';

import { FileMenu } from './file-menu';
import { DownloadButton } from './download-button';
import { UserMenu } from './user-menu';
import { ProfileModal } from './profile-modal';
import { Tooltip2 } from '@blueprintjs/popover2';

const NavbarContainer = styled('div')`
  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled('div')`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

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
          <NavbarDivider />
          <Button
            text="My designs"
            intent="primary"
            onClick={() => {
              store.openSidePanel('my-designs');
            }}
          />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          {project.id !== 'local' && (
            <>
              <div
                style={{
                  paddingRight: '10px',
                  maxWidth: '200px',
                }}
              >
                <EditableText
                  value={project.name}
                  placeholder="Design name"
                  onChange={(name) => {
                    project.name = name;
                    project.requestSave();
                  }}
                />
              </div>
              <Tooltip2
                content={
                  project.private
                    ? 'The design is private'
                    : 'The design is public'
                }
              >
                <Button
                  icon={project.private ? 'eye-off' : 'eye-on'}
                  onClick={() => {
                    project.private = !project.private;
                    project.requestSave();
                  }}
                />
              </Tooltip2>
              <NavbarDivider />
            </>
          )}

          <ProfileModal
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
            }}
            store={store}
          />
          <AnchorButton
            href="https://polotno.com"
            target="_blank"
            minimal
            icon={
              <BiCodeBlock className="bp4-icon" style={{ fontSize: '20px' }} />
            }
          >
            API
          </AnchorButton>
          <NavbarDivider />
          <DownloadButton store={store} />
          <NavbarDivider />
          <UserMenu store={store} project={project} />
          {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
