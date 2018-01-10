import { Component } from 'react';
import PropTypes from 'prop-types';
import carto from 'carto.js';

class Layer extends Component {
  static contextTypes = {
    map: PropTypes.object,
  };

  static propTypes = {
    source: PropTypes.string,
    style: PropTypes.string,
    client: PropTypes.object,
    hidden: PropTypes.bool
  }

  constructor(props) {
    super(props);

    const { hidden, source, style } = props;

    const cartoSource = new carto.source.SQL(source);
    const cartoStyle = new carto.style.CartoCSS(style);

    this.layer = new carto.layer.Layer(cartoSource, cartoStyle);
    this.setVisibility(hidden)
  }

  componentDidMount() {
    const { client } = this.props;

    client.addLayer(this.layer);
    client.getLeafletLayer().addTo(this.context.map);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.style !== this.props.style || nextProps.hidden !== this.props.hidden;
  }

  setVisibility = isHidden => {
    isHidden ? this.layer.hide() : this.layer.show();
  }

  render() {
    const { hidden, style } = this.props;
    const layerStyle = this.layer.getStyle();

    layerStyle.setContent(style).then(() => this.setVisibility(hidden));

    return null;
  }
}

export default Layer;
