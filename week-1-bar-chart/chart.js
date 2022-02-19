// Define chart sizes
const width = 800;
const height = 600;
const margin = {top: 50, right: 50, bottom: 170, left: 100};
const inner_width = width - margin.left - margin.right;
const inner_height = height - margin.top - margin.bottom;

// Get and create relevant elements
const wrapper = d3.select('.chart');
const svg = wrapper.append('svg')
    .attr('width', width)
    .attr('height', height);


const x_value = d => d['Product/Sector'];
const y_value = d => +d['Value'];
const filter_data = d => {
    return (
        d['Year'] == 2020 && 
        d['Indicator Code'] == 'ITS_MTV_AX' &&
        d['Product/Sector'] != 'Total merchandise'
    );
};

d3.csv('data.csv').then(data => {
    // Filter and sort the data
    data = data.filter(filter_data);
    data = data.sort((a, b) => y_value(b) - y_value(a));

    // Construct scales
    const xScale = d3.scaleBand()
        .domain(d3.map(data, x_value))
        .range([0, inner_width])
        .padding(0.1);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, y_value)])
        .range([inner_height, 0]);
        
    // Construct axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Construct group element that will hold the chart itself
    const chart = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add y-axis to the chart
    chart.append('g')
        .call(yAxis)
        .call(g => g.select('.domain').remove());

    // Add x-axis to the chart
    chart.append('g')
        .attr('transform', `translate(0, ${inner_height})`)
        .call(xAxis)
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick > line').remove())
        .selectAll('text')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45)');

    // Draw bars
    chart.append('g')
        .selectAll('rect')
        .data(data)
        .join('rect')
            .attr('x', d => xScale(x_value(d)))
            .attr('y', d => yScale(y_value(d)))
            .attr('height', d => yScale(0) - yScale(y_value(d)))
            .attr('width', xScale.bandwidth())
            .attr('fill', 'steelblue');

})