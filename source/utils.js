import {Observable} from 'rx'
import {zipObject} from 'lodash'

// Turn an object with observable values in one observable yielding an object
export let combineObject = (object, fn) => {
  let fields = Object.keys(object)
  if (fields.length === 0) {
    return Observable.just({})
  } else {
    let fields$ = fields.map(key => fn(object[key], key))
    let toObject = (...values) => zipObject(fields, values)
    return Observable.combineLatest(...fields$, toObject)
  }
}

// Don't think a comment about this function would have made sense anyway
export let argumentsToArray = (...values) => values
