if (!d3.charts) {
    d3.charts = {};
}
/**
 * Create the paraCoords reusable chart
 * @return {function} return the chart
 */
d3.charts.paraCoords = function() {
    var data;
    var teamName;
    var group;
    var xLeftAxis = 30;
    var xRightAxis = 600;
    var yScale;
    var winCount = 0;
    var lossCount = 0;
    var nullCount = 0;
    /**
     * Chart to be returned
     * @param  {DOM object} container is the svg DOM element
     * @return {[type]}           No return
     */
    function chart(container) {
        group = container;

        yScale = d3.scale.linear()
            .domain([0, d3.max(data, function(d) {
                return Math.max(d.score.homeTeam, d.score.awayTeam);
            })])
            .range([353, 10]);

        var m = container.append("g").classed("mainParaCood", true);
        m.append("g")
            .attr("class", "yLeftAxis axis");
        m.append("g")
            .attr("class", "yRightAxis axis");

        m.selectAll("path")
            .style({
                fill: "none",
                stroke: "#000"
            });
        m.selectAll("line")
            .style({
                stroke: "#000"
            });

        // add titles to the axes
        m.append("text")
            .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + 0 + "," + (353 / 2) + ")rotate(-90)") // text is drawn off the screen top left, move down and out and rotate
        .text(teamName);

        m.append("text")
            .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (xRightAxis + 30) + "," + (353 / 2) + ")rotate(90)") // text is drawn off the screen top left, move down and out and rotate
        .text("Opponents");
        update();
    }
    /**
     * The update function allows the chart to react to changes in data.
     * You can call this function when you need to update the chart.
     * @return {[type]} no return
     */
    function update() {

        winCount = 0;
        lossCount = 0;
        nullCount = 0;
        var axisLeft = d3.svg.axis()
            .scale(yScale)
            .orient("left") //left, right, top
            .ticks(8);

        var axisRight = d3.svg.axis()
            .scale(yScale)
            .orient("right") //left, right, top
            .ticks(8);
        var main = d3.select(".mainParaCood");

        d3.select(".yLeftAxis").attr("transform", "translate(" + xLeftAxis + " ,0)")
            .call(axisLeft);
        d3.select(".yRightAxis")
            .attr("transform", "translate(" + xRightAxis + " ,0)")
            .call(axisRight);

        var lines = main.selectAll("line")
            .data(data, function(d) {
                return d.date;
            });

        lines.enter()
            .append("line");
        lines
            .style("stroke", function(d) {
                var color = "black";
                if (d.score.homeTeam === d.score.awayTeam) {
                    nullCount += 1;
                    return color;
                } else if (d.homeTeam === teamName) {
                    if (d.score.homeTeam > d.score.awayTeam) {
                        winCount += 1;
                        color = "#00a582";
                    } else {
                        lossCount += 1;
                        color = "#ff8a7f";
                    }
                } else {
                    if (d.score.homeTeam < d.score.awayTeam) {
                        winCount += 1;
                        color = "#00a582";
                    } else {
                        lossCount += 1;
                        color = "#ff8a7f";
                    }
                }
                return color;
            })
            .style("stroke-width", "0.5")
            .transition()
            .attr({
                x1: xLeftAxis,
                y1: function(d, i) {
                    return (d.homeTeam === teamName) ? yScale(d.score.homeTeam) : yScale(d.score.awayTeam);
                },
                x2: xRightAxis,
                y2: function(d, i) {
                    return (d.homeTeam !== teamName) ? yScale(d.score.homeTeam) : yScale(d.score.awayTeam);
                }
            });

        lines.on('mouseover', function(d, i) {
            d3.select(this)
                .style("stroke-width", "4")
                .text(i);
        });
        lines.on('mouseout', function(d, i) {
            d3.select(this)
                .style("stroke-width", "0.5")
                .text(i);
        });

        lines.exit().remove();

    }
    /**
     * Making the update function accessible
     * @type {function}
     */
    chart.update = update;
    /**
     * Set or Get chart data
     * @param  {array} value Can be an array of objects for setter OR nothing for getter
     * @return {function || data} Returns the chart itself for function concatenation or the data
     */
    chart.data = function(value) {
        if (!arguments.length) {
            return data;
        }
        data = value;
        return chart;
    };
    /**
     * Set or Get the team name
     * @param  {string} value is the name of the team
     * @return {function || string}       Returns the chart itself for function concatenation or the team name
     */
    chart.teamName = function(value) {
        if (!arguments.length) {
            return teamName;
        }
        teamName = value;
        return chart;
    };
    /**
     * Get the number of wins in the current data
     * @return {int} number of wins
     */
    chart.winCount = function() {
        return winCount;
    };
    /**
     * Get the number of losses in the current data
     * @return {int} number of losses
     */
    chart.lossCount = function() {
        return lossCount;
    };
    /**
     * Get the number of nulls in the current data
     * @return {int} number of nulls
     */
    chart.nullCount = function() {
        return nullCount;
    };
    return chart;
};