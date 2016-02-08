import {PropTypes} from 'react';
import driverShape from './driverShape'
import {withContext, compose, setPropTypes} from 'recompose'

export default compose(
  setPropTypes({
    driver: driverShape.isRequired,
    children: PropTypes.node.isRequired,
  })
,
  withContext({
    endothermicDriver: driverShape.isRequired,
  }, props => ({ endothermicDriver: props.driver }))
)(props => props.children)
