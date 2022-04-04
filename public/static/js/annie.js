import * as d3 from "https://cdn.skypack.dev/d3@7";

let unicorns = "./data/Unicorn_Companies.csv";

let width = 950;
let height = 600;
let circleBaseColour = "#2C384E";
let circleStrokeColour = "#fff";
let circleWomanColour = "#ee6c4d";

let margin = {
    top: 10,
    right: 40,
    bottom: 50,
    left: 20
};

let x_scale;
let r_scale;
let filteredData = null;

let industryColor = {
    "Artificial intelligence": "#5A88B8",
    "Cybersecurity": "#5A88B8",
    "Hardware": "#5A88B8",

    "Internet software & services": "#FFAB00",
    "Mobile & telecommunications": "#FFAB00",
    "Health": "#FFAB00",
    "Data management & analytics": "#FFAB00",

    "Consumer & retail": "#E96463",
    "E-commerce & direct-to-consumer": "#E96463",
    "Travel": "#E96463",

    "Supply chain, logistics, & delivery": "#7CC4CC",
    "Auto & transportation": "#7CC4CC",

    "Fintech": "#24B086",
    "Edtech": "#C3BD0C",
    "Other": "#C67194"
};

d3.csv(unicorns)
    .then(unicorns => {
        initialRadio();
        initialFilters(unicorns);
        initaliseRankingList(unicorns);
        initalTable(unicorns);
    });


function initialRadio() {
    let showRankinglist = d3.select("#rank_r")
        .on("click", showRank)
    let showWorldMap = d3.select("#map_r")
        .on("click", showMap)
}

function showRank() {
    document.getElementById("ranking_div").style.display = "";
    document.getElementById("map_svg").style.display = "none";
    document.getElementById("network_svg").style.display = "none";
}

function showMap() {
    document.getElementById("ranking_div").style.display = "none";
    document.getElementById("map_svg").style.display = "";
    document.getElementById("network_svg").style.display = "";
}

function initialFilters(data) {
    let industry_ = d3.group(data, d => (d.Industry));
    let industry = new Array();
    for (let [key, value] of industry_) {
        industry.push(key);
    }
    industry.push("All");
    industry.sort();

    let country_ = d3.group(data, d => (d.Country));
    let country = new Array();
    for (let [key, value] of country_) {
        country.push(key);
    }
    country.push("All");
    country.sort();

    let selectIndustry = d3.select("#dropDown_industry_div");
    let selectCountry = d3.select("#dropDown_country_div");

    selectIndustry.select("#dropDown_i")
        .selectAll("option")
        .data(industry)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    selectCountry.select("#dropDown_c")
        .selectAll("option")
        .data(country)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    selectIndustry.on('input', function (e, d) { updateData(data); });
    selectCountry.on('input', function (e, d) { updateData(data); });
}

function initaliseRankingList(data) {
    let ranking_SVG = d3.select("body")
        .append("div")
        .attr("id", "ranking_div")
        .style("float", "left")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style('background-color', '#faf9f9')

    // ==================================
    // ===         set Axises         ===
    let extent_totalRaised = d3.extent(data, d => +d.TotalRaised);
    x_scale = d3.scaleSqrt()
        .domain(extent_totalRaised)
        .range([margin.left, width - margin.right]);

    let extent_valuation = d3.extent(data, d => +d.Valuation);
    r_scale = d3.scaleSqrt()
        .domain(extent_valuation)
        .range([5, 20]);

    ranking_SVG.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(x_scale)
            .tickSizeOuter(0)
            .ticks(8)
            .tickFormat(i => `$${d3.format(",.0f")(i)}M`)
        );
    
    ranking_SVG.append("text")
        .text("Total Raised")
        .attr("x", 20)
        .attr("y", 540)
        .attr("fill", circleBaseColour)
        .style('font-weight', 'bold')

    let x_axis = ranking_SVG.select(".x-axis");
    setXAxis(x_axis);

    // ==================================
    // == set circles for companies   ===

    // Force definition
    let force = d3.forceSimulation(data)
        .force('forceX', d3.forceX(d => x_scale(+d.TotalRaised)).strength(10))
        .force('forceY', d3.forceY(height / 2).strength(0.1))
        .force('collide', d3.forceCollide(d => r_scale(+d.Valuation)).strength(1.5))

    let NUM_ITERATIONS = 400;
    for (let i = 0; i < NUM_ITERATIONS; ++i) {
        force.tick();
    };
    force.stop();

    // 1. group for the whole plot                
    let companyG = ranking_SVG.append("g")
        .attr("class", "company-g");
    // 2. circles for each company
    let companyCircles = companyG.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "company-circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => r_scale(d['Valuation']))
        .attr("fill", d => industryColor[d.Industry])
        .attr("opacity", 0.9)
        .style('cursor', 'pointer')
        .attr("stroke-linecap", 'round')
        .on("mouseover", (e, d) => {

        })
        .on("click", (e, d) => {
            return handleClick(e, d)
        })
    
    showLegend();
}

function showLegend() {
    let lengend_detail = [
        { name: 'Technology', property: '#5A88B8' },
        { name: 'Service', property: '#FFAB00' },
        { name: 'Consumption', property: '#E96463' },
        { name: 'Transportation', property: '#7CC4CC' },
        { name: 'Fintech', property: '#24B086' },
        { name: 'Edtech', property: '#C3BD0C'},
        { name: 'Other', property: '#C67194'}
    ]

    let legend_g = d3.select("#ranking_div").select("svg")
        .append("g")
        .attr("class", "legend_g")

    legend_g.selectAll("text")
            .data(lengend_detail)
            .enter()
            .append("text")
            .text(d => d.name)
            .attr("x", 820)
            .attr("y", (d, i) => i * 20 + 410)
            .attr("fill", circleBaseColour)
            .style('font-weight', 'bold')

    legend_g.selectAll("rect")
            .data(lengend_detail)
            .enter()
            .append("rect")
            .attr("x", 805)
            .attr("y", (d, i) => i * 20 + 400)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => d.property)
}

function setXAxis(x_axis) {
    x_axis.selectAll(".tick line")
        .attr("y2", -height + 100)
        .attr("opacity", 0.5)
        .attr("stroke-width", 0.5)
        .attr('stroke-dasharray', '3 1')
        .attr("color", 'grey');

    x_axis.selectAll("text")
        .attr("font-size", '12px')
        .attr("color", circleBaseColour)
        .attr("opacity", 0.8)
        .attr("font-weight", "bold");

    x_axis.select(".domain")
        .attr("stroke-width", 4)
        .attr("stroke", circleBaseColour);
}

function initalTable(data) {
    let table_div = d3.select("#ranking_div").append("div")
        .attr("id", "table_div")
        .style("float", "right")
        .style("overflow", "auto")
        .style("width", "300")
        .style("height", "600");

    let table = table_div.append("table")
        .attr("id", "table_a")
        .attr("align", "center")
        .attr("width", "300");

    let columnNames = ["Company", "Valuation", "TotalRaised"]
    let thread = d3.select("#table_a")
        .append("thead")
        .attr("id", "table_columnsName")

    thread.append("tr")
        .selectAll("th")
        .data(columnNames)
        .enter()
        .append("th")
        .text(d => d)

    let tbody = d3.select("#table_a")
        .append("tbody")
        .attr("id", "table_content")

    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr")
        .attr("class", "data_row")
        .style("background-color", "white")
        .style('cursor', 'pointer')
        .on("click", (e, d) => {
            return handleClick(e, d)
        })

    var cells = rows.selectAll("td")
        .data(function (d) {
            return columnNames.map(function (column) {
                return { column: column, value: d[column] }
            })
        })
        .enter()
        .append("td")
        .attr("class", "data_cell")
        .attr("align", "center")
        // .style("background-color", (d,i) => i % 2 === 0? "white": "grey")
        .text(d => d.value)
}

function handleClick(e, data) {
    let rect_outer_width = 320
    let rect_outer_height = 150

    let companyDetails = [
        { name: 'Location', property: 'City' },
        { name: 'Industry', property: 'Industry' },
        { name: 'Founded Year', property: 'FoundedYear' },
        { name: 'Total Raised', property: 'TotalRaised' },
        { name: 'Valuation', property: 'Valuation'}
    ]

    d3.selectAll('.tooltip_g')
        .remove()

    let tooltip_g = d3.select("#ranking_div").select("svg")
        .append("g")
        .attr("class", "tooltip_g")

    let rect_out = tooltip_g.append("rect")
        .attr("class", "rectO tooltip")
        .attr("width", rect_outer_width)
        .attr("height", rect_outer_height)
        .attr("fill", circleBaseColour)
        .attr("rx", "10")
        .attr("ry", "10")
        .attr("x", width - rect_outer_width)
        .attr("y", 5)
        .style("z-index", "2")

    let rect_inner = tooltip_g.append("rect")
        .attr("class", "rectI tooltip")
        .attr("width", rect_outer_width - 10)
        .attr("height", rect_outer_height - 10)
        .attr("fill", "white")
        .attr("rx", "10")
        .attr("ry", "10")
        .attr("x", width - rect_outer_width + 5)
        .attr("y", 10)
        .style("z-index", "2")

    let boundary = tooltip_g.append("rect")
        .attr("class", "bound tooltip")
        .attr("width", rect_outer_width - 20)
        .attr("height", 3)
        .attr("fill", circleBaseColour)
        .attr("x", width - rect_outer_width + 10)
        .attr("y", 40)
        .style("z-index", "2")

    tooltip_g.selectAll('text')
        .attr("class", "company-details-text")
        .data(companyDetails)
        .join('text')
        .text(d => d.name === "Total Raised" || d.name === "Valuation"
            ? `${d.name}: $ ${data[d.property]} M`
            : `${d.name}: ${data[d.property]}`)
        .attr('x', (width - rect_outer_width + 15))
        .attr('y', (d, i) => i * 20 + 60)
        .style("z-index", 2)
        .style('font-size', '16px')
        .attr('text-anchor', 'left')
        .attr('dy', '0.35em')

    tooltip_g.append('text')
        .text(data.Company)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('x', (width - (rect_outer_width + 5) / 2))
        .attr('y', 25)
        .style('fill', '#1b212c')
        .style('font-size', '20px')
        .style('font-weight', 'bold')

    tooltip_g.append('text')
        .text("=> Explore")
        .attr('x', (width - rect_outer_width / 2 + 40))
        .attr('y', 135)
        .attr("fill", circleBaseColour)
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('cursor', 'pointer')
        .on("click", () => {
            let strArray = data.Company.split(" ")
            window.open(`https://www.${strArray[0]}.com`)
        });
}

function updateData(data) {
    let industry = document.getElementById("dropDown_i").value;
    let country = document.getElementById("dropDown_c").value;

    filteredData = data
        .filter(d => (d.Industry === industry || industry === "All"))
        .filter(d => (d.Country === country || country === "All"))

    console.log(filteredData)

    let selectedCircle = d3.selectAll(".company-circle")
        .data(data)
        .join(
            enter => enter
                .append("circle")
                .attr("class", "company-circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", d => r_scale(d['Valuation'])),
            update => update
                .call(update => update.transition()
                    .duration(500)
                    .attr("fill", d => filteredData.includes(d) ? industryColor[d.Industry] : "#EEEEEE")
                    .attr("opacity", 0.9)
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)),
            exit => exit
                .remove()
        );

    let columnNames = ["Company", "Valuation", "TotalRaised"]

    d3.selectAll(".data_row")
        .remove()

    let tbody = d3.select("#table_content")
    let rows = tbody.selectAll("tr")
        .data(filteredData)
        .enter()
        .append("tr")
        .attr("class", "data_row")
        .style('cursor', 'pointer')
        .on("click", (e, d) => {
            return handleClick(e, d)
        })


    let selectedTable = rows.selectAll(".data_cell")
        .data(function (d) {
            return columnNames.map(function (column) {
                return { column: column, value: d[column] }
            })
        })
        .join(
            enter => enter
                .append("td")
                .attr("class", "data_cell")
                .attr("align", "center")
                .text(d => d.value),
            update => update
                .call(update => update.transition()
                    .duration(500)),
            exit => exit
                .remove()
        )
}