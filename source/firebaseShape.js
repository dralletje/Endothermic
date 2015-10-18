import {PropTypes} from 'react';

export default PropTypes.shape({
  child: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  off: PropTypes.func.isRequired,
});
