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

function stackedOption(chartType) {
    if (chartType === "bar") {
        const scales = {x: { stacked: true},y: {stacked: true}}
        return scales
    } else {
        return {}
    } 
}

function createOneInputChart(ctx, labels, data, year, chartType, datasetLabel) {
    console.log({datasetlabel: datasetLabel})
    console.log({ctx: ctx})
    let titleText = year
    if (datasetLabel === "sogn_by" && chartType !== "pie") {
        titleText += " - største 20 sogn" 
    }
    var myChart = new Chart(ctx, {
      type: chartType,
      data: {
          labels: labels,
          datasets: [{
            //   label: datasetLabel,
              data: data,
              borderWidth: 1
          }],
      },
      options: {
          layout: {
            padding: {
              bottom: 10
            }
          },
          responsive: true,
          scales: {
          },
          plugins: {
            //   legend: {
            //     display: false
            //   },
              title: {
                  display: true,
                  text: titleText
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
          datasets: datasets,
      },
      options: {
          layout: {
            padding: {
              bottom: 10
            }
          },
          responsive: true,
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
          },
          scales: stackedOption(chartType)
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

function pyramidScalesOption(absRatio) {
    const scales = {
        x: { 
            stacked: true,
            ticks: {
                callback: (val) => (Math.abs(val))
            }
        },
        y: {
            stacked: true}
    }
    if (absRatio === "ratio") {
        scales['x'].ticks = {
            callback: (val) => (Math.abs(val)) + "%"
        }
    }
    return scales
}

function createPopulationPyramid(ctx, labels, datasets, year, chartType, absRatio) {
    console.log({pyramidDatasetse: datasets})
    var myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            parsing: true,
            layout: {
              padding: {
                bottom: 10
              }
            },
            responsive: true,
            // scales: {
            // },
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
                tooltip: {
                    callbacks: {
                        label : function(context) {
                            return Number.parseFloat(Math.abs(context.parsed.x)).toFixed(3)
                        }
                    }
                },
                // datalabels: {
                //   anchor: 'end',
                //   align: 'top',
                //   formatter: Math.round,
                //   font: {
                //       weight: 'bold'
                //   }
                // }
    
            },
            animation: {
              //option to download chart as a png image when animation is done
              onComplete: function() {
                pieDownload = document.querySelector("#chart-download")
                pieDownload.style.visibility = "visible"
                pieDownload.href = myChart.toBase64Image()
                pieDownload.download = "chart_image.png"
              }
            },
            indexAxis: 'y', 
            scales: pyramidScalesOption(absRatio)
            // scales: {
            //     y: {
            //         stacked: true,
            //         grid: {
            //             display: false
            //         }
            //     },
            //     x: {
            //         min: 0,
            //         max: 100000,
            //     }
            // }
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

function getSelectedVals() {
    xSelected = document.querySelector('input[name="x"]:checked')
    ySelected = document.querySelector('input[name="y"]:checked')
    zSelected = document.querySelector('input[name="z"]:checked')

    
    var selectedVals = []
    if (xSelected) {
        selectedVals.push({varName: "x_val", varValue: xSelected.value})
        if (ySelected) {
            selectedVals.push({varName: "y_val", varValue: ySelected.value})
            if (zSelected) {
                selectedVals.push({varName: "z_val", varValue: zSelected.value})
            }
       }
    }
    return selectedVals
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
        labels = res["labels"]
        datasets = res["datasets"] 
        console.log({twoinputdatasets: datasets})
        createTwoInputChart(ctx, labels, datasets, year, chartType) 
      });
       
}

function getPopulationPyramid(url, chartType, absRatio) {
    fetch(url, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    .then(response => response.json())
    .then(res => {
        labels = res["labels"]
        datasets = res["datasets"] 
        createPopulationPyramid(ctx, labels, datasets, year, chartType, absRatio) 
      });
}

function getOneInputChart(url, chartType) {
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
        createOneInputChart(ctx, labels, data, year, chartType, datasetLabel)  
      });
      
}

// function buildFetchUrl(startString, year, selectedVals, searchCategory, query) {
//     url = `${startString}_input_chart/?year=${year}&search_category=${searchCategory}&query=${query}`
//     selectedVals.forEach(function(item) {
//         url += `&${item["varName"]}=${item["varValue"]}`
//     })
//     return url
// }

function buildFetchUrl(startString, selectedVals, queryParams, chartType) {
    url = `${startString}/?year=${queryParams.year}&search-category-1=${queryParams.searchCategory1}&q1=${queryParams.query1}&search-category-2=${queryParams.searchCategory2}&q2=${queryParams.query2}&combine=${queryParams.combine}&chartType=${chartType}&absRatio=${queryParams.absRatio}`
    selectedVals.forEach(function(item) {
        url += `&${item["varName"]}=${item["varValue"]}`
    })
    return url
}

function getAbsRatio() {
    const absRatioBtns = document.getElementsByName("abs-ratio")
    for (const btn of absRatioBtns) {
        if (btn.checked) {
            return btn.value
        }
    }
}

function retrieveQueryParams() {
    year = sessionStorage.getItem("year")
    searchCategory1 = sessionStorage.getItem("searchCategory1")
    query1 = sessionStorage.getItem("query1")
    searchCategory2 = sessionStorage.getItem("searchCategory2")
    query2 = sessionStorage.getItem("query2")
    combine = sessionStorage.getItem("combine")
    absRatio = getAbsRatio()
    return {year:year, searchCategory1: searchCategory1, query1: query1, searchCategory2: searchCategory2, query2: query2, combine:combine, absRatio: absRatio}
} 


function getChart(chartType) {
    ctx = replaceChartCanvas()
    selectedVals = getSelectedVals()
    queryParams = retrieveQueryParams()
    // remember to make check somewhere that at least the x variable has to be chosen in order to get a chart
    if (selectedVals.length === 1) {
        url = buildFetchUrl("one_input_chart", selectedVals, queryParams, chartType)
        if (chartType == "pie") {
            document.getElementById("modal-size").classList.remove('modal-xl');
        } else {
            document.getElementById("modal-size").classList.add('modal-xl');
        }
        getOneInputChart(url, chartType)
        
    }
    else if (selectedVals.length === 2) {
        document.getElementById("modal-size").classList.add('modal-xl');
        if (chartType === "pyramid") {
            url = buildFetchUrl("population_pyramid", selectedVals, queryParams, chartType)
            getPopulationPyramid(url, chartType, queryParams.absRatio)
        } else {
            url = buildFetchUrl("two_input_chart", selectedVals, queryParams, chartType)
            getTwoInputChart(url, chartType)
        }
    }
}

function showChart() {
    pieBtn = document.querySelector("#pie-btn")
    barBtn = document.querySelector("#bar-btn")
    lineBtn = document.querySelector("#line-btn")
    pyramidBtn = document.querySelector("#pyramid-btn")

    pieBtn.addEventListener("click", () => getChart('pie'))
    barBtn.addEventListener("click", () => getChart('bar'))
    lineBtn.addEventListener("click", () => getChart('line'))
    pyramidBtn.addEventListener("click", () => getChart('pyramid'))
}  
  