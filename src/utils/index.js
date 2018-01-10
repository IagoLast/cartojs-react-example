const COLORS = ['#fcde9c', '#faa476', '#f0746e', '#e34f6f', '#dc3977', '#b9257a', '#7c1d6f'];

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


export default { buildStyle };
