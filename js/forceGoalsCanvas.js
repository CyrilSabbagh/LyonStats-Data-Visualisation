if (!d3.charts) {
    d3.charts = {};
}

d3.charts.forceGoalsCanvas = function() {

    var width = 960,
        height = 500,
        radius = 6;
    var div;
    var data;
    var canvas;
    var nodes = [];
    var teamGoalCount = 0;
    var oppGoalCount = 0;

    function chart(container) {

        div = container;
        canvas = div.append("canvas")
            .attr("width", width)
            .attr("height", height);
        update();
    }

    function update() {
        nodes = [];
        teamGoalCount = 0;
        oppGoalCount = 0;
        data.forEach(function(d, i) {
            var teamScore = getTeamScore(d);
            var opponentScore = getOpponentScore(d);
            for (var j = 0; j < teamScore; j++) {
                nodes.push({
                    id: 0,
                    game: d.date,
                    radius: radius
                });
                teamGoalCount += 1;
            }
            for (var k = 0; k < opponentScore; k++) {
                nodes.push({
                    id: 1,
                    game: d.date,
                    radius: radius
                });
                oppGoalCount += 1;
            }
        });

        nodes.unshift({
            radius: 0,
            fixed: true
        });
        root = nodes[0];

        var force = d3.layout.force()
            .gravity(0.05)
            .charge(function(d, i) {
                return i ? 0 : -2000;
            })
            .nodes(nodes)
            .size([width, height]);

        force.start();

        var context = canvas.node().getContext("2d");

        force.on("tick", function(e) {
            var q = d3.geom.quadtree(nodes),
                i,
                d,
                n = nodes.length;

            for (i = 1; i < n; ++i) q.visit(collide(nodes[i]));

            context.clearRect(0, 0, width, height);

            context.beginPath();
            for (i = 1; i < n; ++i) {
                d = nodes[i];
                if (d.id === 0) context.fillStyle = "#00a582";
                if (d.id === 1) context.fillStyle = "#ff8a7f";
                context.beginPath();
                context.moveTo(d.x, d.y);
                context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
                context.closePath();
                context.fill();
            }

        });

        function getTeamScore(d) {
            return (d.homeTeam === teamName) ? d.score.homeTeam : d.score.awayTeam;
        }

        function getOpponentScore(d) {
            return (d.homeTeam !== teamName) ? d.score.homeTeam : d.score.awayTeam;
        }

        canvas.on("mousemove", function() {
            var p1 = d3.mouse(this);
            root.px = p1[0];
            root.py = p1[1];
            force.resume();
        });

        function collide(node) {
            var r = node.radius + 16,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r;
            return function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                    var x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = node.radius + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * 0.5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
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
    chart.getTeamGoals = function() {
        return teamGoalCount;
    };
    chart.getOpponentGoals = function() {
        return oppGoalCount;
    };
    return chart;
};