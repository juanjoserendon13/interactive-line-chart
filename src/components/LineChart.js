import React, { Component } from 'react';
import * as d3 from 'd3';

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.svgReal = React.createRef();
  }

  componentDidMount() {
    this.createLineChart();
  }

  createLineChart = () => {
    const {
      data, type, idLine,
    } = this.props;
    const margin = {
      top: 20, right: 20, bottom: 40, left: 50,
    };
    const width = 250 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // set the ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // define the line
    const valueline = d3.line()
      .x(d => x(d.year))
      .y(d => y(d[type]));

    // select the svg in the dom and give it some margins
    const svg = d3.select(this.svgReal.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform',
        `translate(${margin.left},${margin.top})`);

    // Get the max and min values of the databases
    const dataYMax = d3.max(data, d => d[type]);
    const dataYMin = d3.min(data, d => d[type]);

    // Scale the range of the data depending on the max and min values found it.
    x.domain(d3.extent(data, d => d.year));
    y.domain([0, dataYMax]);

    // Get Main line,
    let mainLine;
    if (idLine) {
      mainLine = data.filter((element) => {
        if (element[type]) {
          return element.id === idLine;
        }
        return null;
      });
    }

    // MAIN LINE
    // Add the valueline path.
    svg.append('path')
      .data([mainLine])
      .attr('class', 'main-line')
      .attr('d', valueline);

    const availableYears = [2015, 2016, 2017, 2018, 2019];
    // Add the X Axis
    svg.append('g')
      .attr('class', 'axis-x-line')
      .attr('transform', `translate(0,${height + 15})`)
      .call(d3.axisBottom(x)
        .tickValues(availableYears)
        .tickFormat(d3.format('.4')));
  }

  render() {
    return (
      <div className="line-chart">
        <svg ref={this.svgReal} />
      </div>
    );
  }
}
export default LineChart;
