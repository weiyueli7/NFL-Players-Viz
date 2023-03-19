function project(){
    var filePath="data/nfl_players.csv";
    viz1(filePath);
    viz2(filePath);
    viz3(filePath);
    viz4(filePath);
    viz5(filePath);
}


var viz1=function(filePath){
    
    d3.csv(filePath).then(data=>{
        // console.log(data);
        var current_position = document.querySelector('input[name="position"]:checked').value;
        var target_data = data.filter(v => v.position == current_position);
        var all_position = [...new Set(data.map(v=>v.position))];
        
        const margin = {top: 100, right: 50, bottom: 100, left: 100},
            width = 800 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        const svg = d3.select("#viz1_plot").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate("+margin.left+"," +margin.top+")");

        var x = d3.scaleLinear().domain(d3.extent(target_data, d => +d.height)).range([50, width - 50]);

        var y = d3.scaleLinear().domain(d3.extent(target_data, d => +d.weight)).range([height - 50, 50]);

        var x_axis = d3.axisBottom(x);
        var y_axis = d3.axisLeft(y);
        svg.append("g").attr("class","x_axis").attr("transform", "translate(0," + height + ")").call(x_axis);
        svg.append("g").attr("class","y_axis").call(y_axis);

        svg.append("text")
          .attr("x", (width / 2))  
          .attr("class", "viz1-title")           
          .attr("y", -30 )
          .attr("text-anchor", "middle")  
          .attr('font-weight', 700)
          .style("font-size", "20px") 
          .text("Height vs Weight of Drafted " + current_position);

        svg.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "middle")
          .attr("x", (width / 2))
          .attr("y", height + 2*margin.bottom/3)
          .text("Height (Inchs)");

        svg.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 20)
          .attr("x", -height / 2)
          .text("Weight (Pounds)");

        var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(all_position);

        svg.selectAll("circle").data(target_data).enter().append("circle").attr("class", "dot")
        .transition()
        .duration(50)
        .delay((d, i) => i * 2)
            .attr("cx", d => x(+d.height))
            .attr("cy", d => y(+d.weight))
            .attr("r", 3)
            .attr('fill', function(d) {return colorScale(d.position)});

        var radio = d3.select('#viz1_radio')
          .attr('name', 'position').on("change", function (d) {
              current_position = d.target.value; //getting the value of selected radio button
            //   console.log(current_position);
              target_data = data.filter(v=>v.position == current_position);
            //   console.log(target_data);  
            x = d3.scaleLinear().domain(d3.extent(target_data, d => +d.height)).range([50, width - 50]); 
            y = d3.scaleLinear().domain(d3.extent(target_data, d => +d.weight)).range([height - 50, 50]);
            x_axis = d3.axisBottom(x);
            y_axis = d3.axisLeft(y);

            d3.selectAll("g.y_axis")
                  .transition().duration(1500)
                  .call(y_axis);
            d3.selectAll("g.x_axis")
                  .transition().duration(1500)
                  .call(x_axis);

            d3.selectAll("text.viz1-title")
                  .text("Height vs Weight  of Drafted " + current_position);

            d3.selectAll("circle")
                .data(target_data)
                .transition()
                .duration(50)
                .delay((d, i) => i * 2)
                .attr("cx", d => x(d.height))
                .attr("cy", d => y(d.weight))
                .attr("r", 3)
                .attr("fill", function(d) {return colorScale(d.position)});

    
          });
    })

}

var viz2=function(filePath){
    d3.csv(filePath).then(data=>{
        const margin = {top: 100, right: 50, bottom: 100, left: 50},
            width = 800 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        var first_round_college = Object.fromEntries(d3.rollup(data.filter(v => v.draft_round == 1.0), v=>d3.count(v, d=> d.player_id) , d => d.college));

        var all_fr_college = Object.keys(first_round_college);
        all_fr_college.sort();

        var target_data = [];
        var all_val = [];
        for (let i=0; i < all_fr_college.length; i++){
            var cur_col = all_fr_college[i];
            var cur_count = first_round_college[cur_col];
            if (cur_count >= 5) {
                target_data.push({'college': cur_col, 'drafted': cur_count});
                all_val.push(cur_count);
            }
        }


        
        const svg = d3.select("#viz2_plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate("+margin.left+"," +margin.top+")");
        const x = d3.scaleBand().range([ 0, width ]).domain(target_data.map(d => d.college)).padding(0.2);
        const y = d3.scaleLinear().domain([0, d3.max(target_data, d => +d.drafted)]).range([ height, 0]);
        const colorScale = d3.scaleSequentialLog().interpolator(d3.interpolateGreens)
        .domain(d3.extent(all_val));
        svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)").style("font-size", "8px")
        .style("text-anchor", "end");
      

        const tooltip = d3.select("#viz2_plot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "2px")
        .style("padding", "10px")
      
        svg.append("g")
        .call(d3.axisLeft(y));
      
      svg.selectAll("mybar")
        .data(target_data)
        .join("rect")
          .attr("x", d => x(d.college))
          .attr("y", d => y(d.drafted))
          .attr("width", x.bandwidth())
          .attr("height", d => height - y(d.drafted))
          .attr("fill", function(d){return colorScale(d.drafted)})
          .style("stroke-width", 1)
          .style("stroke", "#234")
          .style("opacity", 2)
          .on("mouseover", function(event,d) {
            tooltip.style("opacity", 2);
            d3.select(this).style("stroke", "red").style("opacity", 2);
        })
        .on("mousemove", function(event,d) {
            tooltip.html("College: " + d.college + "<br>" + d.drafted + " players drafted in the 1st round" )
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px");
        })
        .on("mouseleave", function(event,d) {
            tooltip.style("opacity", 2);
            d3.select(this).style("stroke", "#234").style("opacity", 2);
        });

        svg.append("text")
          .attr("x", (width / 2))  
          .attr("class", "title")           
          .attr("y", -30 )
          .attr("text-anchor", "middle")  
          .attr('font-weight', 700)
          .style("font-size", "20px") 
          .text("Number of Players Drafted in the 1st Rounds by College");

          svg.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "middle")
          .attr("x", (width / 2))
          .attr("y", height + 2*margin.bottom/3)
          .text("College");

        svg.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 20)
          .attr("x", -height / 2)
          .text("Number of Players");
      
      })
        


    
}

var viz3=function(filePath){
    d3.csv(filePath).then(data=>{
        var draft_max = d3.max(data, d=> +d.draft_position);
        var draft_min = d3.min(data, d=> +d.draft_position);
        var all_position = [...new Set(data.map(v=>v.position))];
        // console.log(data.length);

        for (let i=0; i< data.length; i++) {
            var cur = data[i];
            var cur_position = +cur['draft_position'];
            cur['draft_score'] = draft_max-cur_position+1;
        }

        var format_data = Object.fromEntries(d3.rollups(data, v=> d3.mean(v, d=>d.draft_score), d=>d.position ,d=>d.draft_team))
        


        var all_vals = []
        for (let i=0; i<all_position.length; i++) {
            d = all_position[i];
            to_iter = format_data[d].length;
            val = {}
            for (let j=0; j<to_iter; j++) {
                c = format_data[d][j][0];
                v = +format_data[d][j][1];
                all_vals.push(+v);
                val[c] = +v;
            }
            format_data[d] = val;
        }
        const all_val = [...new Set(all_vals)];
        all_val.sort();

        // console.log(format_data);

        const margin = {top: 100, right: 50, bottom: 50, left: 150},
            width = 800 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;

        const team = [...new Set(data.map(v=>v.draft_team))];
        team.sort();
        team.reverse();

        const svg = d3.select("#viz3_plot").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleBand().domain(all_position).range([ 0, width ]).padding(0.1);
        const y = d3.scaleBand().domain(team).range([ height, 0 ]).padding(0.1);

        svg.append("g").attr("transform", "translate(0, "+height+")")
        .call(d3.axisBottom(x).tickSize(0)).select(".domain").remove();
        svg.append("g").call(d3.axisLeft(y).tickSize(0)).select(".domain").remove();

        const colorScale = d3.scaleSequential().interpolator(d3.interpolateBlues)
            .domain(d3.extent(all_val));


        const tooltip = d3.select("#viz3_plot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "2px")
        .style("padding", "10px")


        svg.selectAll()
        .data(data, function(d) {return d.position+':'+d.draft_team;})
        .join("rect")
        .attr("x", function(d) { return x(d.position) })
        .attr("y", function(d) { return y(d.draft_team) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return colorScale(format_data[d.position][d.draft_team])} )
        .style("stroke-width", 1)
        .style("stroke", "#234")
        .style("opacity", 2)
        .on("mouseover", function(event,d) {
            tooltip.style("opacity", 2);
            d3.select(this).style("stroke", "red").style("opacity", 2);
        })
        .on("mousemove", function(event,d) {
            tooltip.html(d.draft_team + 
            " has an average<br>score of " + format_data[d.position][d.draft_team].toFixed(2) + " to draft a(n) "+ d.position)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px");
        })
        .on("mouseleave", function(event,d) {
            tooltip.style("opacity", 2);
            d3.select(this).style("stroke", "#234").style("opacity", 2);
        });

        svg.append("text")
        .attr("x", (width / 2))  
        .attr("class", "title")           
        .attr("y", -30 )
        .attr("text-anchor", "middle")  
        .attr('font-weight', 700)
        .style("font-size", "20px") 
        .text("Average Draft Score of Each Position by Team");

        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", (width / 2))
        .attr("y", height + 2*margin.bottom/3)
        .text("Position");

      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Team");

    })

}


var viz4=function(filePath){
    d3.csv(filePath).then(data=>{
        // console.log(data);


        const state_count = Object.fromEntries(d3.rollups(data, v=> d3.count(v, d=>d.player_id), d=>d.birth_state));

        const location = d3.rollup(data, v => Object.fromEntries(["latitude", "longitude"].map(col => [col, d3.mean(v, d => +d[col])])), d=>d.birth_state);
        // console.log(location);
        const states = Object.keys(state_count);
        var target_data = [];
        for (let i=0; i<states.length; i++) {
            target_data.push({'state': states[i], 'counts': +state_count[states[i]]})
        }

        const target_data_final = target_data;




        const margin = {top: 100, right: 30, bottom: 50, left: 30},
            width = 800 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;
        
        const projection = d3.geoAlbersUsa().scale(875).translate([width / 2, height / 2]); 
        const path = d3.geoPath();
        
        const svg = d3.select("#viz4_plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate("+margin.left+"," +margin.top+")");


      let data_map = new Map()
      target_data_final.forEach(function(d) {
      data_map.set(d.state, +d.counts);
    });


  const colorScale = d3.scaleSequential().interpolator(d3.interpolateBlues)
  .domain(
      [0, d3.max(target_data_final, function(d) { return +d.counts;})]
      )


      const tooltip = d3.select("#viz4_plot")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "2px")
      .style("padding", "10px")


      const sizeScale = d3.scaleSequential().domain(
        [0, d3.max(target_data_final, function(d) { return +d.counts;})]
        ).range([10,50]);

      Promise.all([
        d3.json("data/us-states.json")]).then(function(loadData) {
        // console.log(loadData);
        let topo = loadData[0]
                // console.log(topo.features);
                  svg.append("g")
                    .selectAll("path")
                    .data(topo.features)
                    .join("path")
                      // draw each state
                      .attr("d", d3.geoPath().projection(projection))
                      .attr("fill", function (d) {
                        const stateName = d.properties.name;
                        d.total = data_map.get(stateName) || 0;
                        return colorScale(d.total);})
                        .style("stroke-width", 2)
                        .style("stroke", "#234")
                        .style("opacity", 1)
                        .on("mouseover", function(event,d) {
                            tooltip.style("opacity", 1);
                            d3.select(this).style("stroke-width", 2).style("stroke", "red").style("opacity", 1);
                        })
                        .on("mousemove", function(event,d) {
                            tooltip.html(d.properties.name + 
                            " is " + d.total + " drafted<br>player's birth state")
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY) + "px");
                        })
                        .on("mouseleave", function(event,d) {
                            tooltip.style("opacity", 1);
                            d3.select(this).style("stroke-width", 2).style("stroke", "#234").style("opacity", 1);
                        });

        const imageUrl = 'files/result.png';
        svg.selectAll("all_images")
            .data(location)
            .enter()
            .append("image")
            .attr("x", function(d) { return projection([+d[1]["longitude"], +d[1]["latitude"]])[0] - sizeScale(state_count[d[0]]) / 2; })
            .attr("y", function(d) { return projection([+d[1]["longitude"], +d[1]["latitude"]])[1] - sizeScale(state_count[d[0]]) / 2; })
            .attr("width", function(d) { return sizeScale(state_count[d[0]]); })
            .attr("height", function(d) { return sizeScale(state_count[d[0]]); })
            .attr("xlink:href", imageUrl);
      }) 

      svg.append("text")
      .attr("x", (width / 2))  
      .attr("class", "title")           
      .attr("y", 0 )
      .attr("text-anchor", "middle")  
      .attr('font-weight', 700)
      .style("font-size", "20px") 
      .text("Number of Players Drafted by State");


      var padding = 9;
      var innerWidth = width - (padding * 2);
      var barHeight = 8;
      var maxColor = d3.max(target_data_final, v=>v.counts)
      var legend_data = d3.range(0, maxColor).map(d=> ({color:d3.interpolateBlues(d/(maxColor-0)), value:d}))
      var extent = d3.extent(legend_data, d => d.value); 
      var xScale = d3.scaleLinear().range([0, innerWidth]).domain(extent);
      var xTicks = legend_data.filter(f => f.value % 100 === 0).map(d => d.value);
      var xAxis = d3.axisBottom(xScale).tickSize(barHeight * 2).tickValues(xTicks);
      var g = svg.append("g").attr("transform", "translate(0" + ", 450)");
  
      
      var defs = svg.append("defs");
      var linearGradient = defs.append("linearGradient").attr("id", "myGradient");
      linearGradient.selectAll("stop").data(legend_data).enter().append("stop")
      .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
      .attr("stop-color", d => d.color);
  
      g.append("rect").attr("width", innerWidth).attr("height", barHeight).style("fill", "url(#myGradient)");
      g.append("g").call(xAxis).select(".domain").remove();
    
    })

}



var viz5=function(filePath){

d3.csv(filePath).then(data=>{
// Initialize the name variable with a default value
var selected = "All";
    var margin = {top: 100, right: 30, bottom: 50, left: 40},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    var svg = d3.select("#viz5_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

    var all_position = [...new Set(data.map(v=>v.position))];
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(all_position);
        var data_with_pos = data.filter(v => v.current_salary != "");
        var dataa = data.filter(v => v.current_salary != "").map(v => +v.current_salary);
        // console.log(dataa)
        var data_sorted = dataa.sort(d3.ascending)
        var q1 = d3.quantile(data_sorted, .25)
        var median = d3.quantile(data_sorted, .5)
        var q3 = d3.quantile(data_sorted, .75)
        var interQuantileRange = q3 - q1
        var min = q1 - 1.5 * interQuantileRange
        var max = q3 + 1.5 * interQuantileRange
        // Show the X scale
        var lb = 0;
        if (min < 0){
            lb = min*2;
        } else if (min == 0){
            lb = -2;
        } else {
            lb = min / 2
        }
        var ub = d3.max([max*1.5, d3.max(dataa)]);
        // console.log(ub);
        var x = d3.scaleLinear().domain([lb, ub]).range([0, width]);
        svg.append("g")
        .attr('class', 'viz5-x_axis')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
        var center = 200
        var height = 200
        svg
        .append("line")
        .attr('class', 'box')
        .attr("y1", center)
        .attr("y2", center)
        .attr("x1", x(min) )
        .attr("x2", x(max) )
        .attr("stroke", "black")
        .style("stroke-width", 4)

        svg
        .append("rect")
        .attr('class', 'box')
        .attr("y", center - height/2)
        .attr("x", x(q1) )
        .attr("width", (x(q3)-x(q1)) )
        .attr("height", height )
        .attr("stroke", "black")
        .style("stroke-width", 4)
        .style("fill", "#69b3a2")

        svg
        .selectAll("toto")
        .data([min, median, max])
        .enter()
        .append("line")
        .attr('class', 'boxline')
        .attr("y1", center-height/2)
        .attr("y2", center+height/2)
        .attr("x1", function(d){ return(x(d))} )
        .attr("x2", function(d){ return(x(d))} )
        .attr("stroke", "black")
        .style("stroke-width", 4)

        const tooltip = d3.select("#viz5_plot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "2px")
        .style("padding", "10px")


        var jitterWidth = 130
        svg
        .selectAll("indPoints")
        .data(data_with_pos)
        .enter()
        .append("circle")
        .attr('class', 'box-point')
        .attr("cx", function(d){return x(d.current_salary)})
        .attr("cy", function(d){return center - jitterWidth/2 + Math.random()*jitterWidth})
        .attr("r", 4)
        .style("fill", function(d){return colorScale(d.position)})
        .attr("stroke", "black")
        .on("mouseover", function(event,d) {
            tooltip.style("opacity", 1);
            d3.select(this).style("stroke", "red").style("opacity", 2);
        })
        .on("mousemove", function(event,d) {
            tooltip.html("Player: " + d.name + 
            "<br>Position: " + d.position +  
            "<br>Current Team: " + d.current_team + 
            "<br>Current Salary: $" + d.current_salary*1000
            )
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px");
        })
        .on("mouseleave", function(event,d) {
            tooltip.style("opacity", 0);
            d3.select(this).style("stroke", "black").style("opacity", 0.8);
        });

        svg.append("text")
          .attr("x", (width / 2))  
          .attr("class", "viz5-title")           
          .attr("y", 0 )
          .attr("text-anchor", "middle")  
          .attr('font-weight', 700)
          .style("font-size", "20px") 
          .text("Active Player's Salary in Thousands of Dollars (Position: "+ selected +")");

          svg.append("text")
          .attr("class", "viz5-x-label")
          .attr("text-anchor", "middle")
          .attr("x", (width / 2))
          .attr("y", height + 190)
          .text("Salary ($1,000)");


        d3.select("select").on("change",function(d){
           selected = d3.select("#d3-dropdown").node().value;
           if (selected == 'All'){
            data_with_pos = data.filter(v => v.current_salary != "");
            dataa = data.filter(v => v.current_salary != "").map(v => +v.current_salary);
           } else{
            data_with_pos = data.filter(v => v.current_salary != "" & v.position == selected);
            dataa = data.filter(v => v.current_salary != "" & v.position == selected).map(v => +v.current_salary);
           }
    data_sorted = dataa.sort(d3.ascending);
    q1 = d3.quantile(data_sorted, .25)
    median = d3.quantile(data_sorted, .5)
    q3 = d3.quantile(data_sorted, .75)
    interQuantileRange = q3 - q1
    min = q1 - 1.5 * interQuantileRange
    max = q3 + 1.5 * interQuantileRange

    if (min < 0){
         lb = min*2;
    } else if (min == 0){
         lb = -2;
    } else {
         lb = min / 2
    }
    ub = d3.max([max*1.5, d3.max(dataa)]);
    x = d3.scaleLinear().domain([lb, ub]).range([0, width]);
    x_axis = d3.axisBottom(x);
    d3.selectAll("g.viz5-x_axis").transition().duration(500).call(x_axis);
    d3.selectAll('line.box')
        .attr("y1", center)
        .attr("y2", center)
        .attr("x1", x(min) )
        .attr("x2", x(max) )
        .attr("stroke", "black")
        .style("stroke-width", 4);

        d3.selectAll('rect.box')
        .attr("y", center - height/2)
        .attr("x", x(q1) )
        .attr("width", (x(q3)-x(q1)) )
        .attr("height", height )
        .attr("stroke", "black")
        .style("stroke-width", 4)
        .style("fill", "#69b3a2")

        d3.selectAll('line.boxline').data([min, median, max])
        .attr("y1", center-height/2)
        .attr("y2", center+height/2)
        .attr("x1", function(d){ return(x(d))} )
        .attr("x2", function(d){ return(x(d))} )
        .attr("stroke", "black")
        .style("stroke-width", 4)

        d3.selectAll('circle.box-point').remove();

        svg
        .selectAll("indPoints")
        .data(data_with_pos)
        .enter()
        .append("circle")
        .attr('class', 'box-point')
        .attr("cx", function(d){return x(d.current_salary)})
        .attr("cy", function(d){return center - jitterWidth/2 + Math.random()*jitterWidth})
        .attr("r", 4)
        .style("fill", function(d){return colorScale(d.position)})
        .attr("stroke", "black")
        .on("mouseover", function(event,d) {
            tooltip.style("opacity", 1);
            d3.select(this).style("stroke", "red").style("opacity", 2);
        })
        .on("mousemove", function(event,d) {
            tooltip.html("Player: " + d.name + 
            "<br>Position: " + d.position +  
            "<br>Current Team: " + d.current_team + 
            "<br>Current Salary: $" + d.current_salary*1000
            )
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px");
        })
        .on("mouseleave", function(event,d) {
            tooltip.style("opacity", 0);
            d3.select(this).style("stroke", "black").style("opacity", 0.8);
        });

        d3.selectAll("text.viz5-title").text("Active Player's Salary in Thousands of Dollars (Position: "+ selected +")");
    
  });

})

}

