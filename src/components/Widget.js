import React from 'react';
import { Component } from 'react';

class Widget extends Component {
  componentDidMount() {
    const { client, source, carto, nativeMap } = this.props;
    const dataset = new carto.source.SQL(source)
    const histogramDataview = new carto.dataview.Histogram(dataset, 'price', { bins: 7 });
    client.addDataview(histogramDataview);
    // Link the widget to the native map so data gets updated when the bounds change
    const bboxFilter = new carto.filter.BoundingBoxLeaflet(nativeMap);
    histogramDataview.addFilter(bboxFilter);
    // When the data is changed update the widget state and notify callbacks
    histogramDataview.on('dataChanged', this._onDataChanged.bind(this));
  }

  _onDataChanged(data) {
    this.setState(data);
    this.props.onDataChanged(data);
  }

  render() {
    return (
      <pre className="widget">
        {JSON.stringify(this.state, null, '\t')}
      </pre>
    );
  }
}

export default Widget;
