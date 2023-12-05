import localforage from "localforage";

import { loader } from "graphql.macro";
import { client } from "./client";

// query
const getDesigns = loader("./queries/getDesigns.graphql");
const getDesign = loader("./queries/getDesign.graphql");

// mutation
const createOneDesign = loader("./mutations/createOneDesign.graphql");

const API = "https://polotno-studio-api.vercel.app/api";

export async function getDesignById({ id }) {
  console.log(id);
  if (id === "local") {
    // if (true) {

    const json = await localforage.getItem("polotno-state");
    console.log(json);
    return {
      store: json,
      name: "",
    };
  }
  const { data, loading, error } = await client.query({
    query: getDesign,
    variables: { where: { id: Number(id) } },
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
  // const json = await req.json();
  console.log("=============");
  console.log("=============");
  console.log(data);
  console.log("=============");
  console.log("=============");
  return {
    store: {
      ...data.design,
      pages: data?.design?.pages?.map((page) => ({
        ...page,
        id: page.polotnoId,
      })),
    },
    name: data.design.name,
    public: data.design.public,
    category: data.design.category,
  };
}

export async function listDesigns({ accessToken }) {
  try {
    const { data, loading, error } = await client.query({ query: getDesigns });
    return data?.designs || [];
  } catch (e) {
    console.log(e);
  }

  return [];
}

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

export async function saveDesign({ store, preview, id, authToken, name = "" }) {
  if (id === "local" || !authToken) {
    localforage.setItem("polotno-state", store);

    return {
      id: "local",
      status: "saved",
    };
  }

  try {
    const { data, loading, error } = await client.mutate({
      mutation: createOneDesign,
      variables: { data: { ...store, preview, name } },
    });
    return { id: data?.createOneDesign?.id, status: "saved" } || {};
  } catch (e) {
    console.log(e);
  }

  // return await req.json();
}

export async function deleteDesign({ id, authToken }) {
  const req = await fetch(`${API}/designs/delete`, {
    method: "POST",
    headers: {
      Authorization: authToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return await req.json();
}
