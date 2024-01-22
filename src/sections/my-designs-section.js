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
  Popover
} from "@blueprintjs/core";

import { SectionTab } from "polotno/side-panel";
import FaFolder from "@meronex/icons/fa/FaFolder";
import { useDesigns } from "../data/graphql/api";

import { useProject } from "../data/graphql/project";

const DesignCard = observer(({ design, project, onDelete }) => {
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
        <Popover
          content={
            <Menu>
              <MenuItem
                icon="document-open"
                text="Open"
                onClick={() => {
                  handleSelect();
                }}
              />
              <MenuItem
                icon="duplicate"
                text="Copy"
                onClick={async () => {
                  handleCopy();
                }}
              />
              <MenuItem
                icon="trash"
                text="Delete"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete it?")) {
                    onDelete(design.id);
                  }
                }}
              />
            </Menu>
          }
          position={Position.BOTTOM}
        >
          <Button icon="more" />
        </Popover>
      </div>
    </Card>
  );
});

export const MyDesignsPanel = observer(({ store }) => {
  const {
    isAuthenticated,
    user,
  } = useAuth0();

  const project = useProject();

  const [designs, loading, error, deleteDesign] = useDesigns({
    where: {
      // user: {
      //   email: {
      //     equals: user?.email
      //   }
      // }
    }
  })

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
        <div>Error loading designs</div>
      </div>
    )
  }

  if (designs.length === 0) {
    return (
      <div style={{ height: "100%" }}>
        <div>No designs yet</div>
      </div>
    )
  }

  const half1 = [];
  const half2 = [];

  designs?.forEach((design, index) => {
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
              onDelete={deleteDesign}
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
              onDelete={deleteDesign}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// define the new custom section
export const MyDesignsSection = {
  name: "my-designs",
  Tab: (props) => (
    <SectionTab name="My Designs" {...props}>
      <FaFolder />
    </SectionTab>
  ),
  visibleInList: false,
  // we need observer to update component automatically on any store changes
  Panel: MyDesignsPanel,
};
