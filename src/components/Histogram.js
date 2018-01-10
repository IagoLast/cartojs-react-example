import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
import carto from 'carto.js';
import './Histogram.css';
import { COLORS } from '../utils/index';

class Histogram extends Component {
  static propTypes = {
    client: PropTypes.object,
    source: PropTypes.string,
    nativeMap: PropTypes.object,
    onDataChanged: PropTypes.func,
  }

  state = {
    bins: [],
  }

  constructor(props) {
    super(props);

    const dataset = new carto.source.SQL(props.source)
    const bboxFilter = new carto.filter.BoundingBoxLeaflet(props.nativeMap);

    this.histogramDataview = new carto.dataview.Histogram(dataset, 'price', { bins: 7 });
    this.histogramDataview.addFilter(bboxFilter);
    this.histogramDataview.on('dataChanged', this.onDataChanged);

    props.client.addDataview(this.histogramDataview);
  }

  componentWillUnmount() {
    this.histogramDataview.off('dataChanged');
  }

  onDataChanged = (data) => {
    if (data.bins) {
      data.bins = data.bins.map((bin, i) => {
        bin.color = COLORS[i]; return bin;
      });
    }
    this.setState(data);
    this.props.onDataChanged(data);
  }

  renderBins = () => {
    return this.state.bins.map((bin, index) => {
      const { avg, freq, normalized, color } = bin;

      return (
        <li className="Histogram-bin" key={`${index}-${freq}`}>
          <span className="Histogram-bin--fill" style={{ background: `${color}`, height: `${normalized * 100}%` }} />
          <span className="Histogram-bin--text">{Math.round(avg || 0)} €</span>
        </li>
      );
    });
  }

  render() {
    return (
      <div className="Histogram">
        <ul className="Histogram-bins">
          {this.renderBins()}
        </ul>
      </div>
    );
  }
}

export default Histogram;
