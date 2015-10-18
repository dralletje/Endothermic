import React from 'react'
import firebaseShape from './firebaseShape'

/*************/
/*  HELPERS  */
/*************/
// Objects like {key: value, ...} to arrays like [ [key, value], ... ]
const asPairs = object => Object.keys(object).map(key => [key, object[key]])
// Inverse of asPairs
const asObject = pairs => Object.assign({}, ...pairs.map(x => ({ [x[0]]: x[1] }) ))

// Map over the object values { key: value } => fn => { key: fn(value) }
const mapObject = (object, fn) =>
  asObject(asPairs(object).map(
    ([key, value]) => [key, fn(value, key)]
  ))

// Same as map, but doesn't return anything
const objectDiff = (oldObj, newObj) => {
  const changed = key => oldObj[key] !== newObj[key]

  return {
    removed: Object.keys(oldObj).filter(changed),
    added: Object.keys(newObj).filter(changed),
  }
}

// Return a function that, when called, unbinds the event.
// A bit like how observables work <3
const firebaseEvent = (ref, event, fn) => {
  ref.on(event, fn)
  return _ => ref.off(event, fn)
}

const onValue = (ref, fn) =>
  firebaseEvent(ref, 'value', snapshot => fn(snapshot.val()) )

// Just easy for me
const massUnbind = (keys, listeners) => {
  keys.forEach(key => listeners[key]())
}

const ensureCallable = maybeFn =>
  typeof maybeFn === 'function' ? maybeFn : (_ => maybeFn)

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component';

/***************/
/*  COMPONENT  */
/***************/

// Symbols
const initial = Symbol('Initial value')


export default (dataOrFn = {}) => WrappedComponent => {
  const linkFn = ensureCallable(dataOrFn)

  const getPaths = props =>
    props.endothermicLoaded === false
    ? {}
    : linkFn(props)

  return class Endothermic extends React.Component {
    static displayName = `Endothermic(${getDisplayName(WrappedComponent)})`
    static WrappedComponent = WrappedComponent
    static contextTypes = {
      firebase: firebaseShape,
    }
    static propTypes = {
      firebase: firebaseShape,
    }

    constructor(props, context) {
      super(props, context)

      this.firebase = props.firebase || context.firebase;

      this.listen = (path, key) =>
        onValue(this.firebase.child(path), value => {
          this.setState({ [key]: value })
        })

      this.listeners = {}
      this.paths = getPaths(this.props)
      this.state = mapObject(this.paths, _ => initial)
    }

    /**
     * Actually listen to the events
     */
    componentWillMount() {
      this.listeners = mapObject(this.paths, this.listen)
    }

    componentWillReceiveProps(nextProps) {
      const {paths, listeners} = this
      const newPaths = getPaths(nextProps)

      const {removed, added} = objectDiff(paths, newPaths)

      // Unbind all listeners that no longer match
      massUnbind(removed, listeners)

      // Start listening on the new ones
      const newListeners = asObject(
        added.map( key => [key, this.listen(newPaths[key], key)] )
      )

      Object.assign(this, {
        paths: newPaths,
        listeners: Object.assign({}, listeners, newListeners),
      })
      this.setState(mapObject(newListeners, _ => initial))
    }

    /**
     * Unbinds any remaining Firebase listeners.
     */
    componentWillUnmount() {
      massUnbind(Object.keys(this.listeners), this.listeners)
    }

    render() {
      const {endothermicLoaded} = this.props

      const loaded =
        endothermicLoaded !== false &&
        asPairs(this.state || {})
        .every( ([key, value]) => value !== initial)

      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          firebase={this.firebase}
          endothermicLoaded={loaded}
        />
      )
    }
  }
}
