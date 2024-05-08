import React from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Dialog, Classes } from '@blueprintjs/core';
import * as api from '../data/graphql/api';

export const ProfileModal = observer(({ store, onClose, isOpen }) => {
  const {
    loginWithPopup,
    isLoading,
    getAccessTokenSilently,
    user,
    isAuthenticated,
    logout,
  } = {};

  React.useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      return;
    }
  }, [isLoading, isAuthenticated, getAccessTokenSilently]);

  return (
    <Dialog
      onClose={onClose}
      title="Welcome to Design Editor"
      isOpen={isOpen}
      style={{
        width: '80%',
        maxWidth: '600px',
      }}
    >
      <div className={Classes.DIALOG_BODY}>
        {isAuthenticated && (
          <>
            <p>Hello {user.name} 😍 </p>
            <p>
              Email: {user.email}
            </p>
          </>
        )}
        {!isAuthenticated && (
          <>
            <p>
              Please login
            </p>
          </>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div
          className={Classes.DIALOG_FOOTER_ACTIONS}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
});
