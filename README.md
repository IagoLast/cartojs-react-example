# Using CARTO.js with React

The beta version of CARTO.js has been released at the end of last year and, as part of our testing program, we have created several proofs of concept with different frameworks like [React](https://reactjs.org)  or [Angular](https://angular.io/).

This proof of concept is a map showing prices of AirBNB rentals per night in the city of Madrid. Using CARTO.js, we divide the apartments into seven categories according to their price, assigning one color per category. In addition, we create a dynamic histogram that indicates how many apartments belong to each category in the area of the map we are looking at.

Through this simple example we touch on the basic concepts of CARTO.js and we can see how to integrate it with different frameworks.

## Basics of CARTO.js

CARTO.js is designed to work together with the CARTO platform in order to unlock the full potential of your geospatial data through a simple javascript API. Of course, the first step is to [create a CARTO account](https://carto.com/signup/) and upload the data we want to process. Once you have a created account your `username` and an `API key` is all you need to get started!

### Client

The `carto.Client` is the entry point to CARTO.js. It handles the communication between your app and your CARTO account and it contains the model of our application. In this model two types of objects can exist: **layers** and **dataviews**. Remember that these objects are useless by themselves and they must be added to a client in order to be interactive.

```javascript
// Example of how a client is created
const client = new carto.Client({
  apiKey: '{API Key}',
  username: '{username}'
});
```

### Dataviews

Dataviews are objects used to extract data from a CARTO account in predefined ways (eg: count how many rentals are available, get the average price for an area, ...)

This data is considered `raw` since its form is simply a JSON object from which you can show the data in the way you want. If you want to display this data on a map, you should use a **layer**.

To create a dataview you just need to indicate the [carto.Source](https://carto.com/documentation/cartojs/docs/#cartosourcebase) and the [operation](https://carto.com/documentation/cartojs/docs/#cartooperation). 

```Javascript
// Given the AirBNB dataset get the value of the most expensive rental
const maxRentalPriceDataview = new carto.dataview.Formula(airbnbSource, 'price', {
 operation: carto.operation.MAX,
});
```

Once created and [added to a client](https://carto.com/documentation/cartojs/docs/#cartoclientadddataview), this object will [fire events](https://carto.com/documentation/cartojs/docs/#cartodataviewbase) containing the requested data.

```javascript
// Add the dataview to the client
await client.addDataview(maxRentalPriceDataview);
// Wait for the server to give the data
maxRentalPriceDataview.on('dataChanged', newData => { 
	console.log(`The highest AirBNB rental in madrid costs: ${newData}€`);
});
```



### Layers

Layers are object used to extract data from a CARTO account and represent them on a map.

As in dataviews, they need a [carto.Source](https://carto.com/documentation/cartojs/docs/#cartosourcebase) that indicates where to extract the data. They also need a [carto.Style](https://carto.com/documentation/cartojs/docs/#cartostylebase) that contains the information about how the data should be displayed.

```Javascript
const rentalsLayer = new carto.layer.Layer(airbnbSource, airbnbStyle);
```

### Display carto.Layers in a map

When layers are created they should be [added to a client](https://carto.com/documentation/cartojs/docs/#cartoclientaddlayer) in order to be displayed in a map.

Calling [client.getLeafletLayer](https://carto.com/documentation/cartojs/docs/#cartoclientgetleafletlayer) you can get a native `leaflet` object grouping all carto.layers contained in the client.  You just need to add this object to your map to view the data! You can do the same with `Google Maps` in case you want to use CARTO.js with it as well.

```javascript
// Display the cartoLayers in a leafletMap
const cartoLeafletLayer = client.getLeafletLayer();
cartoLeafletLayer.addTo(leafletMap);
```

This object will remain linked to the client. This means that any changes in the client layers will be immediately reflected in the map. (eg:  you [hide a layer](https://carto.com/documentation/cartojs/docs/#cartolayerlayerhide), or you [change the layer style](https://carto.com/documentation/cartojs/docs/#cartostylecartocsssetcontent), …)



## How to integrate CARTO.js in REACT

You can get the code used throughout this example at [cartojs-react-example repository](https://github.com/IagoLast/cartojs-react-example)

We used [create-react-app](https://github.com/facebookincubator/create-react-app) to scaffold the basics of the application.

Our project structure looks like this:

``` 
src/
├── components
│   ├── Histogram.css
│   ├── Histogram.js
│   └── Layer.js
├── data
│   └── airbnb.js
├── index.js
└── utils
    └── index.js
```

- index.js: the entry point of our application.
- components/Histogram: a widget showing how many rentals are in each one of our price categories.
- components/Layer: a component used to display rentals in a map.
- data/airbnb.js: contains the **source** and default **style** for the AirBNB dataset.
- utils/index.js contains a function that creates custom [cartoCSS](https://carto.com/docs/carto-engine/cartocss/).



### Index.js

This is the entry point of the application. It contains the main [component](https://reactjs.org/docs/react-component.html) of our application which is initialized with a `state` and a `cartoclient` as follows:

```javascript
// We track map's center and zoom and the layer style and visibility
state = {
  center: [40.42, -3.7],
  zoom: 13,
  nativeMap: undefined,
  layerStyle: airbnb.style,
  hidelayers: true
}
// Manages the comunication against the server and will keep a list of all layers and dataviews
cartoClient = new carto.Client({ apiKey: '{api_key}', username: '{username}' });
```



 The main component contains a layer and a histogram and its JSX will look similar to this:

```html
<!-- WARNING: Only for learning purposes don't copy & paste -->
<main>
  <Map 
  	center={center}
    zoom={zoom}
    ref={node => { this.nativeMap = node && node.leafletElement }}>
    <Basemap 
      attribution=""
      url={CARTO_BASEMAP} />
    <Layer
    	source={airbnb.source}
		style={this.state.layerStyle}
		client={this.cartoClient}
		hidden={this.state.hidelayers}/>
  </Map>
  <Histogram
	client={this.cartoClient}
	source={airbnb.source}
	nativeMap={this.state.nativeMap}
	onDataChanged={this.onHistogramChanged.bind(this)}/>
</main>
```

The `Map` and the `Basemap` are created using  components  provided by the [react-leaflet library](https://react-leaflet.js.org/) while the CARTO layer and the histogram are built ad-hoc for this project.

Notice the parameters passed to our custom components:

**Layer**

  - source: string with a SQL query pointing to the geospatial data.
  - style: a CartoCSS string with information about how the data should be displayed.
  - Client: a carto.Client instance.
  - Hidden: a boolean attribute controlling the layer´s visibility.


**Histogram**

  - Client: a carto.Client instance.
  - source: string with a SQL query pointing to the geospatial data.
  - nativeMap: the leaflet-map element.
  - onDataChanged: a callback function that will be executed when the dataview fetches new data.

### Layer Component

A layer component receives the properties listed above. 

In the [component constructor](https://reactjs.org/docs/react-component.html#constructor) we use those properties to create the [carto.source.SQL](https://carto.com/documentation/cartojs/docs/#cartosourcesql) and [carto.style.CartoCSS](https://carto.com/documentation/cartojs/docs/#cartostylecartocss) required in order to create a [carto.layer.Layer](https://carto.com/documentation/cartojs/docs/#cartolayerlayer).

We finally add our brand new layer to the client.

```javascript
constructor(props) {
    super(props);

    const { client, hidden, source, style } = props;

    const cartoSource = new carto.source.SQL(source);
    const cartoStyle = new carto.style.CartoCSS(style);

    this.layer = new carto.layer.Layer(cartoSource, cartoStyle);

    client.addLayer(this.layer);
  }
```

According to the [React lifecycle](https://reactjs.org/docs/react-component.html#the-component-lifecycle) we must wait until the component [has been mounted](https://reactjs.org/docs/react-component.html#componentdidmount) before trying to add a leafletLayer to the leaflet map. Once the component has been mounted we know `this.context` will reference the native leaflet map so we can get a leaflet-layer from the client and add it to our map.

```javascript
componentDidMount() {
  const { client } = this.props;
  client.getLeafletLayer().addTo(this.context.map);
}
```

This allows us to view a map as the following:

![](https://carto.com/blog/img/posts/2018/2018-01-12-cartojs-and-react/1.8fc1345c.png)

### Histogram Widget

We want to create a histogram displaying the price per night for the rentals in the map.

As you probably know, we are going to create a React component wrapping a [histogram dataview](https://carto.com/documentation/cartojs/docs/#cartodataviewhistogram) so you can see how easy is to get geospatial data from the CARTO server.

As in the Layer component, all the initialization is done in the constructor. To create the histogram we only need a [carto.source.SQL](https://carto.com/documentation/cartojs/docs/#cartosourcesql) pointing to the rentals data, the column name and the number of bins.

Since building the histogram requires server interaction, all the process will be asynchronous and we need to register a function callback that will be executed when the data is available. 

Finally, remember to add the widget to the client. Otherwise nothing will happen!

```Javascript
constructor(props) {
    super(props);
  	const { source, client } = props;
    // Create a cartoSource from the given source string 
  	const dataset = new carto.source.SQL(source)
    // Create a 7 bins histogram on the price column
    this.histogramDataview = new carto.dataview.Histogram(dataset, 'price', { bins: 7 });
    // Wait for the server to return data
  	this.histogramDataview.on('dataChanged', this.onDataChanged);
	// Register the dataview into the client 
    client.addDataview(this.histogramDataview);
  }
```

The simplest `onDataChanged` callback could be one that just updates the React internal state:

```javascript
onDataChanged = (data) => {
  this.setState(data);
}
```

This will cause [render](https://reactjs.org/docs/react-component.html#render) to be called with the new state.

```jsx
render() {
	return <ul> {this.state.bins.map(bin  => <li> {bin.avg} € - {bin.freq} </li>)} </ul>;
}
```

A simple render function like this will show a unordered list with the average price for every [bin](https://carto.com/documentation/cartojs/docs/#cartodataviewbinitem) and how many rentals are in this bin.

![App with map and widget](https://carto.com/blog/img/posts/2018/2018-01-12-cartojs-and-react/2.9b6fd62c.png)

With some CSS & HTML we can improve this visualization even more:


![App with map and styled widgets](https://carto.com/blog/img/posts/2018/2018-01-12-cartojs-and-react/3.8c3cb775.png)

Once we get this… Won't it be great to have a different color in the layer points according to its histogram bin?

### Updating layer style

Once we get the histogram data, we want to update the layer and apply new styles to create a greater visualization. The first step will be updating our callback and notify the parent element about the new data arrival.

```javascript
// Histogram.js
onDataChanged = (data) => {
  this.setState(data);
  // Call callback function with the new data
  this.props.onDataChanged(data);
}
```

On the parent element (index.js) we will process this data, generating a new style that should be applied to the layer.

```javascript
// index.js
onHistogramChanged(data) {
  const newStyle = utils.buildStyle(data);
  this.setState({ layerStyle: newStyle, hidelayers: false })
}
```

To generate the style we use a utility function that generates a CartoCSS from [histogram data](https://carto.com/documentation/cartojs/docs/#cartodataviewhistogramdata) 

```javascript
export const COLORS = ['#fcde9c', '#faa476', '#f0746e', '#e34f6f', '#dc3977', '#b9257a', '#7c1d6f'];

export function buildStyle(data) {
    const rules = data.bins.map((bin, index) => _createRule(bin, COLORS[index])).join('');

    return `
        #layer {
            marker-width: 10;
            marker-fill-opacity: 0.7;
            marker-allow-overlap: false;
            marker-line-width: 0;
            marker-comp-op: multiply;
            ${rules}
        }
    `;
}

function _createRule(bin, color) {
    return `
            [price >= ${bin.start}] {
                marker-fill: ${color};
            }
        `;

}

export default { buildStyle, COLORS };

```

We won't explain this in detail since is not very relevant but the core concept here is that `buildStyle` transforms [histogram data](https://carto.com/documentation/cartojs/docs/#cartodataviewhistogramdata) into a [CartoCSS](https://carto.com/docs/carto-engine/cartocss/) like the following:

```
#layer {
	marker-width: 10;
	marker-fill-opacity: 0.7;
	marker-allow-overlap: false;
	marker-line-width: 0;
	marker-comp-op: multiply;
	
	if (price >= 0 ) {
      marker-fill: green;
	}
	
	if (price > 50) {
      marker-fill: orange;
	}
	
    if (price > 100) {
      marker-fill: red;
	}
}
```

This new CartoCSS is asigned to the `layerStyle` variable in the main app component state triggering a new `render` .

This style is passed to the layer as a property. 

```jsx
<Layer
  source={airbnb.source}
  style={this.state.layerStyle} // <---- 
  client={this.cartoClient}
  hidden={this.state.hidelayers}
/>
```

So the layer must be aware of this changes. This is done using the [shouldComponentUpdate](https://reactjs.org/docs/react-component.html#shouldcomponentupdate) function, checking if the style has changed. 

```javascript
shouldComponentUpdate(nextProps) {
	return nextProps.style !== this.props.style;
}
```

So in our render function we only need to update the layer style with the new CartoCSS pased as a property. We can simply use the [.setContent](https://carto.com/documentation/cartojs/docs/#cartostylecartocsssetcontent) function to achieve this.

```javascript
render() {
    const { style } = this.props;
    const layerStyle = this.layer.getStyle();

    layerStyle.setContent(style);

    return null;
  }
```

Since our client connects everything, the map will be updated on its own:

![App with map styles updated](https://carto.com/blog/img/posts/2018/2018-01-12-cartojs-and-react/3.8c3cb775.png)

### Listening to map position

As a final step, we want our histogram to reflect the exact data we are seeing in the map.

In order to achieve this we need to filter our dataview to consider only data belonging to our current map area.

Luckily for us CARTO.js provides this exact functionality through what is known as [filters](https://carto.com/documentation/cartojs/docs/#cartofilterbase). For this case we want to use a [cartoFilterBoundingBox](https://carto.com/documentation/cartojs/docs/#cartofilterboundingboxleaflet) in the Histogram constructor just adding 2 lines: one for creating the filter and another one to add the filter to the widget.

```javascript
constructor(props) {
    super(props);

    const dataset = new carto.source.SQL(props.source)
    this.histogramDataview = new carto.dataview.Histogram(dataset, 'price', { bins: 7 });
    // Create a bboxFilter attached to the native leaflet map
    const bboxFilter = new carto.filter.BoundingBoxLeaflet(props.nativeMap);
	// Add the filter to the histogram
    this.histogramDataview.addFilter(bboxFilter);
  
    this.histogramDataview.on('dataChanged', this.onDataChanged);
    props.client.addDataview(this.histogramDataview);
  }
```



And that's all! Now when we change the map position, the histogram widget will fire a `dataChanged` event with new data belonging  to the visible portion of the map.


![App reacts to mouse movement](https://carto.com/blog/img/posts/2018/2018-01-12-cartojs-and-react/final.20fd83c0.gif)
