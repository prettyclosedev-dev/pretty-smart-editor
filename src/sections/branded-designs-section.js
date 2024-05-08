import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Card,
  Menu,
  MenuItem,
  Position,
  Spinner,
  InputGroup,
  Popover,
  SegmentedControl,
} from "@blueprintjs/core";

import { SectionTab } from "polotno/side-panel";
import FaBox from "@meronex/icons/fa/FaBox";

import { useProject } from "../data/graphql/project";
import { useBrandedDesigns } from "../data/graphql/api";

import { CategoriesSelectSearch } from "../topbar/categories-select";
import { debounce } from "lodash";

const DesignCard = observer(({ design, project }) => {
  const [loading, setLoading] = React.useState(false);
  const handleSelect = async () => {
    setLoading(true);
    await project.loadBranded(design);
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
      <img
        src={design.preview}
        style={{ width: "100%" }}
        alt="design-preview"
      />
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
    OR:
      text?.length > 0
        ? [
          {
            name: {
              contains: text,
              mode: "insensitive",
            },
          },
          {
            tags: {
              has: text,
            },
          },
        ]
        : undefined,
    public:
      visibility && visibility !== "all"
        ? { equals: visibility === "public" }
        : undefined,
    categories:
      categories?.length > 0
        ? {
          some: {
            id: {
              in: categories.map((cat) => cat.id),
            },
          },
        }
        : undefined,
  };
}

const fireSearch = debounce((refetch, user, text, visibility, categories) => {
  if (refetch !== undefined) {
    refetch({
      where: designWhere(user, text, visibility, categories),
    });
  }
}, 500);

function visibilityMenu({ selected, onChangeSelection }) {
  return (
    <Popover
      content={
        <Menu>
          <MenuItem text="all" onClick={() => onChangeSelection("all")} />
          <MenuItem text="public" onClick={() => onChangeSelection("public")} />
          <MenuItem
            text="private"
            onClick={() => onChangeSelection("private")}
          />
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

export const BrandedDesignsPanel = observer(({ store }) => {
  const project = useProject();
  const { user } = project;

  const [designs, count, loading, error, refetch] = useBrandedDesigns({
    where: designWhere(user),
    user,
    brand: project.brand,
  });

  // state of search
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("all"); // "all" | "public" | "private"
  const [categories, setCategories] = useState([]);
  // local filter
  const [aspect, setAspect] = useState("all"); // "all" | "square" | "landscape" | "portrait"

  useEffect(() => {
    fireSearch(refetch, user, text, visibility, categories);
  }, [text, visibility, categories, user, refetch]);

  const half1 = [];
  const half2 = [];

  designs
    ?.filter((design) => {
      if (aspect === "square") {
        return design.width === design.height;
      } else if (aspect === "landscape") {
        return design.width > design.height;
      } else if (aspect === "portrait") {
        return design.width < design.height;
      }
      return true;
    })
    ?.forEach((design, index) => {
      if (index % 2 === 0) {
        half1.push(design);
      } else {
        half2.push(design);
      }
    });

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingBottom: 10,
      }}
    >
      <InputGroup
        placeholder="Search name or tags"
        onChange={(e) => setText(e.target.value)}
        value={text}
        rightElement={visibilityMenu({
          selected: visibility,
          onChangeSelection: setVisibility,
        })}
      ></InputGroup>
      <CategoriesSelectSearch
        selected={categories}
        onAddSelected={(cat) =>
          setCategories((old) =>
            old.some((c) => c.id === cat.id) ? old : [...old, cat]
          )
        }
        onRemoveSelected={(cat) =>
          setCategories((old) => old.filter((c) => c.id !== cat.id))
        }
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row-reverse",
        }}
      >
        <SegmentedControl
          value={aspect}
          inline={true}
          options={[
            { label: "All", value: "all" },
            { label: "Square", value: "square" },
            { label: "Landscape", value: "landscape" },
            { label: "Portrait", value: "portrait" },
          ]}
          onValueChange={(val) => setAspect(val)}
          small={true}
        />
        {!!count && !loading && (
          <p style={{ marginBottom: 0 }}>
            {count} result{count > 1 ? "s" : ""}
          </p>
        )}
      </div>
      {loading ? (
        <div style={{ padding: "30px" }}>
          <Spinner />
        </div>
      ) : error ? (
        <div>Error loading designs</div>
      ) : (
        <div
          style={{
            display: "flex",
            paddingTop: "5px",
            height: "100%",
            overflow: "auto",
          }}
        >
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
      )}
    </div>
  );
});

// define the new custom section
export const BrandedDesignsSection = {
  name: "pretty-smart-branded-designs",
  Tab: (props) => (
    <SectionTab name="Designs" {...props}>
      <FaBox />
    </SectionTab>
  ),
  visibleInList: true,
  // we need observer to update component automatically on any store changes
  Panel: BrandedDesignsPanel,
};
