import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { API, TOKEN } from "../config";

const httpLink = new HttpLink({
  uri: API,
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => {
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${TOKEN}`,
      },
    };
  });

  return forward(operation);
});

const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    console.log(operation?.operationName, response);
    return response;
  });
});

const onErrorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    var finalMsg = "";
    var count = 1;

    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path, extensions }) => {
        var graphqlMsg = `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`;
        console.log("gql error response: ", graphqlMsg);

        finalMsg += count + ": " + graphqlMsg;
        count++;
      });
    }

    if (networkError) {
      console.log("networkError: ", networkError);
      return;
    }

    if (finalMsg && finalMsg.length > 0) {
      console.log("finalMsg: ", finalMsg);
    }

    console.log("Operation Failed: ", operation);
  }
);

const link = ApolloLink.from([authLink, afterwareLink, onErrorLink, httpLink]);

const cache = new InMemoryCache({
  typePolicies: {
    Design: {
      fields: {
        categories: {
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
});

export const client = new ApolloClient({
  link,
  connectToDevTools: true,
  cache,
});
