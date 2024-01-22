import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Card,
  Menu,
  MenuItem,
  Position,
  Spinner,
  InputGroup,
  Popover,
} from "@blueprintjs/core";

import { SectionTab } from "polotno/side-panel";
import FaFolder from "@meronex/icons/fa/FaFolder";
import { useDesigns } from "../data/graphql/api";

import { useProject } from "../data/graphql/project";
import { CategoriesSelectSearch } from "../topbar/categories-select";
import { debounce } from "lodash";

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

function designWhere(user, text, visibility, categories) {
  // currently the categories are or or 
  // need to check if its supposed to be and and
  return {
    creator: {
      email: {
        equals: user?.email
      }
    },
    OR: text?.length > 0 ? [
      {
        name: {
          contains: text
        }
      },
      {
        tags: {
          has: text
        }
      },
    ] : undefined,
    public: visibility && visibility !== "all" ?
      { equals: visibility === "public" } : undefined,
    categories: categories?.length > 0 ? {
      every: {
        id : {
          in: categories.map(cat => cat.id)
        }
      }
    } : undefined,
  }
}

const fireSearch = debounce((refetch, user, text, visibility, categories) => {
  refetch({
    where: designWhere(user, text, visibility, categories)
  })
}, 500)

function visibilityMenu({selected, onChangeSelection}) {
  return (
    <Popover
      content={
        <Menu>
          <MenuItem text="all" 
            onClick={() => onChangeSelection("all")} />
          <MenuItem text="public"
            onClick={() => onChangeSelection("public")} />
          <MenuItem text="private"
            onClick={() => onChangeSelection("private")} />
        </Menu>
      }
      placement="bottom-end"
    >
      <Button minimal={true} rightIcon="caret-down">
        {selected}
      </Button>
    </Popover>
  );
}

export const MyDesignsPanel = observer(({ store }) => {
  const {
    isAuthenticated,
    user,
  } = useAuth0();

  const project = useProject();

  const [designs, count, loading, error, refetch, deleteDesign] = useDesigns({
    where: designWhere(user, "")
  })

  // state of search
  const [text, setText] = useState("")
  const [visibility, setVisibility] = useState("all") // "all" | "public" | "private"
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fireSearch(refetch, user, text, visibility, categories)
  }, [text, visibility, categories, user, refetch])

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
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      <InputGroup
        placeholder="search in name and tags"
        onChange={(e) => setText(e.target.value)}
        value={text}
        rightElement={visibilityMenu({selected: visibility, onChangeSelection: setVisibility})}>
      </InputGroup>
      <CategoriesSelectSearch 
        selected={categories}
        onAddSelected={cat => setCategories( old => old.some(c => c.id === cat.id) ? old : [...old, cat])}
        onRemoveSelected={cat => setCategories(old => old.filter(c => c.id !== cat.id))} />
      {count !== null && <p style={{ marginBottom: 0 }}>{count} results</p>}
      {!isAuthenticated ? 
        <div>please authenticate</div> :
      loading ?
        <div style={{ padding: "30px" }}>
          <Spinner />
        </div> :
      error ?
        <div>Error loading designs</div>:
        <div style={{ display: "flex", paddingTop: "5px", height: "100%", overflow: "auto" }}>
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
        </div>}
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