import * as d3 from 'd3';

const marginConvention = (selection, props) => {
  const {
    width, height, margin, className = 'margin-group',
  } = props;
  let svg = selection.attr('class', className)
    .data([null])
    .attr('width', width)
    .attr('height', height);
  svg = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  return { svg, innerWidth, innerHeight };
};
export default marginConvention;
