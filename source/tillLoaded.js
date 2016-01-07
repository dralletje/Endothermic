/*
HoC that has to be called twice, once with the component
you want to show when it's still loading, and once for
when it is done loading.

This helps you making sure that the `null` or falsy values
actual represent absense, instead of absense of a network ;)
*/

import React from 'react'

const tillLoaded = (Loading = 'div') => Component =>
  ({endothermicLoaded, ...props}) => {
    return (
      endothermicLoaded !== false
      ? <Component {...props} />
      : <Loading {...props} />
    )
  }

export default tillLoaded
