// Import React and ReactDOM
import React, { Component } from 'react';
import { render } from 'react-dom';

// Import react-leaflet for the map / basemap components
import { Map, TileLayer as Basemap } from 'react-leaflet';

// Import CARTO.js v4 <3
import carto from 'carto.js';

// Import our custom Layer component (it uses carto.js methods internally)
import Layer from './components/Layer';
import Widget from './components/Widget';

// Import the dataset we want to use
import airbnb from './data/airbnb';

import utils from './utils/index';

// Some basic styles
import './index.css';

// Voyager basemap <3
const CARTO_BASEMAP = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png';

class App extends Component {
  // Add some initial state for the center and the zoom
  state = {
    center: [40.42, -3.7],
    zoom: 13,
    nativeMap: undefined,
    layerStyle: airbnb.style,
    hidelayers: true
  }

  constructor(props) {
    super(props);
    // Setup the client in the contructor with our user and apiKey
    this.cartoClient = new carto.Client({ apiKey: 'DEMO_API_KEY', username: 'ramirocartodb' });
  }

  componentDidMount() {
    this.setState({ nativeMap: this.nativeMap });
  }

  _renderWidget() {
    if (this.state.nativeMap) {
      return (
        <Widget
          carto={carto}
          client={this.cartoClient}
          source={airbnb.source}
          nativeMap={this.state.nativeMap}
          onDataChanged={this._onWidgetDataChanged.bind(this)}
        />)
    }
  }

  // The widget returns an histogram, so we update the layer asigning a color to each histogram bin
  _onWidgetDataChanged(data) {
    const COLORS = ['#fcde9c', '#faa476', '#f0746e', '#e34f6f', '#dc3977', '#b9257a', '#7c1d6f'];
    const newStyle = utils.buildStyle(data, COLORS);
    this.setState({ layerStyle: newStyle, hidelayers: false })
  }



  render() {
    const { center, zoom } = this.state;
    return (
      <main>
        {/* Create a Map component, with our center, zoom */}
        <Map center={center} zoom={zoom} ref={node => { this.nativeMap = node && node.leafletElement }}>

          {/* Inside the Map component we add the basemap, in this case Voyager */}
          <Basemap attribution="" url={CARTO_BASEMAP} />


          {/* Now can just add as many layers as we want with the Layer component */}
          {/* which takes a source (sql or dataset name), styles (cartoCSS) and the client (our user/apiKey) */}
          <Layer
            source={airbnb.source}
            style={this.state.layerStyle}
            client={this.cartoClient}
            map={this.nativeMap}
            hidden={this.state.hidelayers}
          />
        </Map>

        {this._renderWidget()}
      </main>
    );
  }


}

render(<App />, document.getElementById('root'));
