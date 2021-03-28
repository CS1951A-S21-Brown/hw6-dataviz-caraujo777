// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 100, bottom: 70, left: 175 };

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 300;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 300;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;


let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let y_axis_text = svg.append("text")
    .attr("transform", `translate(${-70}, ${(graph_2_height - margin.top - margin.bottom) / 2} )`)        // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle").text("Games");

let title = svg.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${margin.top - 50})`)        // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15).text("Number of Games Between 1920 - 2019");

let x_axis_text = svg.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${graph_2_height - margin.bottom})`)        // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle").text("Year");

let x = d3.scaleTime().range([0, (graph_1_width - margin.left - margin.right)]);
let y = d3.scaleLinear().range([(graph_1_height - margin.top - margin.bottom), 0]);

function setData(color1) {
    d3.csv("../data/football.csv").then(function (data) {
        data = cleanData(data)

        var line = d3.line()
            .x(function (d) { return x(d.key); })
            .y(function (d) { return y(d.value); });

        x.domain(d3.extent(data, function (d) { return d.key; }));
        y.domain([0, d3.max(data, function (d) { return d.value; })]);

        svg.append("path")
            .data([data])
            .attr("stroke", `${color1}`)
            .attr("fill", "none")
            .attr("stroke-width", "2px")
            .attr("d", line);

        svg.append("g")
            .attr("transform", `translate(0, ${graph_1_height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat((d, i) => ['1920', '1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2020'][i]));

        svg.append("g")
            .call(d3.axisLeft(y));

    });
}

function cleanData(data) {
    var dateByYear = d3.nest()
        .key(function (d) { return (new Date(d["date"])).getFullYear(); })
        .rollup(function (d) {
            return d3.sum(d, function (g) { return 1; });
        }).entries(data);
    dateByYear = dateByYear.slice(dateByYear.length - 101, dateByYear.length - 1).sort()
    return dateByYear
}
setData("#66a0e2");

function updateColor() {
    setData(document.getElementById("choose_color_1").value);
}
