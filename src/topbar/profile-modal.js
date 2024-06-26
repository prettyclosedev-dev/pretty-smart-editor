import React from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Dialog, Classes } from '@blueprintjs/core';
import * as api from '../data/graphql/api';
import { useProject } from '../data/graphql/project';

export const ProfileModal = observer(({ store, onClose, isOpen }) => {
  const project = useProject();
  const {
    loading,
    // getAccessTokenSilently,
    user,
    isAuthenticated,
  } = project;

  React.useEffect(() => {
    if (loading) {
      return;
    }
    if (!isAuthenticated) {
      return;
    }
  }, [loading, isAuthenticated]); // getAccessTokenSilently

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
