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

Now, recommended at the top component of you app, you wrap it in a `<Provider />` tag

```javascript
import Firebase from 'firebase'
import {Provider} from 'endothermic'
import React from 'react'

import MyComponent from './MyComponent'

let FIREBASE_URL = '...'
let firebase = new Firebase(FIREBASE_URL)

export default class App extends React.Component {
  render() {
    return (
      <Provider firebase={firebase} />
        <MyComponent />
      </Provider>
    )
  }
}
```

Now, in the files with the component you want to connect to firebase, you can do

```javascript
import React from 'react'
import {connect} from 'endothermic'

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

- ~~Provider like syntax~~ In version 2!
- React-redux like second argument with side effects
- Support for more advanced firebase queries
