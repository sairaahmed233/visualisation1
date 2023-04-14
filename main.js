 // Read the CSV data
 d3.csv("Data.csv").then(function (data) {
    // Configuration
    const width = 700;
    const height = 700;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerRadius = 150;
    const outerRadius = Math.min(width, height) / 2 - Math.max(...Object.values(margin));
    const categories = [
        "Increased a lot",
        "Increased a little",
        "Stayed the same",
        "Decreased a little",
        "Decreased a lot",
        "Don’t know",
    ];
    const segments = data.map((d) => d.Category);

    // Scales
    const x = d3.scaleBand().domain(categories).range([0, 2 * Math.PI]).padding(0.04);
    const y = d3.scaleRadial().domain([0, 100]).range([innerRadius, outerRadius]);
    const z = d3.scaleOrdinal().domain(segments).range(["#ED3624", "#2051B6", "#B09CFF", "#19B092"]);

    // Create the SVG element
    const svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Prepare the stacked data
    const stack = d3.stack().keys(segments).value((d, key) => parseFloat(d[key]));
    const stackedData = stack(
        categories.map((category) => {
            const categoryData = { Category: category };
            for (const d of data) {
                categoryData[d.Category] = d[category];
            }
            return categoryData;
        })
    );

    // Create y-axis ticks
    var yAxis = svg.append("g").attr("text-anchor", "middle");
    var yTick = yAxis.selectAll("g").data(y.ticks(3)).enter().append("g");

    // Create y-axis tick circles
    yTick.append("circle").attr("fill", "none").attr("stroke", "#000").attr("r", y);

    // Create y-axis tick text (with white stroke for legibility)
    yTick.append("text")
    .attr("y", function (d) {
            return -y(d);
        })
        .attr("dy", "0.35em")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 5)
        .text(y.tickFormat(5, "s"));

    // Create y-axis tick text (actual text)
    yTick.append("text")
        .attr("y", function (d) {
            return -y(d);
        })
        .attr("dy", "0.35em")
        .text(y.tickFormat(5, "s"));

    // Create the bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", (d) => z(d.key))
        .selectAll("path")
        .data((d) => d)
        .join("path")
        .attr(
            "d",
            d3.arc()
                .innerRadius((d) => y(d[0]))
                .outerRadius((d) => y(d[1]))
                .startAngle((d) => x(d.data.Category))
                .endAngle((d) => x(d.data.Category) + x.bandwidth())
                .padAngle(0.01)
                .padRadius(innerRadius)
        )
        .attr("opacity", 0.8)
        // Add tooltip functionality
        .on("mousemove", function (event, d) {
            d3.select("#tooltip")
                .html(
                    "<b style='color:#ED3624'>Regular household shop:</b>" +
                        d.data["Regular household shop"] +
                        "</br><b style='color:#2051B6'>Rent, mortgage or housing payments:</b>" +
                        d.data["Rent, mortgage or housing payments"] +
                        "</br><b style='color:#B09CFF'>Energy bills:</b>" +
                        d.data["Energy bills"] +
                        "</br><b style='color:#19B092'>Other household bills:</b>" +
                        d.data["Other household bills"]
                )
                .style("left", event.pageX + 25 + "px")
                .style("top", event.pageY - 28 + "px")
                .style("opacity", 1);
        })
        .on("mouseleave", function () {
            d3.select("#tooltip").style("opacity", 0);
        });

    // Create the legend
    const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(-80, -50)")
        .selectAll("g")
        .data(segments)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    // Add colored rectangles for the legend
    legend.append("rect").attr("width", 10).attr("height", 10).attr("fill", (d) => z(d));

    // Add text labels for the legend
    legend.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .text((d) => d)
        .attr("font-size", "12px")
        .attr("fill", (d) => z(d));

    // Create category labels
    svg.append("g")
        .selectAll("text")
        .data(categories)
        .join("text")
        .attr("class", "label")
        .attr("dy", (d, i) => {
            const angle = (x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90;
            if (angle > 50 && angle < 120) return 0;
            else return 10;
        }) // Adjust the vertical position of the text
        .append("textPath")
        .attr("xlink:href", (d, i) => `#categoryArc${i}`)
        .attr("startOffset", (d, i) => {
            const angle = (x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90;
            if (angle > 50 && angle < 120) return "55%";
            else return "5%";
        })
        .text((d) => d);

    // Create arc paths for text labels
    const arcPaths = svg
        .append("g")
        .selectAll("path")
        .data(categories)
        .join("path")
        .attr("id", (d, i) => `categoryArc${i}`)
        .attr(
            "d",
            d3.arc()
                .innerRadius(innerRadius - 5) // Adjust the inner radius position of the arc
                .outerRadius(innerRadius - 5)
                .startAngle((d) => x(d))
                .endAngle((d) => x(d) + x.bandwidth())
                .padAngle(0.01)
                .padRadius(innerRadius)
        )
        .attr("fill", "none");
});