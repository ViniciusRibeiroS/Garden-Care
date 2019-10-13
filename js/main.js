
//set graph info to chart js

function define_label(response, label){

	label_info = {"graph_title": "Solo Humidity", "field_num": "field1", "unity_item": "water/m³ of Soil", "color": "#dc3545", "yaxis":"water/m³ of Soil", "subtitle": "Solo Humidity"};
	

	if(label == "Humidity")
	{
		label_info["graph_title"] = "Humidity";
		label_info["field_num"] = "field2";
		label_info["unity_item"] = "w";
		label_info["color"] = "#ffc107";
		label_info["yaxis"] = "Humidity";
		label_info["subtitle"] = "Humidity";
	}
	else if(label == "Artificial Light")
	{
		label_info["graph_title"] = "Artificial Light";
		label_info["field_num"] = "field3";
		label_info["unity_item"] = "db";
		label_info["color"] = "#343a40";
		label_info["yaxis"] = "Artificial Light";
		label_info["subtitle"] = "Artificial Light";

	}else if(label == "Sun Light"){

		label_info["graph_title"] = "Sun Light";
		label_info["field_num"] = "field4";
		label_info["unity_item"] = "UV Light";
		label_info["color"] = "#17a2b8";
		label_info["yaxis"] = "UV Light";
		label_info["subtitle"] = "Sun Light"
	}
	
	return label_info;	
}

//fll the correspondent field dataset to put in chartjs

function fill_dataset(response_feed, field_num){
	console.log(field_num);

	data_graph = {"labels":[], "feeds":[]};

	for (var i =  0; i < response_feed["feeds"].length; i++) {

		if(i%10 == 0) data_graph["labels"][i] = response_feed["feeds"][i]["created_at"].substr(11, 5);
		data_graph["feeds"][i] = response_feed["feeds"][i][field_num];
	}

	return data_graph;
}



//calls chart js to make the graph
function generate_graph(title, dataset, labels, unity_item, line_color, y_label, subtitle){

	var ctx = document.getElementById("access_chart").getContext('2d');
	var myChart = new Chart(ctx, {
		type: 'line',
		data: 
		{
			labels: labels,
			datasets: 
			[{
				label: subtitle,
				data: dataset,
				backgroundColor: [line_color],
				borderColor: [line_color],
				borderWidth: 4,
				pointBackgroundColor: 'rgba(0, 0, 0, 0.0)',
				pointBorderColor: 'rgba(0, 0, 0, 0.0)',
				fill:false
			}]
		},
		options: {
			title: {
				display: true,
				text: title
			},
			scales: {
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: y_label
					}
				}],
				xAxes: [{
					time: {
						unit: 'hour'
					},
					scaleLabel: {
						display: true,
						labelString: 'Tempo'
					}
				}]
			}
		}
	});



	return myChart;
}



//calc the humidity, temperature and noise averages
function averages(data){

	f1 = 0.00, f2 = 0.00, f3 = 0.00, f4 = 0.00;

	for (var i = 0; i < data.length; i++) 
	{
		if(!isNaN(data[i]['field1']) && (data[i]['field1'] != null)) f1 += parseFloat(data[i]['field1']);
		if(!isNaN(data[i]['field2']) && (data[i]['field2'] != null)) f2 += parseFloat(data[i]['field2']);
	    if(!isNaN(data[i]['field3']) && (data[i]['field3'] != null)) f3 += parseFloat(data[i]['field3']);
		if(!isNaN(data[i]['field4']) && (data[i]['field4'] != null)) f4 += parseFloat(data[i]['field4']);
	}

	if(!isNaN(f1))
	{
		f1 = f1/data.length * 4;
		f1 = f1.toPrecision(2);
	}else{
		f1 = "--"
	}

	if(!isNaN(f2)){
		f2 = f2/data.length * 4;
		f2 = f2.toPrecision(2);
	}else{
		f2 = "--"
	}

	if(!isNaN(f3)){
		f3 = f3/data.length * 4;
		f3 = f3.toPrecision(2);
	}else{
		f3 = "--"
	}

	if(!isNaN(f4)){
		f4 = f4/data.length * 4;
		f4 = f4.toPrecision(2);
	}else{
		f4 = "--"
	}

	avgs = {'Solo_Humidity': f1, 'Humidity' : f2, 'Artificial_Light': f3, 'Sun_Light': f4};

	console.log(avgs);

	return avgs;
}




//fucntion to get url piece parameter value from: https://davidwalsh.name/query-string-javascript
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

//manage all process and makes the request to thingspeak's APi
function tsp_request(init, end, field){
	$.get( "https://api.thingspeak.com/channels/806199/feeds.json?start="+init+"&end="+end+"&timezone=America/Sao_Paulo", function( data ) {
		
		$("#total_entrys").text(data["channel"]["last_entry_id"]);
		$("#last_entry").text(data["channel"]["created_at"].substr(11, 5) + " | ");
		
		//graph functions
		graph_info = define_label(data, field);
		//data_graph = fill_dataset(data, graph_info["field_num"]);
		//chart = generate_graph(graph_info["graph_title"], data_graph["feeds"], data_graph["labels"], graph_info["unity_item"], graph_info["color"], graph_info["yaxis"], graph_info["subtitle"]);
	
		//statiistics function
		avgs = averages(data['feeds']);
		
		$("#avg_SHumidity").text(avgs['Solo_Humidity']+" Water/m³");
		$("#avg_Humy").text(avgs['Humidity'] + " Water Vapor/Air");
		$("#avg_Alight").text(avgs['Artificial_Light']+ " Lx");
		$("#avg_Slight").text(avgs['Sun_Light']+ " UV");
		

		// chart.destroy();
		// chart = generate_graph("Temperatura da sala", data_graph["feeds"], data_graph["labels"], graph_info["unity_item"], graph_info["color"], "temperatura em ºC");
	})
	.fail(function() {
		console.log( "error" );
	})
	
	
}

$('document').ready(function(){

	var pageURL = $(location).attr("href");
	//media de consumo de energia
	if(location.search == ""){

		var init =  new Date(), end = new Date();
		
		init.setHours(init.getHours() - 2);
		init = moment(init).format();
		end = moment(end).format();

		tsp_request(init, end, "Solo_Humidity");

	}else{

		field = getUrlParameter("field"); init = getUrlParameter("init"); end = getUrlParameter("end");

		init = moment(init).format();
		end = moment(end).format();

		$("#field_opt").val(field);

		tsp_request(init, end, field);
	}

	$("#init").val(moment(init).format());
	$("#end").val(moment(end).format());
});
