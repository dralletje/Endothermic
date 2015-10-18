# Endothermic!

A small util to bind react components to firebase listeners, because reactfire is too imperative for me 😜

## Features
- Declarative decorator syntax
- Automatic binding/unbinding
- Support for nesting

## Quick Start

```
$ npm install --save endothermic
```

I recommend making a extra file that initializes endothermic with your firebase root and exports the ref and the decorator (e.g. `./firebase.js`)

```javascript
import Firebase from 'firebase'
import endothermic from 'endothermic'

let FIREBASE_URL = '...'
let baseref = new Firebase(FIREBASE_URL)

export default baseref
export let connect = endothermic(baseref)
```

Now, in the files with the component you want to connect to firebase, you can do

```javascript
import React from 'react'
import firebase, {connect} from './firebase.js'

@connect({
  name: 'users/jake/fullname'
})
class MyComponent extends React.Component {
  render() {
    let {name} = this.props
    return <p>Hello {name}</p>
  }
}
```

## Api and examples
See [API](API.md)

## Yet to come

- Provider like syntax
- React-redux like second argument with side effects
- Support for more advanced firebase queries
