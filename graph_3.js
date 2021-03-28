let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let x_3 = d3.scaleLinear()
    .range([0, (graph_3_width - margin.left - margin.right)]);

let y_3 = d3.scaleBand()
    .range([0, graph_3_height - margin.top - margin.bottom])
    .padding(0.1);  // Improves readability

let countRef_3 = svg3.append("g");
let y_axis_label_3 = svg3.append("g");

svg3.append("text")
    .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${graph_3_height - margin.bottom - 20})`)
    .style("text-anchor", "middle")
    .text("Combined Number of Games Played");

let y_axis_text_3 = svg3.append("text")
    .attr("transform", `translate(${-100}, ${(graph_3_height - margin.top - margin.bottom) / 2} )`)
    .style("text-anchor", "middle");

let title_3 = svg3.append("text")
    .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${margin.top - 50})`)
    .style("text-anchor", "middle")
    .style("font-size", 15);


function setData3(color1, color2) {
    d3.csv("../data/football.csv").then(function (data3) {
        [data, data2014, data2018] = cleanData3(data3)

        x_3.domain([0, d3.max(data, function (d) { return d[1] })]);
        y_3.domain(data.map(function (d) { return d[0] }));

        y_axis_label_3.call(d3.axisLeft(y_3).tickSize(0).tickPadding(10));

        let bars = svg3.selectAll("rect").data(data);

        let color = d3.scaleOrdinal()
            .domain(data.map(function (d) { return d[0] }))
            .range(d3.quantize(d3.interpolateHcl(color1, color2), 15));

        let tooltip = d3.select("#graph3")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        let mouseover = function (d) {
            d3.select(this).attr("opacity", 0.6);
            let html = `<br> 2018: ${data2018.get(d[0])}</br>
            <br> 2014: ${data2014.get(d[0])}</br>`;

            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 720}px`)
                .style("top", `${(d3.event.pageY) - 275}px`)
                .transition()
                .duration(200)
                .style("opacity", 0.9)
        };

        let mouseout = function (d) {
            d3.select(this).attr("opacity", 1);
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };

        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", function (d) { return color(d[0]) })
            .attr("x", x_3(0))
            .attr("y", function (d) { return y_3(d[0]) })
            .attr("width", function (d) { return x_3(d[1]) })
            .attr("height", y_3.bandwidth())
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        let counts = countRef_3.selectAll("text").data(data);


        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x_3(d[1]) + 7 })
            .attr("y", function (d) { return y_3(d[0]) + 18 })
            .style("text-anchor", "start")
            .text(function (d) { return d[1] });

        y_axis_text_3.text("Country");
        title_3.text("Top 15 Performing Teams in Previous 2 World Cups");
        bars.exit().remove();
        counts.exit().remove();
    });
}

function isWorldCupYear(d) {
    var date = new Date(d["date"]).getFullYear();
    return (date == 2018 || date == 2014);
}

function is2014(d) {
    var date = new Date(d["date"]).getFullYear();
    return date == 2014;
}

function is2018(d) {
    var date = new Date(d["date"]).getFullYear();
    return date == 2018;
}

function getStageFromValue(n) {
    if (n == 0) {
        return "Did Not Qualify"
    }
    else if (n == 3) {
        return "Group Stage"
    } else if (n == 4) {
        return "Round of 16"
    } else if (n == 5) {
        return "Round of 8"
    } else if (n == 7) {
        return "Semifinals or Finals"
    }
}

function cleanData3(data) {

    var allGamesHome = d3.nest()
        .key(function (d) { return d["home_team"] })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return isWorldCupYear(d) && d["tournament"] == 'FIFA World Cup' });
        }).entries(data);

    var allGamesAway = d3.nest()
        .key(function (d) { return d["away_team"] })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return isWorldCupYear(d) && d["tournament"] == 'FIFA World Cup' });
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
        if (containsKey) {
            allGames.set(home_key, away_value + home_value);
        }
    }

    var final = new Array()
    for (let entry of allGames.entries()) {
        final.push([entry[0], entry[1]]);
    }
    final = final.sort(function (d1, d2) { return d2[1] - d1[1] }).slice(0, 15);


    var homeFirst = d3.nest()
        .key(function (d) { return d["home_team"] })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return is2014(d) && d["tournament"] == 'FIFA World Cup' });
        }).entries(data);

    var awayFirst = d3.nest()
        .key(function (d) { return d["away_team"] })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return is2014(d) && d["tournament"] == 'FIFA World Cup' });
        }).entries(data);

    var allGames2014 = new Map();
    for (let entry of homeFirst.entries()) {
        home_key = entry[1].key
        home_value = entry[1].value
        var containsKey = false;
        for (let away_entry of awayFirst.entries()) {
            if (home_key == away_entry[1].key) {
                containsKey = true;
                var away_value = away_entry[1].value
            }
        }
        if (containsKey) {
            allGames2014.set(home_key, getStageFromValue(away_value + home_value));
        }
    }

    var homeSecond = d3.nest()
        .key(function (d) { return d["home_team"] })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return is2018(d) && d["tournament"] == 'FIFA World Cup' });
        }).entries(data);

    var awaySecond = d3.nest()
        .key(function (d) { return d["away_team"] })
        .rollup(function (d) {
            return d3.sum(d, function (d) { return is2018(d) && d["tournament"] == 'FIFA World Cup' });
        }).entries(data);

    var allGames2018 = new Map();
    for (let entry of homeSecond.entries()) {
        home_key = entry[1].key
        home_value = entry[1].value
        var containsKey = false;
        for (let away_entry of awaySecond.entries()) {
            if (home_key == away_entry[1].key) {
                containsKey = true;
                var away_value = away_entry[1].value
            }
        }
        if (containsKey) {
            allGames2018.set(home_key, getStageFromValue(away_value + home_value));
        }
    }
    return [final, allGames2014, allGames2018]
}

setData3("#66a0e2", "#81c2c3");

function updateColor3() {
    setData3(document.getElementById("choose_color_1").value, document.getElementById("choose_color_2").value);
}
