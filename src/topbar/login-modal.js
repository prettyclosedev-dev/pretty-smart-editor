import React, { useState } from "react";
import { Dialog, InputGroup, Button, Spinner } from "@blueprintjs/core";
import { useProject } from "../data/graphql/project";
import { APP_URL, CLYPS_ENDPOINT } from "../data/config";

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const project = useProject();

  const handleLogin = async () => {
    project.setLoading(true);
    setLoading(true);
    setError(null);
    
    try {
      const raw = await fetch(`${APP_URL}${CLYPS_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const response = await raw.json();
      if (response.success) {
        project.setLoginUser(response.user);
        onLoginSuccess();
        onClose();
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred. Please try again.");
    } finally {
      project.setLoading(false);
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Login">
      <div className="bp3-dialog-body" style={{ padding: 20 }}>
        <InputGroup
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputGroup
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginTop: 20 }}
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
      <div className="bp3-dialog-footer" style={{ padding: 20 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          intent="primary"
          onClick={handleLogin}
          loading={loading}
          style={{ marginLeft: 20 }}
        >
          {loading ? <Spinner size={20} /> : "Login"}
        </Button>
      </div>
    </Dialog>
  );
};
