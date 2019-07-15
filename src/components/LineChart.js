import React, { Component } from 'react';
import * as d3 from 'd3';
import marginConvention from '../lib/marginConvention';

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.svgReal = React.createRef();
    this.userDataLine = [];
    this.youDrawIt = null;
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
    this.userDataLine = this.transformData();
    const width = 250;
    const height = 250;
    const margin = {
      top: 30,
      right: 20,
      bottom: 50,
      left: 20,
    };
    const svgContainer = d3.select(this.svgReal.current);
    // Get the dom element
    const containerDiv = document.getElementById('line-chart');
    console.log(containerDiv.offsetWidth);

    // Set the initial dimensions of the svg and generate scales
    const { svg, innerWidth, innerHeight } = marginConvention(svgContainer, {
      width: containerDiv.offsetWidth,
      // height: containerDiv.offsetHeight,
      height,
      margin,
      className: 'lineChart',
    });

    // set the ranges
    const x = d3.scaleLinear().range([0, innerWidth]);
    const y = d3.scaleLinear().range([innerHeight, 0]);

    // define the line
    const valueline = d3.line()
      .x(d => x(d.year))
      .y(d => y(d[type]));

    // define the area
    const valueArea = d3.area()
      .x(d => x(d.year))
      .y0(d => y(d[type]))
      .y1(innerHeight);


    /* const svg = d3
      .select(this.svgReal.current)
      .attr('class', 'lineChart')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`); */

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

    // Create the clip container (translate -20px so the main line get displayed correctly)
    this.clipElement = svg.append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', x(startYear))
      .attr('height', innerHeight + 20)
      .attr('transform', 'translate(0, -20)');

    // Attach the clip path to the clip container
    const clipPath = svg.append('g').attr('clip-path', 'url(#clip)');
    // MAIN AREA
    clipPath.append('path')
      .data([mainLine])
      .attr('class', 'area')
      .attr('d', valueArea);
    // MAIN LINE
    clipPath.append('path')
      .data([mainLine])
      .attr('class', 'line')
      .attr('d', valueline);

    // USER LINE
    this.youDrawIt = svg.append('path').attr('class', 'your-line');

    const availableYears = [2015, 2016, 2017, 2018, 2019];
    // Add the X Axis
    svg.append('g')
      .attr('class', 'axis-x-line')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .tickValues(availableYears)
        .tickFormat(d3.format('.4')));

    // Overlay to handle mouse events
    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .call(this.mouseDragLine(x, y, dataXMax, valueline));
  };

  mouseDragLine = (x, y, dataXMax, line) => d3.drag().on('drag', () => {
    const { type, startYear } = this.props;

    const overlay = d3.select('.overlay').node();
    const mousePos = d3.mouse(overlay);
    const year = this.clampFunc(startYear + 1, dataXMax, x.invert(mousePos[0]));
    const newVal = this.clampFunc(0, y.domain()[1], y.invert(mousePos[1]));

    // Conditionals to evaluate which point will be drawed in the chart
    this.userDataLine = this.userDataLine.map((d) => {
      if (Math.abs(d.year - year) < 0.5) return { ...d, [type]: newVal, defined: true };
      return d;
    });
    // Draw the new user line according with the mouse selections
    this.youDrawIt
      .data([this.userDataLine])
      .attr('d', line.defined(d => d.defined));

    // If all the available point were drawed by the user, animate the clip path
    // and show the original line
    if (!this.clipAnimation && d3.mean(this.userDataLine, d => d.defined) === 1) {
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
      <div id="line-chart">
        <svg ref={this.svgReal} />
      </div>
    );
  }
}
export default LineChart;
