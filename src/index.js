import React, { Component } from 'react';
import { render } from 'react-dom';
import { Map, TileLayer as Basemap } from 'react-leaflet';
import carto from 'carto.js';
import Layer from './components/Layer';
import Histogram from './components/Histogram';
import airbnb from './data/airbnb';
import utils from './utils/index';
import './index.css';

const CARTO_BASEMAP = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png';

class App extends Component {
  state = {
    center: [40.42, -3.7],
    zoom: 13,
    nativeMap: undefined,
    layerStyle: airbnb.style,
    hidelayers: true
  }

  cartoClient = new carto.Client({ apiKey: 'DEMO_API_KEY', username: 'ramirocartodb' });

  componentDidMount() {
    this.setState({ nativeMap: this.nativeMap });
  }

  renderHistogram = () => (
    <Histogram
      client={this.cartoClient}
      source={airbnb.source}
      nativeMap={this.state.nativeMap}
      onDataChanged={this.onHistogramChanged.bind(this)}
    />
  )

  // The widget returns an histogram, so we update the layer asigning a color to each histogram bin
  onHistogramChanged(data) {
    const newStyle = utils.buildStyle(data);
    this.setState({ layerStyle: newStyle, hidelayers: false })
  }

  render() {
    const { center, nativeMap, zoom } = this.state;

    return (
      <main>
        <Map center={center} zoom={zoom} ref={node => { this.nativeMap = node && node.leafletElement }}>
          <Basemap attribution="" url={CARTO_BASEMAP} />

          <Layer
            source={airbnb.source}
            style={this.state.layerStyle}
            client={this.cartoClient}
            hidden={this.state.hidelayers}
          />
        </Map>

        {nativeMap && this.renderHistogram()}
      </main>
    );
  }


}

render(<App />, document.getElementById('root'));
