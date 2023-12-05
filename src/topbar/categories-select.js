import { useProject } from "../data/graphql/project";
import { observer } from "mobx-react-lite";
import { Button, MenuItem } from "@blueprintjs/core";
import { Select2 } from "@blueprintjs/select";
import { useQuery, useMutation } from "react-apollo";
import { loader } from "graphql.macro";
const getCategories = loader("../data/graphql/queries/getCategories.graphql");
const createOneCategory = loader(
  "../data/graphql/mutations/createOneCategory.graphql",
);

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
  { handleClick, handleFocus, modifiers, query },
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
  const [createCategory] = useMutation(createOneCategory);
  const { loading, error, data } = useQuery(getCategories);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  
  const onItemSelect = ({ name, id }) => {
    if (id == undefined) {
      createCategory({
        variables: {
          data: {
            name,
          },
        },
        refetchQueries: [getCategories],
        awaitRefetchQueries: true,
      }).then(({ data: { createOneCategory } }) => {
        const { name, id } = createOneCategory;
        project.setCategory({ name, id });
      });
    } else {
      project.setCategory({ name, id });
    }
    // project.requestSave();
  };

  return (
    <div
      style={{
        maxWidth: "200px",
      }}
    >
      <Select2
        menuProps={{
          style: {
            maxHeight: "400px",
            overflow: "auto",
          },
        }}
        createNewItemFromQuery={createCategoryFromQuery}
        createNewItemRenderer={renderCreateCategoryOption}
        items={data.categories}
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
      >
        <Button
          text={project.category?.name || "Select a category"}
          rightIcon="double-caret-vertical"
          placeholder="Select a category"
        />
      </Select2>
    </div>
  );
});
