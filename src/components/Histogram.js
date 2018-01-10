import React from 'react';
import { Component } from 'react';

class Histogram extends Component {

    _listBins(data) {
        if (data && data.bins) {
            return data.bins.map(bin => <li>{bin.freq} - {Math.round(bin.avg)}€</li>);
        }
    }
    render() {
        return (
            <ul className="histogram">
                {this._listBins(this.props.bins)}
            </ul>
        );
    }
}

export default Histogram;
