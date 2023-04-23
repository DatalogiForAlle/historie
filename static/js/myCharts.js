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

function createOneInputChart(ctx, labels, data, year, chartType, datasetLabel) {
    var myChart = new Chart(ctx, {
      type: chartType,
      data: {
          labels: labels,
          datasets: [{
            //   label: datasetLabel,
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
            //   legend: {
            //     display: false
            //   },
              title: {
                  display: true,
                  text: year
              },
              customCanvasBackgroundColor: {
                color: 'white',
              }
  
          },
          animation: {
            //option to download chart as a png image when animation is done
            onComplete: function() {
              pieDownload = document.querySelector("#chart-download")
              pieDownload.style.visibility = "visible"
              pieDownload.href = myChart.toBase64Image()
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

  function createTwoInputChart(ctx, labels, datasets, year, chartType) {
    var myChart = new Chart(ctx, {
      type: chartType,
      data: {
          labels: labels,
          datasets: datasets
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
            //   legend: {
            //     display: false
            //   },
              title: {
                  display: true,
                  text: year
              },
              customCanvasBackgroundColor: {
                color: 'white',
              },
              datalabels: {
                anchor: 'end',
                align: 'top',
                formatter: Math.round,
                font: {
                    weight: 'bold'
                }
            }
  
          },
          animation: {
            //option to download chart as a png image when animation is done
            onComplete: function() {
              pieDownload = document.querySelector("#chart-download")
              pieDownload.style.visibility = "visible"
              pieDownload.href = myChart.toBase64Image()
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

    
    // if (xSelected) {
    //     selectedVals.push({xVal: xSelected.value})
    // }
    // if (ySelected) {
    //      selectedVals.push({yVal: ySelected.value})
    // }
    // if (zSelected) {
    //     selectedVals.push({zVal: zSelected.value})
    // }
    // return selectedVals

// function buildFetchUrl(year, selectedVals) {
//     url = `one_input_chart/?year=${year}`

//     url = selectedVals.reduce(
//         (acc, cur) => acc + `?`
//     )

//     selectedVals.map
//     if (xSelected) {
//         url += `&x_val=${xSelected.value}`
//         if (ySelected) {
//             url += `&y_val=${xSelected.value}`
//         }
//     }
// }

// function getSelectedVals() {
//     xSelected = document.querySelector('input[name="x"]:checked')
//     ySelected = document.querySelector('input[name="y"]:checked')
//     zSelected = document.querySelector('input[name="z"]:checked')
//     url = `one_input_chart/?year=${year}`

//     selectedVals = []
//     if (xSelected) {
//         url += `&x_val=${xSelected.value}`
//         if (ySelected) {
//             url += `&y_val=${ySelected.value}`
//         }
//         else {

//         }
//     }
//     else {
//         console.log("no variables chosen for graph")
//     }

function getSelectedVals() {
    xSelected = document.querySelector('input[name="x"]:checked')
    ySelected = document.querySelector('input[name="y"]:checked')
    zSelected = document.querySelector('input[name="z"]:checked')

    console.log("x selected: " + xSelected)
    
    var selectedVals = []
    if (xSelected) {
        console.log("inside xselsected")
        selectedVals.push({varName: "x_val", varValue: xSelected.value})
        console.log(selectedVals[0])
        if (ySelected) {
            console.log("insice y selected")
            selectedVals.push({varName: "y_val", varValue: ySelected.value})
            if (zSelected) {
                selectedVals.push({varName: "z_val", varValue: zSelected.value})
            }
       }
    }
    console.log(selectedVals[0])
    return selectedVals
}

function buildFetchUrl(startString, year, selectedVals) {
    url = `${startString}_input_chart/?year=${year}`
    selectedVals.forEach(function(item) {
        url += `&${item["varName"]}=${item["varValue"]}`
    })
    return url
}

function getTwoInputChart(url, chartType) {
    fetch(url, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    .then(response => response.json())
    .then(res => {
        console.log("inside getTwoInputChart")
        // console.log({res: res})
        labels = res["labels"]
        datasets = res["datasets"] 
        // datasetLabel = res["datasetLabel"]
        // console.log(labels);
        // console.log(data)
        // console.log("number of datapoint: " + labels.length) 
        createTwoInputChart(ctx, labels, datasets, year, chartType) 
      });
       
}

function getOneInputChart(url, chartType) {
    console.log("url is: " + url)
    fetch(url, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    .then(response => response.json())
    .then(res => {
        labels = res["labels"]
        data = res["data"] 
        datasetLabel = res["datasetLabel"]
        console.log(labels);
        console.log(data)
        console.log("number of datapoint: " + labels.length) 
        createOneInputChart(ctx, labels, data, year, chartType, datasetLabel)  
      });
      
}

function getChart(chartType) {
    ctx = replaceChartCanvas()
    selectedVals = getSelectedVals()
    console.log({selectedVals: selectedVals})
    year = document.querySelector('input[name="year"]:checked').value;
    // remember to make check somewhere that at least the x variable has to be chosen in order to get a chart
    if (selectedVals.length === 1) {
        url = buildFetchUrl("one", year, selectedVals)
        getOneInputChart(url, chartType)
        
    }
    else if (selectedVals.length === 2) {
        console.log("we are getting chart with two vars")
        url = buildFetchUrl("two", year, selectedVals)
        getTwoInputChart(url, chartType)
    }
}

function showChart() {
    pieBtn = document.querySelector("#pie-btn")
    barBtn = document.querySelector("#bar-btn")
    lineBtn = document.querySelector("#line-btn")

    pieBtn.addEventListener("click", () => getChart('pie'))
    console.log("pie event lsitener")
    barBtn.addEventListener("click", () => getChart('bar'))
    console.log("bar event lsitener")
    lineBtn.addEventListener("click", () => getChart('line'))
    console.log("bar event lsitener")
}


// function oneInputChart(chartType) {
//     getChart()

//     //to be able to overwrite old previously used canvas
//     ctx = replaceChartCanvas()
//     console.log("was replaced")

//     //extracting the choies for x, y, z variables
//     xVal = document.querySelector('input[name="x"]:checked').value;
//     // yVal = document.querySelector('input[name="y"]:checked').value;
//     // zVal = document.querySelector('input[name="z"]:checked').value;
//     year = document.querySelector('input[name="year"]:checked').value;
//     console.log("year is: " + year)
//     // console.log("xVal is: " + xVal)
//     // console.log("yVal is: " + yVal)
    

//     // make ajax call to get labels and data
//     fetch(`one_input_chart/?year=${year}&x_val=${xVal}`, {
//         method: "GET",
//         headers: {
//             "X-Requested-With": "XMLHttpRequest",
//         }
//     })
//     .then(response => response.json())
//     .then(res => {
//         labels = res["labels"]
//         data = res["data"] 
//         datasetLabel = res["datasetLabel"]
//         console.log(labels);
//         console.log(data)
//         console.log("number of datapoint: " + labels.length)
    
//         //creating chart with the previously created canvas and the fetched data  
//         createOneInputChart(ctx, labels, data, year, chartType, datasetLabel)    
//       });
// }


// function showOneInputChart() {

//     pieBtn = document.querySelector("#pie-btn")
//     barBtn = document.querySelector("#bar-btn")
//     lineBtn = document.querySelector("#line-btn")

//     // pieBtn.outerHTML = pieBtn.outerHTML
//     // barBtn.outerHTML = barBtn.outerHTML
//     // lineBtn.outerHTML = lineBtn.outerHTML

//     pieBtn.addEventListener("click", () => oneInputChart('pie'))
//     console.log("pie event lsitener")
//     barBtn.addEventListener("click", () => oneInputChart('bar'))
//     console.log("bar event lsitener")
//     lineBtn.addEventListener("click", () => oneInputChart('line'))
//     console.log("bar event lsitener")
//   }
  
  