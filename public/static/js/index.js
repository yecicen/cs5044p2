import * as d3 from "https://cdn.skypack.dev/d3@7";


fetch('http://localhost:3000/api/data').then(response => response.json())
.then(data => console.log(data));

function draw() {
    const svgWidth = 500;
    const svgHeight = 500;
<<<<<<< HEAD
    getInformation()

=======
    console.log('anlihu');
    console.log('anlihu_2.0 test');
>>>>>>> a131c260d1b3b1b2bc75684a78ebf61e9efb987c
    let svg = d3.select("svg");
    let width = svg
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    svg
        .style("background-color", "steelblue");

}
draw();