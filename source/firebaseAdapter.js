import {Observable} from 'rx'
import {combineObject, argumentsToArray} from './utils'
import {map} from 'lodash'

const observe = (ref, event) => {
  return Observable.create(observer => {
    // Listen to event
    const unbind =
      ref.on(event, x => observer.onNext(x), err => observer.onError(err))

    // Unbind on dispose
    return () => ref.off(event, unbind)
  })
}
const value$ = (ref) => observe(ref, 'value').map(x => x.val())
const uid$ = (ref) => {
  return Observable.create(observer => {
    const cb = (auth) => {
      if (auth) {
        observer.onNext(auth.uid)
      }
    }
    this.onAuth(cb)
    return () => this.offAuth(cb)
  })
}

let resolveArray = fn => list => {
  if (!list || list.length === 0) {
    return Observable.just([])
  } else {
    return Observable.combineLatest(map(list, fn), argumentsToArray)
  }
}



const firebaseAdapter = (rootref) => {
  // Quick fix for exothermic not supporting firebase paths starting with slashes
  let exoFix = path => path.replace(/^\/+/, '')

  // Just a shortcut for getting an observable from a firebase path
  let getValue = path => value$(rootref.child(exoFix(path)))

  // Core function that resolves scalars and complex fields
  // for a item with an ID in a speficic directory.
  // Needs a lot of arguments because it needs to pass all those
  // to resolvers of subfields :-/
  let takeFromFirebase = (id, fields, subfields = {}, path, resolvers) => {
    return combineObject(fields, (fieldValue, f) => {
      let complexField = subfields[f]

      // Field defined complex, but used as scalar
      if (complexField && (!fieldValue || !fieldValue.fields)) {
        throw new Error(`Field ${f} is defined complex, but used as scalar!`)
      }
      // Field undefined (so scalar for now), but used as complex!
      if (!complexField && Object.keys(fieldValue).length !== 0) {
        throw new Error(`Field ${f} is defined scalar, but used as complex!`)
      }

      if (complexField) {
        // Call the complex fields' resolver function
        return complexField.resolve(fieldValue.params, fieldValue.fields, path, resolvers)
      } else {
        // Either one of the reserved keys, or just get it from firebase
        switch (f) {
        case 'id':
          return Observable.just(id)
        case 'value':
          return getValue(`${path}`)
        default:
          return getValue(`${path}/${f}`)
        }
      }
    })
  }

  return {
    sameKey: {
      as: type => ({
        resolve: (params, fields, parent = '', root) => {
          if (parent === '') {
            throw new Error(`You can't use 'sameKey' as root node.`)
          } else {
            return Observable.just(parent.match(/\/?([^/]+)$/)[1])
              .flatMapLatest(id => root[type]({id}, fields))
          }
        },
      }),
    },

    byKey: field => ({
      as: type => ({
        resolve: (params, fields, parent = '', root) => {
          return getValue(`${parent}/${field}`).flatMapLatest(id => root[type]({id}, fields))
        },
      }),

      /*
      Get just the keys from firebase, and then call the resolver
      for the type of node you want.
      */
      listOf: type => ({
        resolve: (params = {}, fields, parent = '', root) => {
          return getValue(`${parent}/${field}`)
          .flatMapLatest(resolveArray((value, key) =>
            root[type]({id: key}, fields)
          ))
        },
      }),

      /*
      Get values from firebase, filter each to only include the right keys
      and then pass them back.
      */
      list: subfields => ({
        resolve: (params = {}, fields, parent = '', resolvers) => {
          return getValue(`${parent}/${field}`)
          .flatMapLatest(resolveArray((value, id) => {
            let path = `${parent}/${field}/${id}`
             return takeFromFirebase(id, fields, subfields, path, resolvers)
          }))
        },
      }),

      /*
      d
      */
      object: subfields => {
        return {
          resolve: (params = {}, fields, parent = '', resolvers) => {
            if (!params.id) {
              throw new Error(`Param 'id' is required on field '${field}'`)
            }
            let path = `${parent}/${field}/${params.id}`
            return takeFromFirebase(params.id, fields, subfields, path, resolvers)
          },
        }
      },
    }),
  }
}

export default firebaseAdapter
