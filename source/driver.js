import {mapValues} from 'lodash'
import {combineObject} from './utils'

let driver = (adapter, extras) => {
  // Make sure rootresolvers get an empty parent value and
  // are provided the rootresolvers itself
  let rootresolvers = mapValues(adapter, value => {
    return (params, fields) => value.resolve(params, fields, undefined, rootresolvers)
  })

  // Return a function to execute queries
  let executeQuery = query => {
    // Retrieve every field in the query
    return combineObject(query, ({params, fields}, key) => {
      // Make sure we have a resolver for it
      if (!rootresolvers[key]) {
        let types = Object.keys(rootresolvers).join(', ')
        throw new Error(`Calling for type ${key} while only having types [${types}]!`)
      }
      // And then resolve it
      return rootresolvers[key](params, fields)
    })
  }

  return Object.assign(executeQuery, { extras })
}

export default driver
