import { useProject } from "../data/graphql/project";
import { observer } from "mobx-react-lite";
import { Popover, PopoverPosition, Button, TagInput } from "@blueprintjs/core";
import { useUser } from "../data/graphql/api";

export const TagsSelect = observer(({ store }) => {
  const project = useProject();
  const { tags = [] } = project || {};
  const [isAuthenticated, user, userLoading, userError] = useUser();

  if (project.loading || userLoading) return "Loading...";
  if (project.error) return `Error! ${project.error.message}`;
  if (userError) return `Error! ${userError.message}`;

  const onAdd = (tag) => {
    project.addTag(tag);
    // project.requestSave();
  };

  const onRemove = (tag) => {
    project.removeTag(tag); // add logic to erase tag for admin
  };

  return (
    <div
      style={{
        maxWidth: "200px",
      }}
    >
      <TagInput
        onAdd={onAdd}
        onRemove={onRemove}
        values={tags}
        placeholder="add tags" />
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
