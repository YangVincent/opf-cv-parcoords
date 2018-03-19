const drawingPane = d3.select("#drawingPane");

const chartMargins = {top: 50, left: 50};

let width = drawingPane.attr("width"),
    height = drawingPane.attr("height");

const pcXScale = d3.scaleOrdinal();

const pcYAxis = d3.axisLeft();

let pcDimensions = [
    {id: 1, title: "11111", yScale: d3.scaleLinear().domain([0,1])},
    {id: 2, title: "22222", yScale: d3.scaleLinear().domain([0,1])},
    {id: 3, title: "33333", yScale: d3.scaleLinear().domain([0,1])}
];

const pcBrushes = {};
const dragging = {};

function drawParallelCoordinates() {
    drawingPane.selectAll("*").remove();

    width = document.body.clientWidth
    height = 480;

    drawingPane.attr("width", width)
        .attr("height", height);
    drawParallelCoordinatesAxes();
}

function drawParallelCoordinatesAxes() {
    // drawingPane.append("rect")
    //     .attr("width", "100%")
    //     .attr("height", "100%")
    //     .attr("fill", "gray");

    let g = drawingPane.append("g")
        .attr("transform", "translate(" + (chartMargins.left) + ", " + (chartMargins.top) + ")");

    pcSize = [width - chartMargins.left * 2, height - chartMargins.top * 2];

    let xrange = [];
    for (let i = 0; i < pcDimensions.length; ++i) {
        xrange.push(i * pcSize[0] / (pcDimensions.length - 1));
    }
    pcXScale.domain(pcDimensions.map(extractId)).range(xrange);

    for (const dim of pcDimensions) {
        dim.yScale.range([pcSize[1], 0]);
    }

    // TODO grab data?

    const axes = g.selectAll(".axis")
        .data(pcDimensions)
        .enter().append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "translate(" + pcXScale(d.id) + ")"; })
        .call(d3.drag()
            .on("start", function (d) {
                if (d3.event && d3.event.sourceEvent)
                    d3.event.sourceEvent.stopPropagation();
                dragging[d.id] = this.__origin__ = pcXScale(d.id);
                this.__dragged__ = false;
                // console.log("start");
            })
            .on("drag", function(d) {
                if (d3.event && d3.event.sourceEvent)
                    d3.event.sourceEvent.stopPropagation();
                dragging[d.id] = d3.event.x; //Math.min(width, Math.max(0, this.__origin__ += d3.event.dx));
                pcDimensions.sort(function(a, b) {return position(a) - position(b);});
                pcXScale.domain(pcDimensions.map(extractId));
                axes.attr("transform", function(d) {return "translate(" + position(d) + ")"; });
                // brush_count++;
                this.__dragged__ = true;
                // console.log("drag");
            })
            .on("end", function(d) {
                if (!this.__dragged__) {
                    // No movement, basically clicked, do something?
                } else {
                    d3.select(this).transition().attr("transform", "translate(" + pcXScale(d.id) + ")");
                }

                // pcXScale.domain(pcDimensions.map(extractId));
                // console.log("end");

                delete this.__dragged__;
                delete this.__origin__;
                delete dragging[d.id];
            }));

    axes.append("g")
        .each(function(d) {
            let renderAxis = pcYAxis.scale(d.yScale);
            d3.select(this).call(renderAxis);
        })
        .append("text")
        .attr("class", "title")
        .attr("text-anchor", "start")
        .text(function(d) {return d.title;});

    axes.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(pcBrushes[d.title] = d3.brushY()
                .extent([[-10,0],[10,pcSize[1]]])
                .on("start", pcBrushStart())
                .on("brush", pcBrush)
                .on("end", function(d) {
                    pcBrush();
                    // redraw();
                })
            );
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);
    //

    function pcBrushStart() {
        if (d3.event && d3.event.sourceEvent)
            d3.event.sourceEvent.stopPropagation();
    }
    function pcBrush() {
        let actives = [];
        g.selectAll(".brush")
            .filter(function(d) {
                return d3.brushSelection(this);
            })
            .each(function(d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });

        // let selected = businesses.filter(function(d) {
        //     if (actives.every(function(active) {
        //             const dim = active.dimension;
        //             const val = parallelYScales[dim](d[dim]);
        //
        //             return active.extent[0] <= val && val <= active.extent[1]
        //         })) {
        //         return true;
        //     }
        // });

        // redraw


    }
}

function loadData(callback) {
    // TODO load the data, then call callback when complete
}

function extractId(obj) {
    return obj.id;
}

function position(d) {
    const ret = dragging[d.id];
    return ret == null ? pcXScale(d.id) : ret;
}


drawParallelCoordinates();