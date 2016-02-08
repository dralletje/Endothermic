import driverShape from './driverShape'
import {observeProps} from 'rx-recompose'
import {compose, getContext} from 'recompose'

export default query => {
  return compose(
    // Get the driver from context
    getContext({
      endothermicDriver: driverShape,
    })
  ,
    // Use that driver to run a query based on the props
    // And merge the result with the props
    observeProps(props$ =>
      props$
      .flatMapLatest(({endothermicDriver, ...props}) =>
        endothermicDriver(query(props))
        .map(endoProps => {
          return {
            ...endothermicDriver.extras,
            ...props,
            ...endoProps,
          }
        })
      )
    )
  )
}
