// Based on demo.js from the marmelab/EventDrops GitHub repository, MIT license

const data = require('./data.json');

const colors = d3.scale.category10().domain(['sprint_start', 'rank_change', 'sprint_end']);

const humanizeDate = date => {
    const monthNames = [
        'Jan.', 'Feb.', 'March', 'Apr.', 'May', 'June',
        'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',
    ];

    return `
        ${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}
        ${date.getHours()}:${date.getMinutes()}
    `;
};

const FONT_SIZE = 16; // in pixels
const TOOLTIP_WIDTH = 30; // in rem

// we're gonna create a tooltip per drop to prevent from transition issues
const showTooltip = item => {
    d3.select('body').selectAll('.tooltip').remove();

    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0); // hide it by default

    // show the tooltip with a small animation
    tooltip.transition()
        .duration(200)
        .each('start', function start() {
            d3.select(this).style('block');
        })
        .style('opacity', 1);

    const rightOrLeftLimit = FONT_SIZE * TOOLTIP_WIDTH;
    const direction = d3.event.pageX > rightOrLeftLimit ? 'right' : 'left';

    const ARROW_MARGIN = 1.65;
    const ARROW_WIDTH = FONT_SIZE;
    const left = direction === 'right' ?
        d3.event.pageX - rightOrLeftLimit :
        d3.event.pageX - ARROW_MARGIN * FONT_SIZE - ARROW_WIDTH / 2;

    tooltip.html(`
            <div class="commit">
                <div class="content">
                    <h3 class="message">${item.type}</h3>
                    <p>
                        In sprint '${item.sprint_name}' on <span class="date">${humanizeDate(new Date(item.date))}</span>
                    </p>
                </div>
            </div>
        `)
        .classed(direction, true)
        .style({
            left: `${left}px`,
            top: (d3.event.pageY + 16) + 'px',
        });
};

const hideTooltip = () => {
    d3.select('.tooltip').transition()
        .duration(200)
        .each('end', function end() {
            this.remove();
        })
        .style('opacity', 0);
};

const chart = d3.chart.eventDrops()
    .start(new Date(new Date().getTime() - 3600000 * 24 * 365)) // one year ago
    .end(new Date())
    .eventColor(function (d) {
        d3.select(this).classed(d.type, true);
        return colors(d.type);
    })
    .date(d => new Date(d.date))
    .mouseover(showTooltip)
    .mouseout(hideTooltip);

const project_data = Object.keys(data).map(project => ({
    name: project,
    data: data[project],
}));

const element = d3.select('#chart-holder').datum(project_data);

chart(element);

const zoom = element[0][0].zoom;
const svg = element.select("svg");

svg.selectAll('.drop-line').each(function draw(data, i) {
    var drops = d3.select(this);
    drops.selectAll('.sprint_start,.sprint_end').each(function sprintLineDraw(data) {
        var drop = d3.select(this);
        var group = d3.select(this.parentNode.parentNode.parentNode).append('g')
            .classed('sprint_line', true)
            .attr('transform', `translate(${-drop.attr('cx')}, ${i*chart.lineHeight()})`);
        group.append('line').attr('y2', chart.lineHeight()).attr('x2', 0);
    });
});

// Zoom buttons
const center = [zoom.size()[0] / 2, zoom.size()[1] / 2];
zoom.center(center);

d3.selectAll("button[data-zoom-reset]").on("click", function clicked() {
    zoom.scale(1);
    zoom.translate([0, 0]);
    svg.transition().call(zoom.event);
});

d3.selectAll("button[data-zoom]").on("click", function clicked() {
    // Record the coordinates (in data space) of the center (in screen space).
    var center0 = zoom.center(), translate0 = zoom.translate(), coordinates0 = coordinates(center0);
    zoom.scale(zoom.scale() * Math.pow(2, +this.getAttribute("data-zoom")));

    // Translate back to the center.
    var center1 = point(coordinates0);
    zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

    svg.transition().duration(500).call(zoom.event);
});

function coordinates(point) {
    var scale = zoom.scale(), translate = zoom.translate();
    return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
}

function point(coordinates) {
    var scale = zoom.scale(), translate = zoom.translate();
    return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
}
