import {
    ApolloClient,
    HttpLink,
    InMemoryCache,
    ApolloLink,
  } from "@apollo/client";
  import { onError } from "@apollo/client/link/error";
  
  const httpLink = new HttpLink({
    uri: process.env.API,
  });
  
  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(({headers = {}}) => {
      return {
        headers: {
          ...headers,
          'Authorization': process.env.TOKEN,
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
    ({graphQLErrors, networkError, operation, forward}) => {
      var finalMsg = '';
      var count = 1;
  
      if (graphQLErrors) {
        graphQLErrors.map(({message, locations, path, extensions}) => {
          var graphqlMsg = `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`;
          console.log('gql error response: ', graphqlMsg);
  
          finalMsg += count + ': ' + graphqlMsg;
          count++;
        });
      }
  
      if (networkError) {
        finalMsg =
          'An internet connection is required for the application to work';
        console.log('networkError finalMsg: ', finalMsg);
        return;
      }
  
      if (finalMsg && finalMsg.length > 0) {
        console.log('finalMsg: ', finalMsg);
      }
  
      console.log('Operation Failed: ', operation);
    },
  );
  
  const link = ApolloLink.from([
    afterwareLink,
    onErrorLink,
    authLink,
    httpLink,
  ]);
  
  const cache = new InMemoryCache();
  
  export const client = new ApolloClient({
    link,
    connectToDevTools: true,
    cache,
  });
  