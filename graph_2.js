let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);    // HINT: transform


let x_2 = d3.scaleLinear()
    .range([0, (graph_2_width - margin.left - margin.right)]);

let y_2 = d3.scaleBand()
    .range([0, graph_2_height - margin.top - margin.bottom])
    .padding(0.1);

let countRef_2 = svg2.append("g");
let y_axis_label_2 = svg2.append("g");

svg2.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${graph_2_height - margin.bottom - 20})`)
    .style("text-anchor", "middle")
    .text("Percentage of Victories");

let y_axis_text_2 = svg2.append("text")
    .attr("transform", `translate(${-100}, ${(graph_2_height - margin.top - margin.bottom) / 2} )`)
    .style("text-anchor", "middle");

let title_2 = svg2.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${margin.top - 50})`)
    .style("text-anchor", "middle")
    .style("font-size", 15);


function setData2(color1, color2) {
    d3.csv("../data/football.csv").then(function (data2) {
        data = cleanData2(data2)

        x_2.domain([0, d3.max(data, function (d) { return d[1] })]);
        y_2.domain(data.map(function (d) { return d[0] }));

        y_axis_label_2.call(d3.axisLeft(y_2).tickSize(0).tickPadding(10));

        let bars = svg2.selectAll("rect").data(data);

        let color = d3.scaleOrdinal()
            .domain(data.map(function (d) { return d[0] }))
            .range(d3.quantize(d3.interpolateHcl(color1, color2), 10));

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function (d) { return color(d[0]) })
            .attr("x", x_2(0))
            .attr("y", function (d) { return y_2(d[0]) })
            .attr("width", function (d) { return x_2(d[1]) })
            .attr("height", y_2.bandwidth());

        let counts = countRef_2.selectAll("text").data(data);

        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x_2(d[1]) + 7 })
            .attr("y", function (d) { return y_2(d[0]) + 13 })
            .style("text-anchor", "start")
            .text(function (d) { return (d[1] * 100).toFixed(1) });

        y_axis_text_2.text("Country");
        title_2.text("Top 10 Winning Teams of All Time");
        bars.exit().remove();
        counts.exit().remove();
    });
}


function cleanData2(data) {
    var winsHomeTeam = d3.nest()
        .key(function (d) { return d["home_team"]; })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return d["home_score"] > d["away_score"]; });
        }).entries(data);

    var winsAwayTeam = d3.nest()
        .key(function (d) { return d["away_team"]; })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return d["away_score"] > d["home_score"]; });
        }).entries(data);

    var allWins = new Map();
    for (let entry of winsHomeTeam.entries()) {
        home_key = entry[1].key
        home_value = entry[1].value
        var containsKey = false;
        for (let away_entry of winsAwayTeam.entries()) {
            if (home_key == away_entry[1].key) {
                containsKey = true;
                var away_value = away_entry[1].value
            }
        }
        if (containsKey) {
            allWins.set(home_key, away_value + home_value);
        }
    }

    var allGamesHome = d3.nest()
        .key(function (d) { return d["home_team"] })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return 1 });
        }).entries(data);

    var allGamesAway = d3.nest()
        .key(function (d) { return d["away_team"] })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return 1 });
        }).entries(data);

    var allGames = new Map();
    for (let entry of allGamesHome.entries()) {
        home_key = entry[1].key
        home_value = entry[1].value
        var containsKey = false;
        for (let away_entry of allGamesAway.entries()) {
            if (home_key == away_entry[1].key) {
                containsKey = true;
                var away_value = away_entry[1].value
            }
        }
        if (containsKey && (away_value + home_value) > 400) {
            allGames.set(home_key, away_value + home_value);
        }
    }

    var percentage = new Array()
    for (let entry of allGames.entries()) {
        game_key = entry[0];
        game_value = entry[1];
        var containsKey = false;
        for (let wins_entry of allWins.entries()) {
            if (game_key == wins_entry[0]) {
                containsKey = true;
                var wins_value = wins_entry[1];
            }
        }
        if (containsKey) {
            percentage.push([game_key, wins_value / game_value]);
        }
    }
    percentage = percentage.sort(function (d1, d2) { return d2[1] - d1[1] }).slice(0, 10)
    return percentage
}

setData2("#66a0e2", "#81c2c3");

function updateColor2() {
    setData2(document.getElementById("choose_color_1").value, document.getElementById("choose_color_2").value);
}
