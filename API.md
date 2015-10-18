## API

### `<Provider firebase />`

<!--- Yessss, took this from react-redux too 😂 --->

Makes the firebase ref available to the connect() calls in the component hierarchy below. Normally, you can’t use connect() without wrapping the root component in <Provider>.

If you really need to, you can manually pass firebase as a prop to every connect()ed component, but we only recommend to do this for stubbing store in unit tests, or in non-fully-React codebases. Normally, you should just use <Provider>.

#### Props
- `store` (*Firebase ref*): The root firebase ref that your app uses
- `children` (ReactElement) The root of your component hierarchy.



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
