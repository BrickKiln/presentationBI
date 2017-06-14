// Set the margins
var margin = {top: 20, right: 100, bottom: 80, left: 100},
  width = 800 - margin.left - margin.right,
  height = 400 - margin.top;

// Set the ranges
var x = d3.scaleLinear().domain([30, 80]).range([0, width]);
var y = d3.scaleLinear().range([height, 0]);


// Define the line
var valueLine = d3.line()
    .x(function(d) { return x(+d.threshold); })
    .y(function(d) { return y(+d.personRate); })

// Set the color
var color = d3.scaleOrdinal()
  .domain(["HU", "CZ", "LV", "SK"])
  .range(["#E69F00", "#999999" , "#56B4E9", "#009E73"]);

// Create the svg canvas in the "graph" div
var svg = d3.select("#graph")
        .append("svg")
        .style("width", width + margin.left + margin.right + "px")
        .style("height", height + margin.top + margin.bottom + "px")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "svg");

// Import the CSV data
d3.csv("diffPovRates.csv", function(error, data) {
  if (error) throw error;

   // Format the data
  data.forEach(function(d) {
      d.year = +d.year;
      d.country = d.country;
      d.personRate = +d.personRate;
  });

  var nest = d3.nest()
	  .key(function(d){
	    return d.year;
	  })
	  .key(function(d){
	  	return d.country;
	  })
	  .entries(data)

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.threshold; }));
  y.domain([-10, 15]);

  // Set up the x axis
  var xaxis = svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .attr("class", "axis")
       .call(d3.axisBottom(x)
          .tickSize(2, 0)
          .tickSizeInner(0)
          .tickPadding(10));

  // Add the Y Axis
   var yaxis = svg.append("g")
       .attr("class", "axis")
       .call(d3.axisLeft(y)
          .ticks(6)
          .tickSizeInner(0)
          .tickPadding(6)
          .tickSize(2, 0));

  svg.append("line")
        .attr("y1", 380)
        .attr("y2", 0)
        .attr("x1", x(60))
        .attr("x2", x(60))
        .style("stroke-width", 1)
        .style("stroke-dasharray", "5, 5")
        .attr("class", "line");

  // Add a label to the y axis
  svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 50)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Poverty Rate")
        .attr("class", "axis");
  // Add a label to the x axis
  svg.append("text")
    .attr("transform",
          "translate(" + (width/2) + " ," + (height + 50) + ")")
    .style("text-anchor", "middle")
    .text("Threshold")
    .attr("class", "axis");

  // Create a dropdown
    var yearMenu = d3.select("#yearDropdown")

    yearMenu
		.append("select")
		.selectAll("option")
        .data(nest)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.key;
        })
        .text(function(d){
            return d.key;
        })



 	// Function to create the initial graph
 	var initialGraph = function(year){

 		// Filter the data to include only year of interest
 		var selectYear = nest.filter(function(d){
                return d.key == year;
              })

	    var selectYearGroups = svg.selectAll(".yearGroups")
		    .data(selectYear, function(d){
		      return d ? d.key : this.key;
		    })
		    .enter()
		    .append("g")
		    .attr("class", "yearGroups")

		var initialPath = selectYearGroups.selectAll(".line")
			.data(function(d) { return d.values; })
			.enter()
			.append("path")

		initialPath
			.attr("d", function(d){
				return valueLine(d.values);
			})
			.attr("class", "line")
      .style("stroke", function(d) { // Add the colours dynamically
                return d.color = color(d.key); })

 	}

 	// Create initial graph
 	initialGraph(2012)


 	// Update the data
 	var updateGraph = function(year){

 		// Filter the data to include only year of interest
 		var selectYear = nest.filter(function(d){
                return d.key == year;
              })

 		// Select all of the grouped elements and update the data
    var selectYearGroups = svg.selectAll(".yearGroups")
	    .data(selectYear)

    // Select all the lines and transition to new positions
    selectYearGroups.selectAll("path.line")
      .data(function(d){
        return (d.values);
      })
      .transition()
        .duration(1500)
        .attr("d", function(d){
          return valueLine(d.values)
        })
 	}


 	// Run update function when dropdown selection changes
 	yearMenu.on('change', function(){

 		// Find which year was selected from the dropdown
 		var selectedYear = d3.select(this)
            .select("select")
            .property("value")

        // Run update function with the selected year
        updateGraph(selectedYear)


    });



})
