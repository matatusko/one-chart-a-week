// Define chart sizes
const width = 800;
const height = 600;
const margin = {top: 50, right: 100, bottom: 170, left: 100};
const inner_width = width - margin.left - margin.right;
const inner_height = height - margin.top - margin.bottom;

// Get and create relevant elements
const wrapper = d3.select('.chart');
const svg = wrapper.append('svg')
    .attr('width', width)
    .attr('height', height);

const x_value = episode => episode.title;
const y_value = episode => episode.rating;
const c_value = episode => episode.season;

d3.json('witcher-episodes.json').then(data => {
    const title = data['title'];
    const series_rating = +data['rating']; 
    const episodes = data['episodes']
        .sort((a, b) => b.rating - a.rating);
        
    // Create scales
    const xScale = d3.scaleBand()
        .domain(d3.map(episodes, x_value))
        .range([0, inner_width])
        .padding(0.1);
    const yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([inner_height, 0]);
    const colorScale = d3.scaleOrdinal()
        .domain(d3.extent(episodes, c_value))
        .range(d3.schemePastel2);
        
    // Create Axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Create group element that will hold inner chart
    const chart = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Draw Axis
    chart.append('g')
        .call(yAxis)
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick > line')
            .attr('x2', inner_width)
            .attr('opacity', .1)
        );

    chart.append('g')
        .attr('transform', `translate(0, ${inner_height})`)
        .call(xAxis)
        .call(g => g.selectAll('.tick > line').remove())
        .selectAll('text')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45)');

    // Draw Bars
    chart.append('g')
        .selectAll('rect')
        .data(episodes)
        .join('rect')
            .attr('x', e => xScale(x_value(e)))
            .attr('y', e => yScale(y_value(e)))
            .attr('height', e => yScale(0) - yScale(y_value(e)))
            .attr('width', xScale.bandwidth())
            .attr('fill', e => colorScale(c_value(e)));

    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(
            ${margin.left + inner_width + .15 * margin.right}, 
            ${.3*height})`
        );

    // Legend Symbols
    legend.selectAll('rect')
        .data(colorScale.domain())
        .join('rect')
            .attr('x', 0)
            .attr('y', (_, i) => i * 25)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', d => colorScale(d))

    // Legend Labels
    legend.selectAll('text')
        .data(colorScale.domain())
        .join('text')
            .attr('x', 25)
            .attr('y', (_, i) => i * 25)
            .text(d => `Season ${d}`)
            .style('dominant-baseline', 'text-before-edge')
            .style('font-family', 'monospace');
})