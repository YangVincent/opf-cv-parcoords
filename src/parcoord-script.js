let margin = {top: 66, right: 110, bottom: 20, left: 188},
    width = document.body.clientWidth - margin.left - margin.right,
    height = 340 - margin.top - margin.bottom,
    innerHeight = height - 2;

let devicePixelRatio = window.devicePixelRatio || 1;

let color = d3.scaleOrdinal()
    .domain(["Radial Velocity", "Imaging", "Eclipse Timing Variations", "Astrometry", "Microlensing", "Orbital Brightness Modulation", "Pulsar Timing", "Pulsation Timing Variations", "Transit", "Transit Timing Variations"])
    .range(["#DB7F85", "#50AB84", "#4C6C86", "#C47DCB", "#B59248", "#DD6CA7", "#E15E5A", "#5DA5B3", "#725D82", "#54AF52", "#954D56", "#8C92E8", "#D8597D", "#AB9C27", "#D67D4B", "#D58323", "#BA89AD", "#357468", "#8F86C2", "#7D9E33", "#517C3F", "#9D5130", "#5E9ACF", "#776327", "#944F7E"]);

let types = {
    "Number": {
        key: "Number",
        coerce: function(d) { return +d; },
        extent: d3.extent,
        within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scaleLinear().range([innerHeight, 0])
    },
    "String": {
        key: "String",
        coerce: String,
        extent: function (data) { return data.sort(); },
        within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scalePoint().range([0, innerHeight])
    },
    "Date": {
        key: "Date",
        coerce: function(d) { return new Date(d); },
        extent: d3.extent,
        within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scaleTime().range([innerHeight, 0])
    }
};

let printBin = function(bins) {
    for (let i = 0; i < bins.length; i++) {
        for (let j = 0; j < bins[i].length; j++){
            console.log(bins[i][j])
        }
        console.log('');
    }

};

let dimensions = [
    {
        key: "Dalc",
        description: "Dalc",
        type: types["Number"]
    },
    {
        key: "age",
        description: "Age",
        type: types["Number"]
    },
    {
        key: "Walc",
        description: "Walc",
        type: types["Number"]
    }
    /*
    {
    key: "pl_telescope",
    description: "Telescope",
    type: types["String"],
    axis: d3.axisRight()
    .tickFormat(function(d,i) {
    return d;
})
}
    */
    /*
    {
    key: "pl_instrument",
    description: "Instrument",
    type: types["String"],
    axis: d3.axisRight()
    .tickFormat(function(d,i) {
    return d;
})
}
    */
];


let xscale = d3.scalePoint()
    .domain(d3.range(dimensions.length))
    .range([0, width]);

let yAxis = d3.axisLeft();

const container = d3.select("body").append("div")
    .attr("class", "parcoords")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", height + margin.top + margin.bottom + "px");

const svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const canvas = container.append("canvas")
    .attr("width", width * devicePixelRatio)
    .attr("height", height * devicePixelRatio)
    .style("width", width + "px")
    .style("height", height + "px")
    .style("margin-top", margin.top + "px")
    .style("margin-left", margin.left + "px");

const ctx = canvas.node().getContext("2d");
ctx.globalCompositeOperation = 'darken';
ctx.globalAlpha = 0.15;
//ctx.lineWidth = 1.5;
//ctx.lineWidth = 15;
ctx.lineCap = 'round';
ctx.lineWidth = 50;
ctx.scale(devicePixelRatio, devicePixelRatio);

const output = d3.select("body").append("pre");

const axes = svg.selectAll(".axis")
    .data(dimensions)
    .enter().append("g")
    .attr("class", function (d) {
        return "axis " + d.key.replace(/ /g, "_");
    })
    .attr("transform", function (d, i) {
        return "translate(" + xscale(i) + ")";
    });

//d3.csv("planets.csv", function(error, data) {
d3.csv("test.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
        dimensions.forEach(function(p) {
            d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
        });

        // truncate long text strings to fit in data table
        for (let key in d) {
            if (d[key] && d[key].length > 35) d[key] = d[key].slice(0,36);
        }
    });

    // type/dimension default setting happens here
    dimensions.forEach(function(dim) {
        if (!("domain" in dim)) {
            // detect domain using dimension type's extent function
            dim.domain = d3_functor(dim.type.extent)(data.map(function(d) { return d[dim.key]; }));
        }
        if (!("scale" in dim)) {
            // use type's default scale for dimension
            dim.scale = dim.type.defaultScale.copy();
        }
        dim.scale.domain(dim.domain);
    });

    // Do data processing here
    console.log(data);
    console.log(Object.keys(data[0]));
    const numBins = 10;
    const dims = Object.keys(data[0]);
    const numDimensions = dims.length;


    // create 2d array to represent every possible combination.
    const comb = new Array(numDimensions);
    for (let i = 0; i < numDimensions; i++) {
        comb[i] = new Array(numDimensions);
        console.log(Object.keys(data[0])[i]);
    }

    // find min, max for each
    const minvals = new Array(numDimensions);
    const maxvals = new Array(numDimensions);
    for (let i = 0; i < numDimensions; i++) {
        minvals[i] = data[0][dims[i]];
        maxvals[i] = data[0][dims[i]];
    }
    for (let i = 0; i < numDimensions; i++) {
        for (let j = 0; j < data.length; j++) {
            minvals[i] = Math.min(minvals[i], data[j][dims[i]])
            maxvals[i] = Math.max(maxvals[i], data[j][dims[i]])
        }
    }
    console.log(minvals);
    console.log(maxvals);


    // for each possible combination, create an array of tuples.
    for (let i = 1; i < numDimensions; i++) {
        for (let j = i+1; j < numDimensions; j++) {
            // between each pair of axes, we need to create a 2 by 2 array of numBins
            const bins = new Array(numBins);
            for (let k = 0; k < numBins; k++) {
                bins[k] = Array.apply(null, Array(numBins)).map(Number.prototype.valueOf,0);
            }

            for (let k = 0; k < data.length; k++) {
                let val1 = data[k][dims[i]];
                let val2 = data[k][dims[j]];
                let bucket1 = Math.trunc((val1 - minvals[i])/(maxvals[i] - minvals[i]) * 10);
                let bucket2 = Math.trunc((val2 - minvals[j])/(maxvals[j] - minvals[j]) * 10);
                //console.log('val1: ' + val1 + ', min: ' + minvals[i] + ', max: ' + maxvals[i] + ', bucket: ' + bucket1);
                //console.log('val2: ' + val2 + ', min: ' + minvals[j] + ', max: ' + maxvals[j] + ', bucket: ' + bucket2);
                if (bucket1 == numBins) {
                    bucket1 = numBins-1;
                }
                if (bucket2 == numBins) {
                    bucket2 = numBins-1;
                }
                if (bins[bucket1][bucket2] == null){
                    bins[bucket1][bucket2] = 1;
                    bins[bucket2][bucket1] = 1; // mirror the 2d array
                }
                else {
                    bins[bucket1][bucket2] += 1;
                    bins[bucket2][bucket1] += 1; // mirror the 2d array
                }
            }

            console.log("Comparing " + Object.keys(data[0])[i] + " and " + Object.keys(data[0])[j]);
            console.log(bins);
        }
    }
    // At this point, all bins have created. The format is as follows.
    // bins is a 2d array of dimension1, dimension2. It stores the relationship between two axes. 
    // In each element of bins, such as bins[dimension1][dimension2], we have a numBins by numBins array recording relationships
    // between those two axes. 

    // End data processing

    const render = renderQueue(draw).rate(30);

    ctx.clearRect(0,0,width,height);
    ctx.globalAlpha = d3.min([1.15/Math.pow(data.length,0.3),1]);
    render(data);

    axes.append("g")
        .each(function(d) {
            const renderAxis = "axis" in d
                ? d.axis.scale(d.scale)  // custom axis
                : yAxis.scale(d.scale);  // default axis
            d3.select(this).call(renderAxis);
        })
        .append("text") // titles on top
        .attr("class", "title")
        .attr("text-anchor", "start")
        .text(function(d) { return "description" in d ? d.description : d.key; });

    // Add and store a brush for each axis.
    axes.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(d.brush = d3.brushY()
                .extent([[-10,0], [10,height]])
                .on("start", brushstart)
                .on("brush", brush)
                .on("end", brush)
            )
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    d3.selectAll(".axis.age .tick text")
        .style("fill", color);

    //  output.text(d3.tsvFormat(data.slice(0,24)));

    function project(d) {
        return dimensions.map(function(p,i) {
            // check if data element has property and contains a value
            if (
                !(p.key in d) ||
                d[p.key] === null
            ) return null;

            return [xscale(i),p.scale(d[p.key])];
        });
    };

    function draw(d) {
        ctx.strokeStyle = color(d.age);
        ctx.beginPath();
        const coords = project(d);
        coords.forEach(function(p,i) {
            // this tricky bit avoids rendering null values as 0
            if (p === null) {
                // this bit renders horizontal lines on the previous/next
                // dimensions, so that sandwiched null values are visible
                if (i > 0) {
                    const prev = coords[i - 1];
                    if (prev !== null) {
                        ctx.moveTo(prev[0],prev[1]);
                        ctx.lineTo(prev[0]+6,prev[1]);
                    }
                }
                if (i < coords.length-1) {
                    const next = coords[i + 1];
                    if (next !== null) {
                        ctx.moveTo(next[0]-6,next[1]);
                    }
                }
                return;
            }

            if (i == 0) {
                ctx.moveTo(p[0],p[1]);
                return;
            }

            ctx.lineTo(p[0],p[1]);
        });
        ctx.stroke();
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        render.invalidate();

        const actives = [];
        svg.selectAll(".axis .brush")
            .filter(function(d) {
                return d3.brushSelection(this);
            })
            .each(function(d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });

        const selected = data.filter(function (d) {
            if (actives.every(function (active) {
                    const dim = active.dimension;
                    // test if point is within extents for each active brush
                    return dim.type.within(d[dim.key], active.extent, dim);
                })) {
                return true;
            }
        });

        // show ticks for active brush dimensions
        // and filter ticks to only those within brush extents
        /*
            svg.selectAll(".axis")
            .filter(function(d) {
        return actives.indexOf(d) > -1 ? true : false;
    })
            .classed("active", true)
            .each(function(dimension, i) {
        var extent = extents[i];
        d3.select(this)
            .selectAll(".tick text")
            .style("display", function(d) {
        var value = dimension.type.coerce(d);
        return dimension.type.within(value, extent, dimension) ? null : "none";
    });
    });

        // reset dimensions without active brushes
        svg.selectAll(".axis")
            .filter(function(d) {
        return actives.indexOf(d) > -1 ? false : true;
    })
            .classed("active", false)
            .selectAll(".tick text")
            .style("display", null);
        */

        ctx.clearRect(0,0,width,height);
        ctx.globalAlpha = d3.min([0.85/Math.pow(selected.length,0.3),1]);
        render(selected);
        // selected holds all of the lines! We can then look at it to see their grades.
        console.log(selected);
    }
});

function d3_functor(v) {
    return typeof v === "function" ? v : function() { return v; };
};
