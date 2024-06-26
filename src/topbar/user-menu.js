import React from "react";
import { observer } from "mobx-react-lite";

import { Button, Position, Menu, MenuItem, Popover } from "@blueprintjs/core";
import * as api from "../data/graphql/api";
import { ProfileModal } from "./profile-modal";
import { LoginModal } from "./login-modal";
import { useProject } from "../data/graphql/project";

export const UserMenu = observer(({ store }) => {
  const project = useProject();
  const {
    loading,
    // getAccessTokenSilently,
    isAuthenticated,
    logout,
  } = project;
  const [subModalOpen, toggleSubModal] = React.useState(false);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);

  const handleLoginSuccess = () => {
    // Implement the logic for logging in the user here
    // This might include updating the state to indicate the user is authenticated
  };

  React.useEffect(() => {
    if (loading) {
      return;
    }
    if (!isAuthenticated) {
      return;
    }
  }, [loading, isAuthenticated]); // getAccessTokenSilently

  return (
    <>
      <Popover
        content={
          <Menu style={{ width: "80px !important" }}>
            {!isAuthenticated && (
              <MenuItem
                text="Login"
                icon="log-in"
                onClick={() => setLoginModalOpen(true)}
              />
            )}
            {isAuthenticated && (
              <MenuItem
                text="Profile"
                icon={"thumbs-up"}
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
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
});
