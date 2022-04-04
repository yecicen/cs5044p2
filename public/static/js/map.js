import * as d3 from "https://cdn.skypack.dev/d3@7";
import * as topojson from 'https://cdn.skypack.dev/topojson-client';
const width = 900;
const height = 600;
// this part of the code is altered from https://www.youtube.com/watch?v=urfyp-r255A
const svg = d3.select('#container').append('svg')
    .attr('height', height)
    .attr('width', width)
    .attr("id", "map_svg")
    .style('background-color', 'lightblue')

    const projection = d3.geoMercator().scale(140)
    .translate([width / 2, height / 1.4]);
const path = d3.geoPath(projection);

const g = svg.append('g');

d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(data => {
        const countries = topojson.feature(data, data.objects.countries);
        g.selectAll('path').data(countries.features).enter().append('path').attr('class', 'country').attr('d', path);

    });