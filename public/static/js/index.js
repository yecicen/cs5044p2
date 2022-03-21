import * as d3 from "https://cdn.skypack.dev/d3@7";

function draw() {
    const svgWidth = 500;
    const svgHeight = 500;

    let svg = d3.select("svg");
    let width = svg
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    svg
        .style("background-color", "steelblue");

}
draw();