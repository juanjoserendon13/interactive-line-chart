import React, { Component } from 'react';
import * as d3 from 'd3';

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.svgReal = React.createRef();
    this.userLine = [];
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

    // Slice the main line
    const lineSplited = mainLine.slice(0, 2);

    // MAIN LINE
    // Add the valueline path.
    svg.append('path')
      .data([lineSplited])
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

    const focus = svg.append('g')
      .attr('class', 'focus')
      .attr('transform', `translate(${x(2016)},0)`)
      .style('display', 'none');

    focus.append('circle')
      .attr('r', 4.5);

    focus.append('text')
      .attr('x', 9)
      .attr('dy', '.35em');

    // Overlay to handle mouse events
    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width - x(2016))
      .attr('height', height)
      .attr('transform', `translate(${x(2016)},0)`)
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => focus.style('display', 'none'))
      .on('click', () => this.mouseMoveChart());
  }

  mouseMoveChart = (e) => {
    const {
      data,
    } = this.props;
    const overlay = d3.select('.overlay').node();
    const bisectDate = d3.bisector(d => d.year).left;
    console.log(overlay);
    console.log(d3.mouse(overlay));

    // const x0 = x.invert(d3.mouse(e));
    // const i = bisectDate(data, x0, 1);
    // const d0 = data[i - 1];
    // const d1 = data[i];
    // const d = x0 - d0.year > d1.year - x0 ? d1 : d0;
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
