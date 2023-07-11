function replaceChartCanvas(elmType) {
    // replacing canvas element to be able to overwrite potential previous graph
    document.getElementById('chart-canvas').remove()
    ctx = document.createElement(elmType)
    ctx.id = "chart-canvas"
    ctx.style.minWidth = "100%"
    ctx.style.minHeight = "100%"
    document.getElementById('chart-modal-body').prepend(ctx)

    //if used for agg list, have scroll bar inside the modal body
    // const modalBody = document.getElementById("chart-modal-body")
    // if (elmType==="div") {
    //     modalBody.style = "height: 80vh; overflow-y: auto"

    //     // modalBody = document.getElementById('chart-modal')
    //     // modalBody.addEventListener('scroll', function(event) {
    //     //     console.log("Scrolling");
    //     // });
    // } else {
    //     modalBody.style = ""
    // }
    return ctx 
}

function replaceListCanvas() {
    document.getElementById('list-canvas').remove()
    ctx = document.createElement("div")
    ctx.id = "list-canvas"
    ctx.style.minWidth = "100%"
    ctx.style.minHeight = "100%"
    document.getElementById('list-modal-body').prepend(ctx)

    // a hacky fix to the problem of the loadBtn eventhandler "remembering" old values of the modalPage variable: remove the old btn and remake it
    document.getElementById('load-btn').remove()
    loadBtn = document.createElement("button")
    loadBtn.type="button"
    loadBtn.id = "load-btn"
    loadBtn.className = "btn btn-primary float-middle"
    loadBtn.append("Load more")
    document.getElementById('list-modal-body').append(loadBtn)

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
    ctx = replaceChartCanvas("canvas")
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

async function fetchAggregationList(url) {
    // loadBtn.disabled = true
    let response = await fetch(url, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    result = await response.json()
    return result
    // console.log({resultIs: result})
    // const data = result["data"]
    // const lastPage = result["lastPage"]
    // console.log({dataIs: data})
    // console.log({lastPageIs: lastPage})
    // createAggregationDisplay(data, lastPage, loadBtn)
}

// function fetchAggregationList(url, loadBtn) {
//     fetch(url, {
//         method: "GET",
//         headers: {
//             "X-Requested-With": "XMLHttpRequest",
//         }
//     })
//     .then(response => response.json())
//     .then(res => {
//         data = res["data"]
//         isLastPage = res["lastPage"]
//         console.log({daatIS: data})
//         createAggregationDisplay(data, loadBtn)
//         // createList(data)
//       });
// }

function createAggregationDisplay(aggregationList, lastPage, loadBtn) {
    if (lastPage) {
        for (const elm of aggregationList) {
            ctx.insertAdjacentHTML("beforeend", `
            <p> 
                ${elm.husstands_id} : ${elm.total}
            </p>
            `)}
        ctx.insertAdjacentHTML("beforeend", `
            <p> 
                Ikke flere elementer at vise
            </p>
        `)
        loadBtn.disabled = true
    } else {
        for (const elm of aggregationList) {
        
            ctx.insertAdjacentHTML("beforeend", `
            <p> 
                ${elm.husstands_id} : ${elm.total}
            </p>
            `)
        }
        loadBtn.disabled = false
    }
}

function insertAggregationList(aggregationList, lastPage, aggregationListElm, loadBtn) {
    if (lastPage) {
        for (const elm of aggregationList) {
            aggregationListElm.insertAdjacentHTML("beforeend", `
            <p> 
                ${elm}
            </p>
            `)}
        aggregationListElm.insertAdjacentHTML("beforeend", `
            <p> 
                Ikke flere elementer at vise
            </p>
        `)
        loadBtn.disabled = true
    } else {
        for (const elm of aggregationList) {
        
            aggregationListElm.insertAdjacentHTML("beforeend", `
            <p> 
                ${elm}
            </p>
            `)
        }
        loadBtn.disabled = false
    }
}

function createAggregationOverview(result, selectedVals, queryParams, chartType) {
    const aggregationOverview = result["aggregationOverview"]
    // const aggregationList = result["data"]
    // const 
    // console.log({aggOverView: aggregationOverview})
    listCanvas = document.getElementById("list-canvas")
    accordion = document.createElement("div")
    accordion.className = "accordion"
    accordion.id = "accordion"

    for (const [key, value] of Object.entries(aggregationOverview)) {

        // let modalPage = 1 
        // url = buildFetchUrl("aggregation_list", selectedVals, queryParams, chartType)
        // // url += `&key=${key}`
        // url += `&page=${modalPage}`
        // console.log({aggUrl: url})
        // loadBtn.disabled = true
        // console.log({key: key})
        // console.log({hidRes: result["firstHidResults"][key]})
    
        const loadBtn = document.createElement("button")
        loadBtn.type = "button"
        loadBtn.className = "btn btn-primary float-middle"
        loadBtn.id = `load-btn-${key}`
        loadBtn.innerText = "Indlæs flere"

        const aggregationListElm = document.createElement('div') 
        aggregationListElm.className = "accordion-body"
        aggregationListElm.id=`accordion-body-${key}`

        let modalPage = 1 //page=1 is used on initial load of first elements
        loadBtn.addEventListener("click", function() {
            loadBtn.disabled = true
            url = buildFetchUrl("aggregation_list", selectedVals, queryParams, chartType)
            modalPage += 1
            // console.log({key: key})
            // console.log({modalPage: modalPage})
            url += `&key=${key}`
            url += `&page=${modalPage}`
            fetchAggregationList(url, loadBtn).then(result => {
                const isLastPage = result["lastPage"]
                hidResults = result["hidResults"]
                totalHids = result["totalAmountOfHids"]
                // console.log({hidResults: hidResults})
                console.log({key: key})
                console.log({modalPage: modalPage})
                console.log({totalHIds: totalHids})
                insertAggregationList(hidResults, isLastPage, aggregationListElm, loadBtn)
            })

        })

        const firstHidResults = result["firstHidResults"][key].hids
        const isLastPage =result["firstHidResults"][key].lastPage

        insertAggregationList(firstHidResults, isLastPage, aggregationListElm, loadBtn)
        console.log({agglistelm: aggregationListElm})

        accordionItem = document.createElement("div")
        accordionItem.className = "accordion-item"
        accordion.insertAdjacentElement("beforeend", accordionItem)

        accordionItem.insertAdjacentHTML('beforeend', `
            <h2 class="accordion-header" id="panelsStayOpen-heading${key}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapse${key}" aria-expanded="true" aria-controls="panelsStayOpen-collapse${key}">
                    ${key} individ(er) i husholdningen (totalt antal: ${value})
                </button>
            </h2>
        `)

        const accordionCollapse = document.createElement("div")
        accordionItem.insertAdjacentElement("beforeend", accordionCollapse)
        accordionCollapse.id = `panelsStayOpen-collapse${key}`
        accordionCollapse.className = "accordion-collapse collapse"
        // accordionCollapse.insertAdjacentHTML("beforeend", `
        //     <div class="accordion-body" id="accordion-body-${key}">
        //         results here
        //     </div> ` )
        accordionCollapse.insertAdjacentElement("beforeend", aggregationListElm)
        accordionCollapse.insertAdjacentElement("beforeend", loadBtn)

        

        

        // load first page of results by default when creating the accordion
    //     <button type="button" id="load-btn-${key}" class="btn btn-primary float-middle">
    //     Load more
    // </button>
        
    }
    
    listCanvas.append(accordion)

}

function getAggregationList(chartType) {
    // ctx = replaceChartCanvas("div")
    let modalPage = 1
    
    // ctx = document.getElementById("list-canvas")
    ctx = replaceListCanvas()
    selectedVals = getSelectedVals()
    queryParams = retrieveQueryParams()
    const loadBtn = document.getElementById("load-btn")
    

    if (selectedVals.length === 1) {
        url = buildFetchUrl("aggregation_list", selectedVals, queryParams, chartType)
        url += `&page=${modalPage}`
        console.log({aggUrl: url})
        // loadBtn.disabled = true
        fetchAggregationList(url, loadBtn).then(result => {
            createAggregationOverview(result, selectedVals, queryParams, chartType)
        })
    }

    // console.log({originalModalPageIs: modalPage})
    // loadBtn.addEventListener("click", function() {
    //     this.disabled = true
    //     url = buildFetchUrl("aggregation_list", selectedVals, queryParams, chartType)
    //     modalPage += 1  //remember to fix this so it starts at 1
    //     console.log({modalPageIs: modalPage})
    //     url += `&page=${modalPage}`
    //     console.log({aggUrlLoadMore: url})

    //     fetchAggregationList(url, loadBtn).then(result => {
    //         createAggregationDisplay(result["data"], result["lastPage"], loadBtn)
    //     })
        
    // })
}

function insertListModalButtons() {
    listCanvas = document.getElementById("list-canvas")
}

function showChart() {
    pieBtn = document.querySelector("#pie-btn")
    barBtn = document.querySelector("#bar-btn")
    lineBtn = document.querySelector("#line-btn")
    pyramidBtn = document.querySelector("#pyramid-btn")
    listBtn = document.querySelector("#list-btn")

    pieBtn.addEventListener("click", () => getChart('pie'))
    barBtn.addEventListener("click", () => getChart('bar'))
    lineBtn.addEventListener("click", () => getChart('line'))
    pyramidBtn.addEventListener("click", () => getChart('pyramid'))
    listBtn.addEventListener("click", () => getAggregationList('list'))
}  
  