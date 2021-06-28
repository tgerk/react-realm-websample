# I'm gonna replace the REST-like webhooks with a graphql interface: queries, mutations, subscriptions

Assume Apollo-client is the best-fit.  Will encapsulate the Apollo context provider as was done for User and Realm contexts.  Apollo-client implements its own results cache, making the Realm reducer redundant??

user access token should be available to Apollo Client from Realm context state

Derive custom hooks from the Apollo useQuery and useMutation hooks.  (why not?!)

The realm service will survive, but the portion of API that uses webhooks will be deprecated.

User authentication is out-of-band.  There is a separate REST endpoint(s) for acquiring access & refresh tokens from enabled authentication provider(s).  This vestigial part of the Realm service survives.

Apollo client needs to react to change in access key, as Realm needs to react to change in user.  Changing user requires a new client with a clear cache.

(Ignoring error handling unknown user, bad password, expired token, etc. events, for now.)
