if (!d3.charts) {
    d3.charts = {};
}

d3.charts.forceGoals = function() {
    var data;
    var g;
    var width = 680,
        height = 500,
        radius = 6,
        maxRadius = 6,
        padding = 12; // separation between nodes

    var m = 2; // number of distinct clusters
    var teamName = "OL";
    var teamGoalCount = 0;
    var oppGoalCount = 0;
    var nodes = [];

    function chart(container) {

        g = container;
        update();
    }

    function update() {
        nodes = [];
        var color = d3.scale.category10()
            .domain(d3.range(m));

        var x = d3.scale.ordinal()
            .domain(d3.range(m))
            .rangePoints([0, width], 1);

        data.forEach(function(d, i) {
            if (d.homeTeam === teamName) {
                for (var j = 0; j < d.score.homeTeam; j++) {
                    nodes.push({
                        id: 0,
                        game: d.date,
                        radius: radius,
                        color: color(0),
                        cx: x(0),
                        cy: height / 2
                    });
                }
                for (var k = 0; k < d.score.awayTeam; k++) {
                    nodes.push({
                        id: 1,
                        game: d.date,
                        radius: radius,
                        color: color(1),
                        cx: x(1),
                        cy: height / 2
                    });
                }
            } else {
                for (var l = 0; l < d.score.homeTeam; l++) {
                    nodes.push({
                        id: 1,
                        game: d.date,
                        radius: radius,
                        color: color(1),
                        cx: x(1),
                        cy: height / 2
                    });
                }
                for (var m = 0; m < d.score.awayTeam; m++) {
                    nodes.push({
                        id: 0,
                        game: d.date,
                        radius: radius,
                        color: color(0),
                        cx: x(0),
                        cy: height / 2
                    });
                }
            }
        });

        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(0)
            .charge(0)
            .on("tick", tick)
            .start();
        var circle = g.selectAll("circle")
            .data(nodes);

        circle.enter().append("circle")
            .attr("r", function(d) {
                return d.radius;
            })
            .style("fill", function(d) {
                return d.color;
            })
            .call(force.drag);
        circle.exit().remove();

        function tick(e) {
            circle
                .each(gravity(0.2 * e.alpha))
                .each(collide(0.5))
                .attr("cx", function(d) {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                });
        }
        // Move nodes toward cluster focus.
        function gravity(alpha) {
            return function(d) {
                d.y += (d.cy - d.y) * alpha;
                d.x += (d.cx - d.x) * alpha;
            };
        }

        // Resolve collisions between nodes.
        function collide(alpha) {
            var quadtree = d3.geom.quadtree(nodes);
            return function(d) {
                var r = d.radius + maxRadius + padding,
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            };
        }
    }
    chart.update = update;





    chart.data = function(value) {
        if (!arguments.length) {
            return data;
        }
        data = value;
        return chart;
    };
    chart.teamName = function(value) {
        if (!arguments.length) {
            return teamName;
        }
        teamName = value;
        return chart;
    };
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };
    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };
    chart.radius = function(value) {
        if (!arguments.length) return radius;
        radius = value;
        return chart;
    };
    return chart;
};