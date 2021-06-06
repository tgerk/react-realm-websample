This is a REdux-like React component.  (You can tell from the actions and reducer files.)
The scheme is a mashup of useReducer and useContext.
The "service" is access to data persistence provided by MongoDB Realm.

** Using
As a "module", the service exports a React context provider component and a custom react-hook ```useRealm```
From any component within the context provider, the useRealm hook acquires ```[state, api]``` from the context.
```state``` resembles the Redux store, ```api``` is a proxy for Realm-hosted service and manages updates to ```state```

The flow looks like this:
user action -> raises DOM event -> handled by React component -> calls an API method -> sends HTTP request
  ... HTTP response received -> dispatches an action -> reducer applies updates state -> triggers re-render of the page

(In cases of acceptable "eventual consistency" dispatch an *optimistic update* ahead of (in parallel with) the HTTP request.
If the HTTP response later indicates a failure, another dispatch needs to re-validate local state.)

```state``` includes:
- count of HTTP requests "in-flight"
- page of restaurant search results, including meta-data
- dictionary of restaurants by id
- comprehensive list of cuisines

```api``` interface:
- auth for internal use:  the Realm context should be within a User context so the Realm credentials can be kept in sync with external authenticator credentials
-- TODO: implement an elevated user-role for content-cops that can flag/remove reviews created by anybody
- getCuisines
- getRestaurants
- getRestaurant
- (create/update/delete)Review
- that's all, it's a pretty simple service

A second custom hook ```useDebouncedEffect``` delays and limits the frequency of effects.
When reactive/responsive page content (e.g. auto-completion or responsive search) relies on expensive operations (i.e. external service calls), the flurry should be limited to a drip.  This is generally termed "debouncing."
Rather than triggering a rush of immediate effects, a slight delay allows replacing the prior effect with the newest parameters.
Some implementations of debouncing will guarantee a minimum rate of effects, but this implementation requires a period of quiescence for the delay to pass and the operation to complete.
In social terms, this debouncer waits until a jabbering user leaves a pause before providing the most up-to-date answer.
(As compensation, the **first** call for the effect is not delayed, but *could* be interrupted.)

** Implementation
In the current revision, the data is accessed through a REST-ful interface provided through "incoming webhooks".  (See implementations in ../../../../realm/Application-1/services/Service-1/incoming_webhooks).
In principle, a "functions" alternate implementation of api is possible using the realm-web package.
The latter provides a richer range of user-authentication; the former run at system level & so require roll-your-own beyond the basic Atlas data-provider setup.

** Thoughts
This pattern seems almost universally useful, except the customization from service to service is pretty significant.
Maybe generalizing with a plugin architecture would be nice?!

