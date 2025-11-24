import localforage from "localforage";

import { loader } from "graphql.macro";
import { client } from "./client";
import { useQuery, useMutation } from "@apollo/client";
import { nanoid } from "nanoid";

// query
const getDesignsQuery = loader("./queries/getDesigns.graphql");
const getBrandedDesignsQuery = loader("./queries/getBrandedDesigns.graphql");
const getDesignQuery = loader("./queries/getDesign.graphql");
const getBrandedDesignQuery = loader("./queries/getBrandedDesign.graphql");
const getCategoriesQuery = loader("./queries/getCategories.graphql");
const getUserQuery = loader("./queries/getUser.graphql");
const getTemplatesQuery = loader("./queries/getTemplates.graphql");
const getBrands = loader("./queries/getBrands.graphql");
const getFormsQuery = loader("./queries/getForms.graphql");

// mutation
const createOneDesignMutation = loader("./mutations/createOneDesign.graphql");
const updateOneDesignMutation = loader("./mutations/updateOneDesign.graphql");
const deleteOneDesignMutation = loader("./mutations/deleteOneDesign.graphql");
const createOneCategoryMutation = loader(
  "./mutations/createOneCategory.graphql"
);
const updateOneCategoryMutation = loader(
  "./mutations/updateOneCategory.graphql"
);
const deleteOneCategoryMutation = loader(
  "./mutations/deleteOneCategory.graphql"
);
const createOneFormMutation = loader("./mutations/createOneForm.graphql");
const updateOneFormMutation = loader("./mutations/updateOneForm.graphql");
const deleteOneFormMutation = loader("./mutations/deleteOneForm.graphql");

// fragments
const categoryFragment = loader("./fragments/category.graphql");

const API = "https://polotno-studio-api.vercel.app/api";

export async function getDesignById({ id, user, brand }) {
  try {
    if (id === "local") {
      const json = await localforage.getItem("polotno-state");

      if (json) {
        json.pages = json.pages?.set?.map((page) => ({
          ...page,
          duration: page.duration || 0,
        })) || [
          {
            background: "white",
            bleed: 0,
            children: [],
            duration: 5000,
            height: "auto",
            id: nanoid(10),
            width: "auto",
          },
        ];
        json.fonts = []; // need to change eventually to fonts.set...

        return {
          store: json, // need to clean object
          name: "",
        };
      } else {
        return {
          store: null,
          name: "",
        };
      }
    }
    const variables = {
      where: { id: Number(id) },
    };

    if (user) {
      variables.email = user.email;
    }

    if (brand) {
      variables.brandWhere = { id: brand.id };
    }

    const { data, loading, error } = await client.query({
      query: getDesignQuery,
      variables,
    });

    return {
      store: {
        ...data.design,
        pages: data?.design?.pages?.map((page) => ({
          ...page,
          duration: page.duration || 0,
        })),
      },
      name: data.design.name,
      public: data.design.public,
      categories: data.design.categories,
      tags: data.design.tags,
      creator: data.design.creator,
      preview: data.design.preview,
    };
  } catch (e) {
    throw e;
  }
}

export async function getBrandedDesignById({ id, user, brand, additional }) {
  try {
    if (id === "local") {
      const json = await localforage.getItem("polotno-state");

      if (json) {
        json.pages = json.pages?.set?.map((page) => ({
          ...page,
          duration: page.duration || 0,
        })) || [
          {
            background: "white",
            bleed: 0,
            children: [],
            duration: 5000,
            height: "auto",
            id: nanoid(10),
            width: "auto",
          },
        ];
        json.fonts = []; // need to change eventually to fonts.set...

        return {
          store: json, // need to clean object
          name: "",
        };
      } else {
        return {
          store: null,
          name: "",
        };
      }
    }
    const variables = {
      where: { id: Number(id) },
    };

    if (additional) {
      variables.additional = additional;
    }

    if (user) {
      variables.email = user.email;
    }

    if (brand) {
      variables.brandWhere = { id: brand.id };
    }

    const { data, loading, error } = await client.query({
      query: getBrandedDesignQuery,
      variables,
    });

    return {
      store: {
        ...data.brandedDesign,
        pages: data?.brandedDesign?.pages?.map((page) => ({
          ...page,
          duration: page.duration || 0,
        })),
      },
      name: data.brandedDesign.name,
      public: data.brandedDesign.public,
      categories: data.brandedDesign.categories,
      tags: data.brandedDesign.tags,
      creator: data.brandedDesign.creator,
      preview: data.brandedDesign.preview,
    };
  } catch (e) {
    throw e;
  }
}

// export async function useDesign(id) {
//   const { data, loading, error } = useQuery(getDesignQuery, {
//     variables: { where: { id: Number(id) } },
//     skip: id === 'local',
//   });

//   let designData = {};

//   if (id === 'local') {
//     const json = await localforage.getItem("polotno-state");
//     designData = {
//       store: json,
//       name: "",
//     };
//   } else if (data) {
//     designData = {
//       store: {
//         ...data.design,
//         pages: data?.design?.pages?.map((page) => ({
//           ...page,
//           id: page.polotnoId,
//         })),
//       },
//       name: data.design.name,
//       public: data.design.public,
//       categories: data.design.categories,
//       creator: data.design.creator,
//       preview: data.design.preview,
//     };
//   }

//   return { designData, loading, error };
// }

export async function getUserSubscription({ accessToken }) {
  const req = await fetch(API + "/user/subscription", {
    method: "GET",
    headers: {
      Authorization: accessToken,
    },
  });
  return req.json();
}

export async function cancelUserSubscription({ accessToken, id }) {
  const req = await fetch(API + "/user/cancel-subscription", {
    method: "POST",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return req.json();
}

// {
//   "data": {
//     "name": "First",
//     "width": 1080,
//     "height": 1080,
//     "user": {
//       "create": {
//         "name": "Pinny Gluck",
//         "email": "pinny@brandaringroup.com"
//       }
//     },
//     "preview": "",
//     "polotnoId": null,
//     "pages": {
//       "create": {
//         "polotnoId": "WIw0uPslYy",
//         "children": {
//           "set": [
//             {

//             }
//           ]
//         },
//         "width": "auto",
//         "height": "auto",
//         "background": "rgba(245,234,187,1)",
//         "bleed": 0
//       }
//     },
//     "fonts": {
//       "set": []
//     },
//     "category": {
//       "create": {
//         "name": "General"
//       }
//     }
//   }
// }

export async function createDesign({
  store,
  preview,
  id,
  public: _public,
  categories,
  tags,
  name = "",
  creator,
  doCreate,
}) {
  if (!doCreate && (!id || id === "local")) {
    localforage.setItem("polotno-state", store);

    return {
      id: "local",
      status: "saved",
    };
  }

  try {
    // Map Polotno store state to GraphQL DesignCreateInput while respecting already-shaped inputs
    const {
      width,
      height,
      fonts,
      pages,
      unit,
      dpi,
      polotnoId,
      schemaVersion, // ignored
      audios, // ignored
      availableForBrands,
    } = store || {};

    const normalizePages = () => {
      if (pages?.set && Array.isArray(pages.set)) return { set: pages.set };
      if (Array.isArray(pages)) return { set: pages };
      return { set: [] };
    };

    const normalizeFonts = () => {
      if (fonts?.set && Array.isArray(fonts.set)) return { set: fonts.set };
      if (Array.isArray(fonts)) return { set: fonts };
      return { set: [] };
    };

    const normalizeTags = () => {
      if (tags?.set && Array.isArray(tags.set)) return tags; // already shaped
      if (Array.isArray(tags)) return { set: tags };
      return undefined;
    };

    const createData = {
      width,
      height,
      name: name || "",
      preview,
      public: _public,
      unit: unit || "px",
      dpi: dpi || 72,
      polotnoId,
      fonts: normalizeFonts(),
      pages: normalizePages(),
      tags: normalizeTags(),
      categories, // expect caller to supply connect/create structure
      creator, // expect { connect: { email }} from caller
      availableForBrands,
    };

    Object.keys(createData).forEach(
      (k) => createData[k] === undefined && delete createData[k]
    );

    const { data, loading, error } = await client.mutate({
      mutation: createOneDesignMutation,
      variables: { data: createData },
      refetchQueries: [{ query: getDesignsQuery }],
    });
    return {
      id: data?.createOneDesign?.id,
      status: !error ? "saved" : "error",
      error,
    };
  } catch (e) {
    return { status: "error", error: e.message };
  }
}

export async function saveDesign({
  store,
  preview,
  categories,
  tags,
  public: _public,
  id,
  name = "",
  creator,
  polotnoId,
}) {
  if (id === "local") {
    localforage.setItem("polotno-state", store);

    return {
      id: "local",
      status: "saved",
    };
  }

  try {
    const {
      width,
      height,
      fonts,
      pages,
      unit,
      dpi,
      schemaVersion, // ignored
      audios, // ignored
      polotnoId,
    } = store || {};

    const wrapUpdate = (val) => {
      if (
        val &&
        typeof val === "object" &&
        ("set" in val || "connect" in val || "push" in val)
      )
        return val;
      return { set: val };
    };

    const normalizePages = () => {
      if (pages?.set && Array.isArray(pages.set)) return { set: pages.set };
      if (Array.isArray(pages)) return { set: pages };
      return { set: [] };
    };
    const normalizeFonts = () => {
      if (fonts?.set && Array.isArray(fonts.set)) return { set: fonts.set };
      if (Array.isArray(fonts)) return { set: fonts };
      return { set: [] };
    };
    const normalizeTags = () => {
      if (tags?.set && Array.isArray(tags.set)) return tags;
      if (Array.isArray(tags)) return { set: tags };
      return { set: [] };
    };
    const normalizeCategories = () => {
      if (categories?.set || categories?.connect || categories?.create)
        return categories;
      if (Array.isArray(categories))
        return { set: categories.map((c) => ({ id: c.id })) };
      return undefined;
    };

    const updateData = {
      width: wrapUpdate(width),
      height: wrapUpdate(height),
      name: wrapUpdate(name),
      preview: wrapUpdate(preview),
      public: wrapUpdate(!!_public),
      unit: wrapUpdate(unit),
      dpi: wrapUpdate(dpi),
      polotnoId: wrapUpdate(polotnoId),
      fonts: normalizeFonts(),
      pages: normalizePages(),
      tags: normalizeTags(),
      categories: normalizeCategories(),
      creator: creator, // expect already-shaped nested update
    };

    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    const { data, loading, error } = await client.mutate({
      mutation: updateOneDesignMutation,
      variables: { data: updateData, where: { id } },
      refetchQueries: ["designs"],
    });
    return {
      id: data?.updateOneDesign?.id,
      status: !error ? "saved" : "error",
      error,
    };
  } catch (e) {
    return { status: "error", error: e.message };
  }
}

export function useDesigns({ where, orderBy, take, skip, cursor, user }) {
  const { data, loading, error, refetch } = useQuery(getDesignsQuery, {
    variables: { where, orderBy, take, skip, cursor, email: user.email },
  });

  const [deleteOneDesign] = useMutation(deleteOneDesignMutation);

  const deleteDesign = async (id) => {
    try {
      return await deleteOneDesign({
        variables: {
          where: {
            id,
          },
        },
        refetchQueries: ["designs"],
      });
    } catch (e) {
      console.log("Failed to delete design", e);
      throw e;
    }
  };

  return [
    data?.designs || [],
    data?.designsCount,
    loading,
    error,
    refetch,
    deleteDesign,
  ];
}

export function useBrandedDesigns({
  where,
  orderBy,
  take,
  skip,
  cursor,
  user,
  brand,
}) {
  const variables = { where, orderBy, take, skip, cursor };

  if (user?.email) {
    variables.email = user.email;
  }

  if (brand?.id) {
    variables.brandWhere = { id: brand.id };
  }

  const { data, loading, error, refetch } = useQuery(getBrandedDesignsQuery, {
    variables,
  });

  return [
    data?.brandedDesigns || [],
    data?.designsCount,
    loading,
    error,
    refetch,
  ];
}

export function useBrandedDesign({ where, user, brand }) {
  const variables = { where };

  if (user?.email) {
    variables.email = user.email;
  }

  if (brand?.id) {
    variables.brandWhere = { id: brand.id };
  }

  const { data, loading, error, refetch } = useQuery(getBrandedDesignQuery, {
    variables,
  });

  return [data?.brandedDesign || [], loading, error, refetch];
}

export function useCategories({ where, orderBy, take, skip, cursor } = {}) {
  const { data, loading, error } = useQuery(getCategoriesQuery, {
    variables: { where, orderBy, take, skip, cursor },
  });

  const [createOneCategory] = useMutation(createOneCategoryMutation);
  const [deleteOneCategory] = useMutation(deleteOneCategoryMutation);

  const addCategory = async (input) => {
    try {
      return await createOneCategory({
        skip: !input?.creator?.connect?.id,
        variables: {
          data: input,
        },
        update: (proxy, { data: { createOneCategory } }) => {
          const data = proxy.readQuery({
            query: getCategoriesQuery,
            variables: {
              where,
              orderBy,
              take,
              skip,
              cursor,
            },
          });

          if (data && createOneCategory) {
            proxy.writeQuery({
              query: getCategoriesQuery,
              variables: {
                where,
                orderBy,
                take,
                skip,
                cursor,
              },
              data: {
                categories: [createOneCategory, ...data.categories],
              },
            });
          }
        },
      });
    } catch (e) {
      console.log("Failed to add category", e);
      throw e;
    }
  };

  const deleteCategory = async (id) => {
    return deleteOneCategory({
      variables: {
        where: { id },
      },
      update: (proxy, { data: { deleteCategory } }) => {
        const data = proxy.readQuery({
          query: getCategoriesQuery,
          variables: {
            where,
            orderBy,
            take,
            skip,
            cursor,
          },
        });

        if (data && createOneCategory) {
          proxy.writeQuery({
            query: getCategoriesQuery,
            variables: {
              where,
              orderBy,
              take,
              skip,
              cursor,
            },
            data: {
              categories: data.categories.filter((c) => c.id !== id),
            },
          });
        }
      },
    });
  };

  return [data?.categories || [], loading, error, addCategory, deleteCategory];
}

export function useUpdateCategory() {
  const [updateOneCategory, { loading }] = useMutation(
    updateOneCategoryMutation
  );

  const updateCategory = async (id, input) => {
    return updateOneCategory({
      variables: {
        data: input,
        where: { id },
      },
      update: (proxy, { data: { updateOneCategory } }) => {
        proxy.writeFragment({
          data: updateOneCategory,
          fragment: categoryFragment,
          fragmentName: "Category",
          id: proxy.identify(updateOneCategory),
        });
      },
    });
  };

  return [updateCategory, loading];
}

export async function getUser(email) {
  return client
    .query({
      query: getUserQuery,
      variables: { where: { email } },
    })
    .then((res) => res.data.user);
}

export function useTemplates() {
  const { data, loading, error } = useQuery(getTemplatesQuery);

  return [data?.templates || [], loading, error];
}

export function useBrands({ where } = {}) {
  const { data, loading, error } = useQuery(getBrands, {
    variables: { where },
  });

  return [data?.brands || [], loading, error];
}

export function useForms({ where, orderBy, take, skip, cursor } = {}) {
  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQuery(getFormsQuery, {
    variables: { where, orderBy, take, skip, cursor },
  });

  const [createOneForm, { loading: createLoading, error: createError }] =
    useMutation(createOneFormMutation);
  const [deleteOneForm, { loading: deleteLoading, error: deleteError }] =
    useMutation(deleteOneFormMutation);
  const [updateOneForm, { loading: updateLoading, error: updateError }] =
    useMutation(updateOneFormMutation);

  const addForm = async (input) => {
    try {
      return await createOneForm({
        variables: { data: input },
        update: (proxy, { data: { createOneForm } }) => {
          const data = proxy.readQuery({
            query: getFormsQuery,
            variables: { where, orderBy, take, skip, cursor },
          });

          if (data && createOneForm) {
            proxy.writeQuery({
              query: getFormsQuery,
              variables: { where, orderBy, take, skip, cursor },
              data: {
                forms: [createOneForm, ...data.forms],
              },
            });
          }
        },
      });
    } catch (e) {
      throw e;
    }
  };

  const deleteForm = async (id) => {
    try {
      return await deleteOneForm({
        variables: { where: { id } },
        update: (proxy, { data: { deleteForm } }) => {
          const data = proxy.readQuery({
            query: getFormsQuery,
            variables: { where, orderBy, take, skip, cursor },
          });

          if (data) {
            proxy.writeQuery({
              query: getFormsQuery,
              variables: { where, orderBy, take, skip, cursor },
              data: {
                forms: data.forms.filter((form) => form.id !== id),
              },
            });
          }
        },
      });
    } catch (e) {
      throw e;
    }
  };

  const updateForm = async (id, input) => {
    try {
      return await updateOneForm({
        variables: { data: input, where: { id } },
        update: (proxy, { data: { updateOneForm } }) => {
          const data = proxy.readQuery({
            query: getFormsQuery,
            variables: { where, orderBy, take, skip, cursor },
          });

          if (data && updateOneForm) {
            proxy.writeQuery({
              query: getFormsQuery,
              variables: { where, orderBy, take, skip, cursor },
              data: {
                forms: data.forms.map((form) =>
                  form.id === id ? updateOneForm : form
                ),
              },
            });
          }
        },
      });
    } catch (e) {
      throw e;
    }
  };

  // Combine errors from query and mutations
  const combinedError = queryError || createError || deleteError || updateError;

  return [
    data?.forms || [],
    queryLoading || createLoading || deleteLoading || updateLoading,
    combinedError,
    addForm,
    updateForm,
    deleteForm,
  ];
}
