export function buildStyle(data, colors) {
    let rules = data.bins.map((bin, i) => _createRule(bin, colors[i])).join('');
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


export default { buildStyle };