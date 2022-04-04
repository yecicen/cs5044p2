// import {Swatches} from "@d3/color-legend"
import * as d3 from "https://cdn.skypack.dev/d3@7";
import * as topojson from 'https://cdn.skypack.dev/topojson-client';
// data = [8, 18, 7, 10, 19, 20, 10, 10, 6, 19, 17, 18, 23, 23, 13, 12, 15, 6, 9, 8];
// links = d3.csvParse(await FileAttachment("suits.csv").text())
const width = 900;
const height = 600;


function draw() {

    const svg = d3.select('#container').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('id', "map_svg")
    .style('position', 'absolute')
    .style('background-color', 'lightblue')

    const projection = d3.geoMercator().scale(140)
    .translate([width / 2, height / 1.4]);
const path = d3.geoPath(projection);

const g = svg.append('g');

d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(data => {
        const countries = topojson.feature(data, data.objects.countries);
        g.selectAll('path').data(countries.features).enter().append('path')
            .attr('class', 'country')
            .attr('d', path)
            .attr('id', d=>d.properties.name)
        let countriesElement = document.getElementsByClassName('country');
        // console.log(countriesElement[0].id)
        // for(const c of countriesElement){
        //     console.log(c);
        //     // console.log(c.getBoundingClientRect().bottom)
        // }

        d3.csv('./data/Unicorn_Companies.csv').then(unicorn_data => {
            unicorn_data = unicorn_data.filter(d => d.Valuation > 3000)
            let countries = unicorn_data.map(d => d.Country);
    
            countries = [...new Set(countries)]
            let nodes = [];
            let matchedCountries = [];
            for(let i = 0; i < countries.length; i++){
                for(let j = 0; j < countriesElement.length; j++){
                    if(countriesElement[j].id ===countries[i]){
                        let top  = countriesElement[j].getBoundingClientRect().top;
                        let right  = countriesElement[j].getBoundingClientRect().right;
                        let bottom  = countriesElement[j].getBoundingClientRect().bottom;
                        let left  = countriesElement[j].getBoundingClientRect().left;

                        let x = left+(right-left)*0.8;
                        let y = top+(bottom-top)*0.2;
                        let tempObject = {
                            id:countries[i],
                            x: x,
                            y:y
                        }
                        nodes.push(tempObject);
                        matchedCountries.push(countries[i])
                    }
                }
            }

            // let nodes = countries.map(elem => (
            //     {
            //         id: elem,
            //     }
            // ));
            let investors = unicorn_data.map(x => x['SelectInverstors']);
            investors = investors.map(d => d.split(','));
            investors = [].concat(...investors);
            investors = investors.map(d => d.trim());
    
            investors = [...new Set(investors)]
            let connectedCountries = [];
            for (const investor of investors) {
                let tempData = unicorn_data.filter(c => c.SelectInverstors.includes(investor))
                let tempCountries = tempData.map(c => c['Country'])
                tempCountries = tempCountries.filter(c => matchedCountries.includes(c))
                // let tempCountries = nodes.map(c => c['id'])
                tempCountries = [...new Set(tempCountries)]
                if (tempCountries.length > 1) {
                    for (let i = 0; i < tempCountries.length - 1; i++) {
    
                        var linkObject = {
                            "source": tempCountries[i],
                            "target": tempCountries[i + 1],
                            "type": investor,
                        }
                        connectedCountries.push(linkObject)
                    }
                }
    
            }
            // console.log(connectedCountries);
        const types = Array.from(new Set(connectedCountries.map(d => d.type)))
        // let color = d3.scaleOrdinal(types, d3.schemeCategory10)

        let colorObject = 
        [
            "Artificial intelligence",
            "Cybersecurity",
            "Hardware",
        
            "Internet software & services",
            "Mobile & telecommunications",
            "Health",
            "Data management & analytics",
        
            "Consumer & retail",
            "E-commerce & direct-to-consumer",
            "Travel",
        
            "Supply chain, logistics, & delivery",
            "Auto & transportation",
        
            "Fintech",
            "Edtech",
            "Other"
        ]
        let colorIndustry = [
            "#5A88B8",
            "#5A88B8",
            "#5A88B8",
            "#FFAB00",
            "#FFAB00",
            "#FFAB00",
            "#FFAB00",
            "#E96463",
            "#E96463",
            "#E96463",
            "#7CC4CC",
            "#7CC4CC",
            "#24B086",
            "#C3BD0C",
            "#C67194",
        ]
        let color = d3.scaleOrdinal(colorObject, colorIndustry)
            // connectedCountries = connectedCountries.map(c => c.City);
            // console.log(connectedCountries);
    
            // connectedCountries = connectedCountries.filter(x => x.type == "IQ Capital")
            // const links = data.links.map(d => Object.create(d));
            const links = connectedCountries.map(d => Object.create(d));
            // console.log(links);
            nodes = nodes.map(d => Object.create(d));
    
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-400))
                .force("x", d3.forceX())
                .force("y", d3.forceY());
    
            const svg = d3
                .select('#container')
                .append('svg')
                .attr('width', width/2)
                .attr('height', height/2)
                .attr('id', "network_svg")
                .style('position', 'absolute')
                // .style('top',height/2)
                // .style('left',width/2)
                
                // .style('transform', 'translate('+width/2+','+height/1.4+')')
                .attr("viewBox", [-width / 2, -height / 2, width, height])
                .style("font", "12px sans-serif");
    

            svg.append("defs").selectAll("marker")
                .data(types)
                .join("marker")
                .attr("id", d => `arrow-${d}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -0.5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("fill", color)
                .attr("d", "M0,-5L10,0L0,5");
    
            const link = svg.append("g")
                .attr("fill", "none")
                .attr("stroke-width", 1.5)
                .selectAll("path")
                .data(links)
                .join("path")
                .attr("stroke", d => color(d.type))
                .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);
    
            const node = svg.append("g")
                .attr("fill", "currentColor")
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                // .attr('cx', d=> d.x)
                // .attr('cy', d=> d.y)
                .selectAll("g")
                .data(nodes)
                .join("g")
            // .call(drag(simulation));
    
            node.append("circle")
                .attr("stroke", "white")
                .attr("stroke-width", 1.5)
                .attr("r", 4);
    
            node.append("text")
                .attr("x", 8)
                .attr("y", "0.31em")
                .text(d => d.id)
                .clone(true).lower()
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-width", 3)
    
            node.attr("transform", d => `translate(${d.x},${d.y})`)
    
            // console.log(nodes);
            // for (let i = 0; i < 2; i++) {
            //     svg
            //       .append('circle')
            //       .attr('cx', nodes[i].x)
            //       .attr('cy', nodes[i].y)
            //       .attr('r', 10)
            //     //   .attr("transform", `translate(-20%, -20%)`)
            //     //   .translate([width / 2, height / 1.4])
            //       .style('fill', 'red')
            //       .style('z-index',1)
            //   }
            
            //   const newlink = d3.linkHorizontal()({
            //     source: [nodes[0].x, nodes[0].y],
            //     target: [nodes[1].x, nodes[1].y]
            //   });
            
              // Append the link to the svg element
            //   svg
            //     .append('path')
            //     .attr('d', newlink)
            //     .attr('stroke', 'black')
            //     .attr('fill', 'none');

            simulation.on("tick", () => {
                link.attr("d", linkArc);
                node.attr("transform", d => `translate(${d.x},${d.y})`);
            });
    
            // invalidation.then(() => simulation.stop());
    
            return svg.node();
        });
    });



}

function linkArc(d) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
}

let drag = simulation => {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

draw();