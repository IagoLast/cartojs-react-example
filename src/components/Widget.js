import React from 'react';
import { Component } from 'react';

class Widget extends Component {
  componentDidMount() {
    const { client, source, carto, nativeMap, onDataChanged } = this.props;
    const dataset = new carto.source.SQL(source)
    const histogramDataview = new carto.dataview.Histogram(dataset, 'price', { bins: 7 });
    client.addDataview(histogramDataview);
    // Reload widget on map move
    const bboxFilter = new carto.filter.BoundingBoxLeaflet(nativeMap);
    histogramDataview.addFilter(bboxFilter);

    // When the data is changed render the histogram
    histogramDataview.on('dataChanged', data => {
      console.warn(data);
      this.setState(data);
      onDataChanged(data);
    });
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
