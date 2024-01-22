import { useProject } from "../data/graphql/project";
import { observer } from "mobx-react-lite";
import { Popover, PopoverPosition, Button, MenuItem, Tag } from "@blueprintjs/core";
import { MultiSelect } from "@blueprintjs/select";
import { useCategories, useUser } from "../data/graphql/api";
import { useAuth0 } from "@auth0/auth0-react";

const filterCategory = (query, category, _index, exactMatch) => {
  const normalizedTitle = category.name.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
  }
};

const renderCategory = (
  category,
  { handleClick, handleFocus, modifiers, query }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={category.id}
      label={category.id.toString()}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={`${category.name}`}
    />
  );
};

function renderCreateCategoryOption(query, active, handleClick) {
  return (
    <MenuItem
      icon="add"
      text={`Create "${query}"`}
      roleStructure="listoption"
      active={active}
      onClick={handleClick}
      shouldDismissPopover={false}
    />
  );
}

function createCategoryFromQuery(name) {
  return { name };
}

export const CategoriesSelect = observer(({ store }) => {
  const project = useProject();
  const { isAuthenticated, user } = useAuth0();
  const [categories, categoriesLoading, categoriesError, addCategory] =
    useCategories({where: {public: {equals: true}}}); // filter for public categories
  const [gqlUser, userLoading, userError] = useUser({
    email: isAuthenticated ? user.email : null,
  });

  if (project.loading || categoriesLoading || userLoading) return "Loading...";
  if (project.error) return `Error! ${project.error.message}`;
  if (categoriesError) return `Error! ${categoriesError.message}`;
  if (userError) return `Error! ${userError.message}`;

  const onItemSelect = ({ name, id }) => {
    if (id === undefined && !!gqlUser?.id && gqlUser?.role === "ADMIN") {
      addCategory({
        name,
        creator: {
          connect: {
            id: gqlUser?.id,
          },
        },
        public: true
      }).then((result) => {
        const { name, id } = result?.data?.createOneCategory;
        project.addCategory({ name, id });
      }).catch(e => {
        console.log("Failed to add category", e);
      });
    } else if (id !== undefined) {
      project.addCategory({ name, id });
    }
    // project.requestSave();
  };

  const onItemRemove = categoryToRemove => {
    project.removeCategory(categoryToRemove); // add logic to erase category for admin
  };

  const renderTag = category => (
    <span key={category.id}>
      {category.name}
    </span>
  );

  return (
    <div
      style={{
        maxWidth: "200px",
      }}
    >
      <MultiSelect
        menuProps={{
          style: {
            maxHeight: "400px",
            overflow: "auto",
          },
        }}
        createNewItemFromQuery={createCategoryFromQuery}
        // allow creating categories only for admins
        createNewItemRenderer={gqlUser.role === "ADMIN" ? renderCreateCategoryOption : undefined}
        items={categories}
        itemPredicate={filterCategory}
        itemRenderer={renderCategory}
        noResults={
          <MenuItem
            disabled={true}
            text="No results."
            roleStructure="listoption"
          />
        }
        onItemSelect={onItemSelect}
        tagRenderer={renderTag}
        onRemove={onItemRemove}
        selectedItems={project.categories || []}
      >
        <Button
          text={project.categories?.length > 0 ? project.categories.map(c => c.name).join(', ') : "Select categories"}
          rightIcon="double-caret-vertical"
          placeholder="Select categories"
        />
      </MultiSelect>
    </div>
  );
});

export const CategoriesPopover = observer((store) => {
  return (
    <Popover
      content={<CategoriesSelect store={store} />}
      position={PopoverPosition.RIGHT}
    >
      <Button icon="tag" text="Select Categories" />
    </Popover>
  );
});


export const CategoriesSelectSearch = ({selected, onAddSelected, onRemoveSelected}) => {
  const [categories, categoriesLoading, categoriesError] =
    useCategories({where: {public: {equals: true}}}); // filter for public categories

  if (categoriesError) return `Error! ${categoriesError.message}`;

  const renderTag = category => (
    <span key={category.id}>
      {category.name}
    </span>
  );

  return (
    <div>
      <MultiSelect
        menuProps={{
          style: {
            maxHeight: "400px",
            overflow: "auto",
          },
        }}
        tagInputProps={{
          leftIcon: "tag"
        }}
        // filter already selected categories
        items={categories.filter(c => !selected.some(i => c.id === i.id))}
        itemPredicate={filterCategory}
        itemRenderer={renderCategory}
        placeholder="search categories"
        noResults={
          <MenuItem
            disabled={true}
            text="No results."
            roleStructure="listoption"
          />
        }
        onItemSelect={onAddSelected}
        tagRenderer={renderTag}
        onRemove={onRemoveSelected}
        selectedItems={selected || []}
      >
      </MultiSelect>
    </div>
  );
}