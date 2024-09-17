import { useState, useMemo } from "react";
import { observer } from "mobx-react-lite";
import {
  InputGroup,
  Card,
  Button,
  Spinner,
  Switch,
  NumericInput,
  Divider,
} from "@blueprintjs/core";
import FaPlus from "@meronex/icons/fa/FaPlus";
import FaList from "@meronex/icons/fa/FaList";
import FaTrash from "@meronex/icons/fa/FaTrash";
import FaSave from "@meronex/icons/fa/FaSave";
import { SectionTab } from "polotno/side-panel";
import { useForms } from "../data/graphql/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const fieldStyle = { marginBottom: 10 };

const FormCard = ({ form, onUpdate, onDelete }) => {
  const [name, setName] = useState(form.title);
  const [subTitle, setSubTitle] = useState(form.subTitle || "");
  const [hasImage, setHasImage] = useState(form.hasImage || false);
  const [fields, setFields] = useState(
    form.fields.map((field, index) => ({
      ...field,
      isNew: false, // Track if it's a new field
      isDeleted: false, // Track if it's marked for deletion
      index, // Add index to each field
    })) || []
  );

  const handleFieldChange = (index, updatedField) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updatedField };
    setFields(updatedFields);
  };

  const addNewField = () => {
    setFields([
      ...fields,
      {
        title: "",
        placeholder: "",
        max: 255,
        key: "",
        required: false,
        isNew: true,
        index: fields.length,
      },
    ]);
  };

  const deleteField = (index) => {
    const updatedFields = [...fields];
    if (updatedFields[index].id) {
      updatedFields[index].isDeleted = true; // Mark existing field as deleted
    } else {
      updatedFields.splice(index, 1); // Remove newly added fields
    }
    setFields(updatedFields);
  };

  const updateInput = () => {
    const createFields = fields
      .filter((field) => field.isNew && !field.isDeleted)
      .map((field) => ({
        title: field.title,
        placeholder: field.placeholder,
        max: field.max,
        key: field.key,
        required: field.required,
        index: field.index,
      }));

    const updateFields = fields
      .filter((field) => !field.isNew && !field.isDeleted)
      .map((field) => ({
        where: { id: field.id },
        data: {
          title: { set: field.title },
          placeholder: { set: field.placeholder },
          max: { set: field.max },
          key: { set: field.key },
          required: { set: field.required },
          index: { set: field.index },
        },
      }));

    const deleteFields = fields
      .filter((field) => field.isDeleted)
      .map((field) => ({ id: field.id }));

    return {
      title: { set: name },
      subTitle: { set: subTitle },
      hasImage: { set: hasImage },
      fields: {
        create: createFields,
        update: updateFields,
        delete: deleteFields,
      },
    };
  };

  const unsavedChanges = useMemo(() => {
    return (
      name !== form.title ||
      subTitle !== form.subTitle ||
      hasImage !== form.hasImage ||
      fields !== form.fields
    );
  }, [name, subTitle, hasImage, fields, form]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // If dropped outside the list, do nothing
    if (!destination) return;

    // Reorder fields based on drag-and-drop
    const reorderedFields = Array.from(fields);
    const [removed] = reorderedFields.splice(source.index, 1);
    reorderedFields.splice(destination.index, 0, removed);

    // Update indexes
    setFields(reorderedFields.map((field, index) => ({ ...field, index })));
  };

  return (
    <Card style={{ padding: 10, marginBottom: 30 }} key={form.id} elevation={3}>
      <div style={{ marginBottom: 10 }}>
        <InputGroup
          style={fieldStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Form Title"
          required
        />
        <InputGroup
          style={fieldStyle}
          value={subTitle}
          onChange={(e) => setSubTitle(e.target.value)}
          placeholder="Form Subtitle"
        />
        <Switch
          style={fieldStyle}
          checked={hasImage}
          onChange={(e) => setHasImage(e.target.checked)}
          label="Has Image"
        />
        <h4>Form Fields</h4>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {fields
                  .filter((field) => !field.isDeleted) // Only show non-deleted fields
                  .map((field, index) => (
                    <Draggable
                      key={index}
                      draggableId={index.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <p>Field {index + 1}</p>
                          <Card
                            style={{ padding: "10px", marginBottom: "10px" }}
                            elevation={1}
                          >
                            <InputGroup
                              style={fieldStyle}
                              value={field.title}
                              onChange={(e) =>
                                handleFieldChange(index, {
                                  title: e.target.value,
                                })
                              }
                              placeholder="Field Title"
                              required
                            />
                            <InputGroup
                              style={fieldStyle}
                              value={field.placeholder}
                              onChange={(e) =>
                                handleFieldChange(index, {
                                  placeholder: e.target.value,
                                })
                              }
                              placeholder="Field Placeholder"
                            />
                            <NumericInput
                              style={fieldStyle}
                              value={field.max}
                              onValueChange={(value) =>
                                handleFieldChange(index, { max: value })
                              }
                              placeholder="Max Characters"
                            />
                            <InputGroup
                              style={fieldStyle}
                              value={field.key}
                              onChange={(e) =>
                                handleFieldChange(index, {
                                  key: e.target.value,
                                })
                              }
                              placeholder="Field Key"
                            />
                            <Switch
                              style={fieldStyle}
                              checked={field.required}
                              onChange={(e) =>
                                handleFieldChange(index, {
                                  required: e.target.checked,
                                })
                              }
                              label="Required Field"
                            />
                            <Button
                              icon={<FaTrash />}
                              intent="danger"
                              onClick={() => deleteField(index)}
                            >
                              Delete Field
                            </Button>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Button icon={<FaPlus />} onClick={addNewField}>
            Add New Field
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 20,
            borderTopColor: "lightgray",
            borderTopWidth: 1,
            borderTopStyle: "solid",
          }}
        >
          <Button
            icon={<FaSave />}
            onClick={() => onUpdate(form.id, updateInput())}
            disabled={!unsavedChanges}
          >
            Save Form
          </Button>
          <Button
            icon={<FaTrash />}
            intent="danger"
            onClick={() => onDelete(form.id)}
          >
            Delete Form
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const FormsPanel = observer(() => {
  const [forms, loading, error, addForm, updateForm, deleteForm] = useForms();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newForm = () => {
    addForm({
      title: "",
      subTitle: "",
      hasImage: false,
      fields: {
        create: [
          { title: "", placeholder: "", max: 255, key: "", required: false },
        ],
      },
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
        placeholder="Search forms..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <div>Error loading forms</div>
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
            <Button icon={<FaPlus />} intent="success" onClick={newForm}>
              New
            </Button>
          </div>
          <h4 style={{ marginBottom: 0 }}>Forms</h4>
          {filteredForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onUpdate={updateForm}
              onDelete={deleteForm}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export const FormsSection = {
  name: "forms",
  Tab: (props) => (
    <SectionTab name="Forms" {...props}>
      <FaList />
    </SectionTab>
  ),
  visibleInList: true,
  Panel: FormsPanel,
};
