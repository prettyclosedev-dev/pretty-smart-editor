import { useProject } from "../data/graphql/project";
import { observer } from "mobx-react-lite";
import { Popover, PopoverPosition, Button, MenuItem, Tag } from "@blueprintjs/core";
import { MultiSelect2 } from "@blueprintjs/select";
import { useUser } from "../data/graphql/api";
import { useAuth0 } from "@auth0/auth0-react";

const filterTag = (query, tag, _index, exactMatch) => {
  const normalizedTitle = tag.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
  }
};

const renderTag = (
  tag,
  { handleClick, handleFocus, modifiers, query, index }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={index}
      label={index.toString()}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={`${tag}`}
    />
  );
};

function renderCreateTagOption(query, active, handleClick) {
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

function createTagFromQuery(tag) {
  return tag;
}

export const TagsSelect = observer(({ store }) => {
  const project = useProject();
  const { tags = [] } = project || {};
  const { isAuthenticated, user } = useAuth0();
  const [gqlUser, userLoading, userError] = useUser({
    email: isAuthenticated ? user.email : null,
  });

  if (project.loading || userLoading) return "Loading...";
  if (project.error) return `Error! ${project.error.message}`;
  if (userError) return `Error! ${userError.message}`;

  const onItemSelect = (tag) => {
    project.addTag(tag);
    // project.requestSave();
  };

  const onItemRemove = (tagToRemove) => {
    project.removeTag(tagToRemove); // add logic to erase tag for admin
  };

  const renderRemoveTag = (tag, index) => (
    <Tag key={index} onRemove={() => onItemRemove(tag)}>
      {tag}
    </Tag>
  );

  return (
    <div
      style={{
        maxWidth: "200px",
      }}
    >
      <MultiSelect2
        menuProps={{
          style: {
            maxHeight: "400px",
            overflow: "auto",
          },
        }}
        createNewItemFromQuery={createTagFromQuery}
        // allow creating tags only for admins
        createNewItemRenderer={gqlUser.role === "ADMIN" ? renderCreateTagOption : undefined}
        items={tags}
        itemPredicate={filterTag}
        itemRenderer={renderTag}
        noResults={
          <MenuItem
            disabled={true}
            text="No results."
            roleStructure="listoption"
          />
        }
        onItemSelect={onItemSelect}
        tagRenderer={renderRemoveTag}
        selectedItems={project.tags || []}
      >
        <Button
          text={project.tags?.length > 0 ? project.tags.join(', ') : "Select tags"}
          rightIcon="double-caret-vertical"
          placeholder="Select tags"
        />
      </MultiSelect2>
    </div>
  );
});

export const TagsPopover = observer((store) => {
  return (
    <Popover
      content={<TagsSelect store={store} />}
      position={PopoverPosition.RIGHT}
    >
      <Button icon="tag" text="Select Tags" />
    </Popover>
  );
});
