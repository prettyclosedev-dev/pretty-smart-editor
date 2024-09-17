import { useState, useEffect, useMemo, useRef } from "react";
import { debounce, isEqual } from "lodash";
import { observer } from "mobx-react-lite";
import { MultiSelect } from "@blueprintjs/select";
import {
  Spinner,
  Card,
  TagInput,
  Switch,
  Button,
  Tag,
  EditableText,
  MenuItem,
  InputGroup,
  Popover,
  Menu,
  Icon,
  TextArea,
} from "@blueprintjs/core";
import { SketchPicker } from "react-color";
import FaCubes from "@meronex/icons/fa/FaCubes";
import FaTrash from "@meronex/icons/fa/FaTrash";
import FaSave from "@meronex/icons/fa/FaSave";
import FaPlus from "@meronex/icons/fa/FaPlus";
import { SectionTab } from "polotno/side-panel";

import {
  useBrands,
  useCategories,
  useUpdateCategory,
} from "../data/graphql/api";
import { useProject } from "../data/graphql/project";
import { gql, useMutation } from "@apollo/client";
import { isColorCloseToWhite } from "../utils/common";

const pageTemplates = ["Templates", "Generator", "Collateral"];

const renderBrand = (brand, { handleClick, handleFocus, modifiers, query }) => {
  if (!modifiers.matchesPredicate) return null;

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={brand.id}
      label={brand.id?.toString()}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={`${brand.name}`}
    />
  );
};

const filterBrand = (query, brand, _index, exactMatch) => {
  const normalizedTitle = brand.name.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
  }
};

const BrandsSelect = ({ selectedBrands, addBrand, removeBrand }) => {
  const [brands, loading, error] = useBrands();

  if (loading) return "Loading...";
  if (error) return "Error";

  return (
    <MultiSelect
      menuProps={{
        style: {
          maxHeight: "400px",
          overflow: "auto",
          height: "40vh",
        },
      }}
      items={brands.filter(
        (brand) => !selectedBrands?.find((b) => b.id === brand.id)
      )}
      selectedItems={selectedBrands}
      noResults={
        <MenuItem
          disabled={true}
          text="No results."
          roleStructure="listoption"
        />
      }
      itemRenderer={renderBrand}
      tagRenderer={(brand) => <span key={brand.id}>{brand.name}</span>}
      itemPredicate={filterBrand}
      onItemSelect={addBrand}
      onRemove={removeBrand}
    />
  );
};

const renderPageTemplate = (
  page,
  { handleClick, handleFocus, modifiers, query }
) => {
  if (!modifiers.matchesPredicate) return null;

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={page}
      label={page}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={page}
    />
  );
};

const filterPageTemplate = (query, page, _index, exactMatch) => {
  const normalizedTitle = page.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
  }
};

const PageTemplatesSelect = ({ selectedPages, addPage, removePage }) => {
  return (
    <MultiSelect
      menuProps={{
        style: {
          maxHeight: "400px",
          overflow: "auto",
          height: "40vh",
        },
      }}
      items={pageTemplates.filter((page) => !selectedPages?.includes(page))}
      selectedItems={selectedPages}
      noResults={
        <MenuItem
          disabled={true}
          text="No results."
          roleStructure="listoption"
        />
      }
      itemRenderer={renderPageTemplate}
      tagRenderer={(page) => <span key={page}>{page}</span>}
      itemPredicate={filterPageTemplate}
      onItemSelect={addPage}
      onRemove={removePage}
    />
  );
};

const fieldStyle = { opacity: 0.8, marginRight: 10, marginBottom: 10 };

const UPLOAD_CATEGORY_ICON = gql`
  mutation UploadCategoryIcon($file: Upload!, $categoryId: Int!) {
    uploadCategoryIcon(file: $file, categoryId: $categoryId)
  }
`;

const CategoryCard = ({ category, deleteCategory }) => {
  const [name, setName] = useState(category.name);
  const [tags, setTags] = useState(category.tags || []);
  const [_public, setPublic] = useState(category.public);
  const [brands, setBrands] = useState(category.availableForBrands || []);
  const [pages, setPages] = useState(category.availableOnPages || []);
  const [description, setDescription] = useState(category.description || "");
  const [iconUrl, setIconUrl] = useState(category.icon || "");
  const [color, setColor] = useState(category.color || "#ffffff"); // New state for color
  const [form, setForm] = useState(category.form || ""); // New state for form
  const [colorPickerOpen, setColorPickerOpen] = useState(false); // State for color picker visibility
  const [size, setSize] = useState(category.size !== null ? category.size?.toString() : ""); // Ensure empty if not set

  const [updateOneCategory, loading] = useUpdateCategory();
  const [uploadCategoryIcon, { loading: uploading }] =
    useMutation(UPLOAD_CATEGORY_ICON);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    try {
      const { data } = await uploadCategoryIcon({
        variables: { file, categoryId: category.id },
      });
      if (data?.uploadFile?.length) {
        setIconUrl(data.uploadFile);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const usavedChanges = useMemo(() => {
    return (
      name !== category.name ||
      !isEqual(tags, category.tags) ||
      _public !== category.public ||
      !isEqual(
        brands.map((b) => b.id).sort(),
        category.availableForBrands.map((b) => b.id).sort()
      ) ||
      !isEqual(pages.sort(), category.availableOnPages.sort()) ||
      description !== category.description ||
      iconUrl !== category.icon ||
      color !== category.color || // Check for color changes
      form !== category.form || // Check for form changes
      size !== (category.size !== null ? category.size?.toString() : "")
    );
  }, [
    name,
    tags,
    _public,
    brands,
    pages,
    description,
    iconUrl,
    color,
    form,
    category,
    size,
  ]);

  const updateInput = () => ({
    name: { set: name },
    public: { set: _public },
    tags: { set: tags },
    availableForBrands: { set: brands.map((brand) => ({ id: brand.id })) },
    availableOnPages: { set: pages },
    description: { set: description },
    icon: { set: iconUrl },
    color: { set: color },
    form: { set: form },
    size: size ? { set: parseInt(size) } : { set: null },
  });

  const textColor = isColorCloseToWhite(color) ? 'black' : 'white';

  return (
    <Card style={{padding: 10}} key={category.id} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div style={{ fontSize: 20, marginBottom: 10, textAlign: "center" }}>
        <EditableText value={name} onChange={(t) => setName(t)} />
      </div>
      <div
        style={{
          marginBottom: 10,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Switch
          inline
          checked={_public}
          label="Public"
          onChange={(e) => setPublic(e.target.checked)}
          alignIndicator="right"
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "min-content auto",
          rowGap: 5,
          columnGap: 5,
        }}
      >
        {category.creator && (
          <>
            <span style={fieldStyle}>Creator:</span>
            <span>
              {category.creator.name}{" "}
              <Tag intent="primary">{category.creator.role}</Tag>
            </span>
          </>
        )}

        <span style={fieldStyle}>Tags:</span>
        <TagInput
          values={tags}
          onAdd={(tag) => setTags([...tags, tag[0]])}
          onRemove={(tag) => setTags(tags.filter((t) => t !== tag))}
          placeholder="add tags"
        />

        <span style={fieldStyle}>Brands:</span>
        <BrandsSelect
          selectedBrands={brands}
          addBrand={(brand) => setBrands([...brands, brand])}
          removeBrand={(brand) =>
            setBrands(brands.filter((b) => b.id !== brand.id))
          }
        />

        <span style={fieldStyle}>Show on:</span>
        <PageTemplatesSelect
          selectedPages={pages}
          addPage={(page) => setPages([...pages, page])}
          removePage={(page) => setPages(pages.filter((p) => p !== page))}
        />

        <span style={fieldStyle}>Description:</span>
        <TextArea
          style={{ width: "100%", minHeight: "50px" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description"
        />

        <Button
          style={fieldStyle}
          icon={
            iconUrl ? (
              <img
                src={iconUrl}
                alt="icon"
                style={{ width: 20, height: 20, objectFit: "contain" }}
              />
            ) : (
              <Icon icon="cloud-upload" />
            )
          }
          onClick={() => fileInputRef.current.click()}
          intent="primary"
        >
          {iconUrl ? "Change" : "Upload"}
        </Button>
        <InputGroup
          value={iconUrl}
          onChange={(e) => setIconUrl(e.target.value)}
          placeholder="Enter icon URL"
        />

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <span style={fieldStyle}>Color:</span>
        <Popover
          isOpen={colorPickerOpen}
          onInteraction={(state) => setColorPickerOpen(state)}
          content={
            <SketchPicker
              color={color}
              onChangeComplete={(c) => setColor(c.hex)}
            />
          }
        >
          <Button
            style={{ backgroundColor: color, color: textColor }}
            text={color}
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
          />
        </Popover>

        <span style={fieldStyle}>Form:</span>
        <InputGroup
          value={form}
          onChange={(e) => setForm(e.target.value)}
          placeholder="Enter form id"
        />

        <span style={fieldStyle}>Size:</span>
        <InputGroup
          value={size}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setSize(value); // Only set if the value is a valid number or empty
            }
          }}
          placeholder="Enter size"
          type="text" // Keep it as text to allow the empty state
        />
      </div>
      <div
        style={{
          columnGap: 10,
          display: "flex",
          justifyContent: "end",
          marginTop: 10,
        }}
      >
        <Button
          small
          icon={<FaTrash />}
          intent="danger"
          onClick={() => deleteCategory(category.id)}
        />
        {usavedChanges && (
          <Button
            small
            icon={loading || uploading ? <Spinner size={20} /> : <FaSave />}
            disabled={loading || uploading}
            onClick={() => updateOneCategory(category.id, updateInput())}
            intent={usavedChanges ? "warning" : "none"}
          >
            Save
          </Button>
        )}
      </div>
    </Card>
  );
};

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

export const CategoriesPanel = observer(({ store }) => {
  const project = useProject();
  const [categories, loading, error, addCategory, deleteCategory] =
    useCategories();

  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("all");

  const categoriesFiltered = categories.filter((category) => {
    if (text.length > 0) {
      if (
        !category.name.toLowerCase().includes(text.toLowerCase()) &&
        !category.tags.map((x) => x.toLowerCase()).includes(text.toLowerCase())
      )
        return false;
    }
    if (visibility !== "all") {
      if (visibility === "public" && !category.public) return false;
      if (visibility === "private" && category.public) return false;
    }
    return true;
  });

  const newCategory = () => {
    addCategory({
      name: "",
      creator: {
        connect: {
          id: project.user?.id,
        },
      },
      public: false,
    });
  };

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
      />
      {loading ? (
        <div style={{ padding: "30px" }}>
          <Spinner />
        </div>
      ) : error ? (
        <div>Error loading categories</div>
      ) : (
        <div
          style={{
            display: "flex",
            padding: 5,
            height: "100%",
            overflow: "auto",
            flexDirection: "column",
            gap: 10,
            paddingBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p>{categoriesFiltered.length} categories total</p>
            <Button
              icon={<FaPlus />}
              intent="success"
              onClick={newCategory}
            >
              New
            </Button>
          </div>
          {categoriesFiltered.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              deleteCategory={deleteCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export const CategoriesSection = {
  name: "categories",
  Tab: (props) => (
    <SectionTab name="Categories" {...props}>
      <FaCubes />
    </SectionTab>
  ),
  visibleInList: true,
  Panel: CategoriesPanel,
};
