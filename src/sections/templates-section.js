import React from "react";
import { observer } from "mobx-react-lite";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Card,
  Menu,
  MenuItem,
  Position,
  Spinner,
} from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";

import { SectionTab } from "polotno/side-panel";
import FaBox from "@meronex/icons/fa/FaBox";

import { useProject } from "../data/graphql/project";
import { useTemplates } from "../data/graphql/api";

const DesignCard = observer(({ design, project }) => {
  const [loading, setLoading] = React.useState(false);
  const handleSelect = async () => {
    setLoading(true);
    await project.loadById(design.id);
    project.store.openSidePanel("photos");
    setLoading(false);
  };
  const handleCopy = async () => {
    setLoading(true);
    if (project.id !== design.id) {
      await project.loadById(design.id);
    }
    await project.duplicate();
    project.store.openSidePanel("photos");
    setLoading(false);
  };
  return (
    <Card
      style={{ margin: "3px", padding: "0px", position: "relative" }}
      interactive
      onClick={() => {
        handleSelect();
      }}
    >
      <img src={design.preview} style={{ width: "100%" }} />
      <div
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          padding: "3px",
        }}
      >
        {design.name}
      </div>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Spinner />
        </div>
      )}
      <div
        style={{ position: "absolute", top: "5px", right: "5px" }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Popover2
          content={
            <Menu>
              <MenuItem
                icon="document-open"
                text="Open"
                onClick={() => {
                  handleSelect();
                }}
              />
            </Menu>
          }
          position={Position.BOTTOM}
        >
          <Button icon="more" />
        </Popover2>
      </div>
    </Card>
  );
});

export const MyDesignsPanel = observer(({ store }) => {
  const {
    isAuthenticated
  } = useAuth0();

  const project = useProject();

  const [templates, loading, error] = useTemplates()

  if (!isAuthenticated) {
    return (
      <div style={{ height: "100%" }}>
        <div>please authenticate</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ height: "100%" }}>
        <div style={{ padding: "30px" }}>
          <Spinner />
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div style={{ height: "100%" }}>
        <div>Error loading templates</div>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div style={{ height: "100%" }}>
        <div>No designs yet</div>
      </div>
    )
  }

  const half1 = [];
  const half2 = [];

  templates?.forEach((design, index) => {
    if (index % 2 === 0) {
      half1.push(design);
    } else {
      half2.push(design);
    }
  });

  return (
    <div style={{ height: "100%" }}>
        <div style={{ display: "flex", paddingTop: "5px" }}>
          <div style={{ width: "50%" }}>
            {half1.map((design) => (
              <DesignCard
                design={design}
                key={design.id}
                store={store}
                project={project}
              />
            ))}
          </div>
          <div style={{ width: "50%" }}>
            {half2.map((design) => (
              <DesignCard
                design={design}
                key={design.id}
                store={store}
                project={project}
              />
            ))}
          </div>
        </div>
    </div>
  );
});

// define the new custom section
export const TemplatesSection = {
  name: "pretteysmart-templates",
  Tab: (props) => (
    <SectionTab name="Designs" {...props}>
      <FaBox />
    </SectionTab>
  ),
  visibleInList: true,
  // we need observer to update component automatically on any store changes
  Panel: MyDesignsPanel,
};
