import {Component, PropTypes, Children} from 'react';
import firebaseShape from './firebaseShape'

export default class Provider extends Component {
  static propTypes = {
    firebase: firebaseShape.isRequired,
    children: PropTypes.element.isRequired,
  }

  static childContextTypes = {
    firebase: firebaseShape.isRequired,
  }

  getChildContext() {
    return {firebase: this.firebase};
  }

  constructor(props, context) {
    super(props, context);
    this.firebase = props.firebase;
  }

  render() {
    const {children} = this.props;
    return Children.only(children);
  }
}
