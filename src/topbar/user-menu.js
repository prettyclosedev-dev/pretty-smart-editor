import React from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Position, Menu, MenuItem, Popover } from '@blueprintjs/core';
import * as api from '../data/graphql/api';
import { ProfileModal } from './profile-modal';

export const UserMenu = observer(({ store }) => {
  const {
    loginWithPopup,
    isLoading,
    getAccessTokenSilently,
    isAuthenticated,
    logout,
  } = {};
  const [subModalOpen, toggleSubModal] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      return;
    }
  }, [isLoading, isAuthenticated, getAccessTokenSilently]);

  return (
    <>
      <Popover
        content={
          <Menu style={{ width: '80px !important' }}>
            {!isAuthenticated && (
              <MenuItem text="Login" icon="log-in" onClick={loginWithPopup} />
            )}
            {isAuthenticated && (
              <MenuItem
                text="Profile"
                icon={'thumbs-up'}
                onClick={() => {
                  toggleSubModal(true);
                }}
              />
            )}
            {isAuthenticated && (
              <MenuItem
                text="Logout"
                icon="log-out"
                onClick={() => {
                  logout({ returnTo: window.location.origin, localOnly: true });
                }}
              />
            )}
          </Menu>
        }
        position={Position.BOTTOM_RIGHT}
      >
        <Button icon="user" minimal></Button>
      </Popover>
      <ProfileModal
        store={store}
        isOpen={subModalOpen}
        onClose={() => toggleSubModal(false)}
      />
    </>
  );
});
