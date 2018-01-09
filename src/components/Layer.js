import { Component } from 'react';
import PropTypes from 'prop-types';
import carto from 'carto.js';

// This component wraps CARTO.js methods, for now this is
// just a proof of concept, but in the future it would be nice
// to have our own components library like leaflet does

class Layer extends Component {
  static contextTypes = {
    map: PropTypes.object, // Leaflet map
  };

  componentDidMount() {
    const props = this.props;

    // Craete source, styles and layer with the given props
    const source = new carto.source.SQL(props.source);
    const style = new carto.style.CartoCSS(props.style);
    this.layer = new carto.layer.Layer(source, style);

    // Add them to the client and to the map
    props.client.addLayer(this.layer);
    props.client.getLeafletLayer().addTo(this.props.map);
  }


  // ... missing methods to handle styles/source updates


  render() {
    if (this.layer) {
      const newStyle = new carto.style.CartoCSS(this.props.style);
      this.layer.setStyle(newStyle);
    }

    return null; // No need to render anything :)
  }
}

export default Layer;
