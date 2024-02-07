import localforage from "localforage";

import { loader } from "graphql.macro";
import { client } from "./client";
import { useQuery, useMutation } from "react-apollo";
import { makeId } from "../../tools/id";
import { useAuth0 } from '@auth0/auth0-react';

// query
const getDesignsQuery = loader("./queries/getDesigns.graphql");
const getBrandedDesignsQuery = loader("./queries/getBrandedDesigns.graphql");
const getDesignQuery = loader("./queries/getDesign.graphql");
const getBrandedDesignQuery = loader("./queries/getBrandedDesign.graphql");
const getCategoriesQuery = loader("./queries/getCategories.graphql");
const getUserQuery = loader("./queries/getUser.graphql");
const getTemplatesQuery = loader("./queries/getTemplates.graphql");
const getBrands = loader("./queries/getBrands.graphql");

// mutation
const createOneDesignMutation = loader("./mutations/createOneDesign.graphql");
const updateOneDesignMutation = loader("./mutations/updateOneDesign.graphql");
const deleteOneDesignMutation = loader("./mutations/deleteOneDesign.graphql");
const createOneCategoryMutation = loader(
  "./mutations/createOneCategory.graphql"
);

const API = "https://polotno-studio-api.vercel.app/api";

export async function getDesignById({ id, user, brand }) {
  console.log(id);
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
          id: makeId(10),
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

  // console.log(data, loading, error);

  // const req = await fetch(`${API}/designs/get?id=${id}`, {
  //   headers: {
  //     Authorization: authToken,
  //     'Content-Type': 'application/json',
  //   },
  // });
  // if (!req.ok) {
  //   throw new Error('Design not found');
  // }
  // // const json = await req.json();
  // console.log("=============");
  // console.log("=============");
  // console.log(data);
  // console.log("=============");
  // console.log("=============");
  return {
    // why are things in store?
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
  authToken,
  name = "",
  creator,
  doCreate,
}) {
  if (!doCreate && (!id || id === "local" || !authToken)) {
    localforage.setItem("polotno-state", store);

    return {
      id: "local",
      status: "saved",
    };
  }

  try {
    const { data, loading, error } = await client.mutate({
      mutation: createOneDesignMutation,
      variables: {
        data: {
          ...store,
          preview,
          name,
          public: _public,
          categories,
          tags,
          creator,
        },
      },
      refetchQueries: ["designs"],
    });
    return { id: data?.createOneDesign?.id, status: !error ? "saved" : "error", error };
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
  authToken,
  name = "",
  creator,
  polotnoId,
}) {
  if (id === "local" || !authToken) {
    localforage.setItem("polotno-state", store);

    return {
      id: "local",
      status: "saved",
    };
  }

  try {
    const { data, loading, error } = await client.mutate({
      mutation: updateOneDesignMutation,
      variables: {
        data: {
          ...store,
          preview,
          name,
          public: { set: !!_public },
          categories,
          tags,
          creator,
        },
        where: { id },
      },
      refetchQueries: ["designs"],
    });
    return { id: data?.createOneDesign?.id, status: !error ? "saved" : "error", error };
  } catch (e) {
    return { status: "error", error: e.message };
  }
}

// export async function deleteDesign({ id, authToken }) {
//   const req = await fetch(`${API}/designs/delete`, {
//     method: "POST",
//     headers: {
//       Authorization: authToken,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ id }),
//   });
//   return await req.json();
// }

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

export function useBrandedDesigns({ where, orderBy, take, skip, cursor, user, brand }) {
  const variables = {where, orderBy, take, skip, cursor}

  if (user?.email) {
    variables.email = user.email
  }

  if (brand?.id) {
    variables.brandWhere = {id: brand.id}
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
  const variables = {where}

  if (user?.email) {
    variables.email = user.email
  }

  if (brand?.id) {
    variables.brandWhere = {id: brand.id}
  }

  const { data, loading, error, refetch } = useQuery(getBrandedDesignQuery, {
    variables,
  });

  return [
    data?.brandedDesign || [],
    loading,
    error,
    refetch,
  ];
}

export function useCategories({ where, orderBy, take, skip, cursor }) {
  const { data, loading, error } = useQuery(getCategoriesQuery, {
    variables: { where, orderBy, take, skip, cursor },
  });

  const [addSingleCategory] = useMutation(createOneCategoryMutation);

  const addCategory = async (input) => {
    try {
      return await addSingleCategory({
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
                categories: [...data.categories, createOneCategory],
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

  return [data?.categories || [], loading, error, addCategory];
}

export function useUser() {
  const { isAuthenticated, user, isLoading, auth0error } = useAuth0();
  const { data, loading, error } = useQuery(getUserQuery, {
    skip: !user?.email?.length,
    variables: {
      where: {
        email: isAuthenticated ? user?.email : null,
      },
    },
  });

  return [isAuthenticated, data?.user, isLoading || loading, auth0error || error];
}

export function useTemplates() {
  const { data, loading, error } = useQuery(getTemplatesQuery);

  return [data?.templates || [], loading, error];
}

export function useBrands({ where }) {
  const { data, loading, error } = useQuery(getBrands, {
    variables: { where }
  });

  return [data?.brands || [], loading, error];
}
