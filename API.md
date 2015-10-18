## API

<!---
For the ones that like flow/haskell/whatever type signatures, I'll have a try:
```
type Endothermic = (rootref: Firebase) =>
  (mapPropsToPaths: Object | Function) =>
    (component: React.Component) => Component
```
--->

### `endothermic(firebase_ref)`

Returns decorator that uses `firebase_ref` as base ref, i.e. it will use `firebase_ref.child(path)` to get child nodes. Libraries like react-redux use a `<Provider />` component for that. I should do that too, I think, but I just didn't dig deep enough into it yet.

#### Arguments

- `firebase_ref` (*Object*) Firebase ref instance to use as root

#### Returns

Decorator as described below (connect) 😉


### `connect(mapPropsToPaths)`

Connect a component to firebase database. It does so by getting the keys in the object returned by `mapPropsToPaths` object, and adding listeners to those keys on firebase. The objects returned by `mapPropsToPaths` don't have to be the same shape, it can all vary based on the props passed into it.

It will take care of binding to new paths, unbinding from old, etc. It will also set a prop `endothermicLoaded`, which is set to false until all listeners have fired at least once. This way you can show something different until all data is available.

Nesting multiple `connect` decorators is possible, so you can use the props set by the wrapping `connect`, and it won't try to run until `endothermicLoaded` is true. See the nested example.

#### Arguments

- `mapPropsToPaths(props): paths` (*Object or Function*) A function that takes the original props passed to the object, and returns a object containing `key: path` pairs. When an object is given, it will always use that as paths object.


#### Returns

A function that takes a component and wraps it. Mostly I do this with es7 decorator syntax (available in babel)
```javascript
@connect({
  ...
})
class MyComponent extends React.Component {
  ...
}
```

## Examples

All examples assume you've set up a `./firebase.js` as described in the quick start.

### Get some variables from firebase
```javascript
import React from 'react'
import firebase, {connect} from './firebase.js'

@connect({
  user: 'users/jake',
  active: 'active/jake',
})
class MyComponent extends React.Component {
  render() {
    let {user, active, endothermicLoaded} = this.props

    if (!endothermicLoaded) {
      return <p>Loading...</p>
    }

    let toggleActive = () =>
      firebase.child('active/jake').set(!active)

    return (
      <p>
        Hello {user.name}, your score is {user.score}.
        You are
        <p onClick={toggleActive}>
          {active ? 'active' : 'inactive'}!
        </p>
      </p>
    )
  }
}
```

### Nested

Many times, the path you want to query relies on some other value in the database. Well, you can do that too!

```javascript
import React from 'react'
import firebase, {connect} from './firebase.js'

@connect({
  topUser: 'awards/topUser'
})
@connect(props => {
  user: `users/${props.topUser}`,
  active: `active/${props.topUser}`,
})
class MyComponent extends React.Component {
  render() {
    let {user, active, endothermicLoaded} = this.props

    if (!endothermicLoaded) {
      return <p>Loading...</p>
    }

    return (
      <p>
        {user.name} is the top user, her score is {user.score}.
        She is currently {active ? 'active' : 'inactive'}!
      </p>
    )
  }
}
```
