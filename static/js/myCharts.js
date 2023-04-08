function replaceChartCanvas() {
    // replacing canvas element to be able to overwrite potential previous graph
    document.getElementById('chart-canvas').remove()
    ctx = document.createElement("canvas")
    ctx.id = "chart-canvas"
    ctx.style.minWidth = "100%"
    ctx.style.minHeight = "100%"
    document.getElementById('chart-modal-body').prepend(ctx)
    return ctx 
}

function createOneInputChart(ctx, labels, data, year, chartType) {
    var pieChart = new Chart(ctx, {
      type: chartType,
      data: {
          labels: labels,
          datasets: [{
              // label: 'bostedDist1850',
              data: data,
              borderWidth: 1
          }]
      },
      options: {
          layout: {
            padding: {
              bottom: 10
            }
          },
          responsive: false,
          scales: {
          },
          plugins: {
              title: {
                  display: true,
                  text: year
              },
              customCanvasBackgroundColor: {
                color: 'white',
              }
  
          },
          animation: {
            //option to download chart as a png image
            onComplete: function() {
              pieDownload = document.querySelector("#chart-download")
              pieDownload.style.visibility = "visible"
              pieDownload.href = pieChart.toBase64Image()
              pieDownload.download = "chart_image.png"
            }
          }
      },
      //custom plugins to create proper background for the downloaded image
      //see https://www.chartjs.org/docs/latest/configuration/canvas-background.html#color
      plugins: [
        {
          id: 'customCanvasBackgroundColor',
          beforeDraw: (chart, args, options) => {
            const {ctx} = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#90ffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          }
        }
      ]
    });
  }

function oneInputChart(chartType) {
    //to be able to overwrite old previously used canvas
    ctx = replaceChartCanvas()
    console.log("was replaced")

    // make ajax call to get labels and data
    xVal = document.querySelector('input[name="x"]:checked').value;
    year = document.querySelector('input[name="year"]:checked').value;
    console.log("xVal is: " + xVal)
    console.log("year is: " + year)
    fetch(`one_input_chart/?x_val=${xVal}&year=${year}`, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    .then(response => response.json())
    .then(res => {
        labels = res["labels"]
        data = res["data"] 
        console.log(labels);
        console.log(data)
        console.log("number of datapoint: " + labels.length)
    
        //creating chart with the previously created canvas and the fetched data  
        createOneInputChart(ctx, labels, data, year, chartType)    
      });
}


function showOneInputChart() {

    pieBtn = document.querySelector("#pie-btn")
    barBtn = document.querySelector("#bar-btn")
    lineBtn = document.querySelector("#line-btn")

    pieBtn.addEventListener("click", () => oneInputChart('pie'))
    console.log("pie event lsitener")
    barBtn.addEventListener("click", () => oneInputChart('bar'))
    console.log("bar event lsitener")
    lineBtn.addEventListener("click", () => oneInputChart('line'))
    console.log("bar event lsitener")
  }
  
  