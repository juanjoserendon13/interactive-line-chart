import React, { Component } from 'react';
import * as d3 from 'd3';

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.svgReal = React.createRef();
    this.userLine = [];
    this.yourDataSel = null;
    this.clipElement = null;
    this.clipAnimation = false;
  }

  componentDidMount() {
    this.createLineChart();
  }

  createLineChart = () => {
    const {
      data, type, idLine, startYear,
    } = this.props;
    // Get the data from the year where the user will start drawing
    this.userLine = this.transformData();

    const margin = {
      top: 20,
      right: 20,
      bottom: 40,
      left: 20,
    };
    const width = 250 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // set the ranges
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // define the line
    const valueline = d3.line()
      .x(d => x(d.year))
      .y(d => y(d[type]));

    // define the area
    const valueArea = d3.area()
      .x(d => x(d.year))
      .y0(d => y(d[type]))
      .y1(height);

    // select the svg in the dom and give it some margins
    const svg = d3
      .select(this.svgReal.current)
      .attr('class', 'lineChart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get the max and min values of the databases
    const dataYMax = d3.max(data, d => d[type]);
    const dataYMin = d3.min(data, d => d[type]);

    const dataXMax = d3.max(data, d => d.year);

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

    // Create the clip container
    this.clipElement = svg.append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', x(startYear))
      .attr('height', height);

    // Attach the clip path to the clip container
    const correctSel = svg.append('g').attr('clip-path', 'url(#clip)');
    // MAIN AREA
    correctSel.append('path')
      .data([mainLine])
      .attr('class', 'area')
      .attr('d', valueArea);
    // MAIN LINE
    correctSel.append('path')
      .data([mainLine])
      .attr('class', 'line')
      .attr('d', valueline);

    // USER LINE
    this.yourDataSel = svg.append('path').attr('class', 'your-line');

    const availableYears = [2015, 2016, 2017, 2018, 2019];
    // Add the X Axis
    svg.append('g')
      .attr('class', 'axis-x-line')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickValues(availableYears)
        .tickFormat(d3.format('.4')));

    // Overlay to handle mouse events
    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .call(this.mouseDragLine(x, y, dataXMax, valueline));
  };

  mouseDragLine = (x, y, dataXMax, line) => d3.drag().on('drag', () => {
    const { type, startYear } = this.props;

    const overlay = d3.select('.overlay').node();
    const mousePos = d3.mouse(overlay);
    const year = this.clampFunc(startYear + 1, dataXMax, x.invert(mousePos[0]));
    const newVal = this.clampFunc(0, y.domain()[1], y.invert(mousePos[1]));

    // Conditionals to evaluate which point will be drawed in the chart
    this.userLine = this.userLine.map((d) => {
      console.log(d.year, year);
      if (Math.abs(d.year - year) < 0.5) return { ...d, [type]: newVal, defined: true };
      return d;
    });
    // Draw the new user line according with the mouse selections
    this.yourDataSel
      .data([this.userLine])
      .attr('d', line.defined(d => d.defined));

    // If all the available point were drawed by the user, animate the clip path
    // and show the original line
    if (!this.clipAnimation && d3.mean(this.userLine, d => d.defined) === 1) {
      this.clipAnimation = true;
      this.clipElement.transition().duration(1000).attr('width', x(dataXMax));
    }
  });

  /**
   * Return the corresponding year value according with the thresholds
   */
  clampFunc = (a, b, c) => Math.max(a, Math.min(b, c));

  /**
   * Add a property to each data element
   * if the element is the starting point of the user line, set it to true
   */
  transformData = () => {
    const { data, startYear } = this.props;
    return data
      .map((d) => {
        if (d.year === startYear) {
          return { ...d, defined: true };
        }
        return { ...d, defined: 0 };
      })
      .filter(d => d.year >= startYear);
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
