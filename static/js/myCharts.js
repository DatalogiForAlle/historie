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
    // document.getElementById('load-btn').remove()
    // loadBtn = document.createElement("button")
    // loadBtn.type="button"
    // loadBtn.id = "load-btn"
    // loadBtn.className = "btn btn-primary float-middle"
    // loadBtn.append("Load more")
    // document.getElementById('list-modal-body').append(loadBtn)

    return ctx 
}

// function stackedOption(chartType, absRatio) {
//     if (chartType === "bar") {
//         const scales = {x: { stacked: true},y: {stacked: true}}
//         if (absRatio == "ratio"){
//             scales.y.max = 100
//         }
//         return scales
//     } else {
//         return {}
//     } 
// }
function stackedOption(chartType, absRatio, chartLabel) {
    if (chartType === "bar") {
        const scales = {
            x: { 
                stacked: true,
                title: {
                    display: true,
                    text: chartLabel
                }
            },
            y: {
                stacked: true
            }}
        if (absRatio == "ratio"){
            scales.y.max = 100
        }
        return scales
    } else {
        return {x: {
            title: {
                display: true,
                text: chartLabel
            }
        }}
    } 
}

function createOneInputChart(ctx, labels, data, year, chartType, datasetLabel) {
    // console.log({datasetlabel: datasetLabel})
    // console.log({ctx: ctx})
    let titleText = year
    function translateTitle(t) {
        switch (t) {
            case "sogn_by":
                return "sogn"
            case "husstands_id":
                return "husstande"
            case "erhverv_original":
                return "erhverv"
        }
    }
    if (["sogn_by", "husstands_id", "erhverv_original"].includes(datasetLabel) && chartType !== "pie") {
        titleText += `- største 20 ${translateTitle(datasetLabel)}` 
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


  
  function createTwoInputChart(ctx, labels, datasets, year, chartType, chartLabel) {
    console.log({chartLabel: chartLabel})
    
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
        //   scales: {
        //     x: [{
        //         scaleLabel: {
        //             display: true,
        //             labelString: chartLabel
        //         }
        //     }],  
        //   },
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
          scales: stackedOption(chartType, absRatio, chartLabel)
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
    // console.log({pyramidDatasetse: datasets})
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
                            if (absRatio === "ratio") {
                                return Number.parseFloat(Math.abs(context.parsed.x)).toFixed(3)
                            } else {
                                return Number.parseFloat(Math.abs(context.parsed.x))
                            }
                            
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
        chartLabel = res["chartLabel"] 
        // console.log({twoinputdatasets: datasets})
        createTwoInputChart(ctx, labels, datasets, year, chartType, chartLabel) 
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

// function createAggregationDisplay(aggregationList, lastPage, loadBtn) {
//     if (lastPage) {
//         for (const elm of aggregationList) {
//             ctx.insertAdjacentHTML("beforeend", `
//             <p> 
//                 ${elm.husstands_id} : ${elm.total}
//             </p>
//             `)}
//         ctx.insertAdjacentHTML("beforeend", `
//             <p> 
//                 Ikke flere elementer at vise
//             </p>
//         `)
//         loadBtn.disabled = true
//     } else {
//         for (const elm of aggregationList) {
        
//             ctx.insertAdjacentHTML("beforeend", `
//             <p> 
//                 ${elm.husstands_id} : ${elm.total}
//             </p>
//             `)
//         }
//         loadBtn.disabled = false
//     }
// }

function insertAggregationList(aggregationList, lastPage, aggregationListElm, loadBtn, varValue, number_key) {

    if (lastPage) {
        for (const elm of aggregationList) {
            loadBtn.insertAdjacentHTML("beforebegin", `
                <div class="row mb-2">
                    <div class="col-3">
                        ${elm}
                    </div>
                    <div class="col-3">
                        ${number_key}
                    </div>
                </div>
            `)}
            loadBtn.insertAdjacentHTML("beforebegin", `
            <div class="row mb-2">
                <div class="col-3">
                    <em>Ikke flere resultater at vise</em>
                </div>
            </div>
        `)
        loadBtn.disabled = true
    } else {
        for (const elm of aggregationList) {
        
            loadBtn.insertAdjacentHTML("beforebegin", `
                <div class="row mb-2">
                    <div class="col-3">
                        ${elm}
                    </div>
                    <div class="col-3">
                        ${number_key}
                    </div>
                </div>
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
    const varValue = selectedVals[0].varValue
    listCanvas = document.getElementById("list-canvas")
    accordion = document.createElement("div")
    accordion.className = "accordion"
    accordion.id = "accordion"
    // console.log({aggOverview: aggregationOverview})
    // console.log({objEntries: Object.entries(aggregationOverview).sort((a,b) => b[0]-a[0])})

    let firstElm = true
    for (const [key, value] of Object.entries(aggregationOverview)) {
        // console.log({keyIs: key})
    
        const loadBtn = document.createElement("button")
        loadBtn.type = "button"
        loadBtn.className = "btn btn-primary float-middle"
        loadBtn.id = `load-btn-${key}`
        loadBtn.innerText = "Indlæs flere"

        let colTitle = ""
        
        if (varValue === "household_id") {
            colTitle = "Husstands ID"
        } else if (varValue === "job_original") {
            colTitle = "Erhverv"
        }
        const aggregationAccBody = document.createElement('div') 
        aggregationAccBody.className = "accordion-body"
        aggregationAccBody.id=`accordion-body-${key}`

        const aggregationListElm = document.createElement('div')
        aggregationListElm.className = "container"
        aggregationAccBody.insertAdjacentElement("beforeend", aggregationListElm)
        aggregationListElm.insertAdjacentElement("beforeend", loadBtn)
        loadBtn.insertAdjacentHTML("beforebegin", `
            <div class="row mt-3">
                <div class="col-3">
                    <u>${colTitle}</u>
                </div>
                <div class="col-3">
                    <u>Antal individer</u>
                </div>
            </div>
        `)

        
        let modalPage = 1 //page=1 is used on initial load of first elements
        loadBtn.addEventListener("click", function() {
            loadBtn.disabled = true
            url = buildFetchUrl("aggregation_list", selectedVals, queryParams, chartType)
            modalPage += 1
            url += `&key=${key}`
            url += `&page=${modalPage}`
            fetchAggregationList(url, loadBtn).then(result => {
                const isLastPage = result["lastPage"]
                nextResults = result["nextResults"]
                insertAggregationList(nextResults, isLastPage, aggregationListElm, loadBtn, varValue, key)
            })
        })

        
        const firstResults = result["firstResults"][key].results
        const isLastPage =result["firstResults"][key].lastPage

        insertAggregationList(firstResults, isLastPage, aggregationListElm, loadBtn,varValue, key)
        // console.log({agglistelm: aggregationListElm})

        accordionItem = document.createElement("div")
        accordionItem.className = "accordion-item"
        accordion.insertAdjacentElement("beforeend", accordionItem)

        // const accItemTitle = `${value} husholdning(er) af størrelse: ${key}`
        function getAccItemTitle(varName) {
            if (varName === "household_id") {
                return `${value} husholdning(er) af størrelse: ${key}`
            } else {
                if (value === 1) {
                    return `${value} erhverv besat af ${key} individ(er)`
                } else {
                    return `${value} erhverv hver besat af ${key} individ(er)`
                }
            }
        }
        
        accordionItem.insertAdjacentHTML('beforeend', `
            <h2 class="accordion-header" id="panelsStayOpen-heading${key}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapse${key}" aria-expanded="true" aria-controls="panelsStayOpen-collapse${key}">
                    <h6>${getAccItemTitle(varValue)}</h6>
                </button>
            </h2>
        `)

        
        const accordionCollapse = document.createElement("div")
        accordionItem.insertAdjacentElement("beforeend", accordionCollapse)
        accordionCollapse.id = `panelsStayOpen-collapse${key}`
        if (firstElm) {
            accordionCollapse.className = "accordion-collapse collapse show"
            firstElm = false
        } else {
            accordionCollapse.className = "accordion-collapse collapse"
        }
        
        // accordionCollapse.insertAdjacentHTML("beforeend", `
        //     <div class="accordion-body" id="accordion-body-${key}">
        //         results here
        //     </div> ` )
        // accordionCollapse.insertAdjacentElement("beforeend", aggregationListElm)
        accordionCollapse.insertAdjacentElement("beforeend", aggregationAccBody)
        // aggregationListElm.insertAdjacentElement("beforeend", loadBtn)
        // loadBtn.insertAdjacentHTML("beforebegin", "<h2>Hey</h2>")
        // accordionCollapse.insertAdjacentElement("beforeend", loadBtn)
        
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
        // console.log({aggUrl: url})
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

async function fetchCountyNumbers(url) {
    // loadBtn.disabled = true
    let response = await fetch(url, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        }
    })
    result = await response.json()
    return result
}

function getCountyMap() {
    console.log("works")
    // ctx = replaceCountyCanvas()
    selectedVals = getSelectedVals()
    queryParams = retrieveQueryParams()
    console.log({qparams: queryParams})
    setCountyMapTitle(queryParams["year"], queryParams["absRatio"])
    url = buildFetchUrl("county_map", selectedVals, queryParams)
    console.log({url: url})
    fetchCountyNumbers(url).then(result => {
        insertCountyNumbers(result["dataset"], replaceCountyCanvas())
        console.log({countyResults: result})
    })

}

function replaceCountyCanvas() {
    document.getElementById('county-positions').remove()
    ctx = document.createElement("div")
    ctx.id = "county-positions"
    ctx.style.minWidth = "100%"
    ctx.style.minHeight = "100%"
    document.getElementById('county-canvas').prepend(ctx)
    return ctx 
}


function insertCountyNumbers(countyNumbers, countyCanvas) {
    console.log({top: COUNTY_IMG_COORDS["hjørring"][1]})
    console.log({left: COUNTY_IMG_COORDS["hjørring"][0]})
    console.log({countyNumbers: countyNumbers})
    console.log({countyNumbers: countyNumbers["hjørring"]})
    //iterating over the coord dict since it has all counties => 
    // can detect when we don't have a number for a specific county (n/a)
    for (const [key, value] of Object.entries(COUNTY_IMG_COORDS)) {
        countyNumber = countyNumbers[key]
        countyCanvas.insertAdjacentHTML("beforeend", `
        <div 
            style="position: absolute; 
            top: ${value[1]}px; 
            left: ${value[0]}px;
            background-color: #ABBAEA; 
            font-size: 14px;">${countyNumber ? (Number.isInteger(countyNumber) ? countyNumber : countyNumber.toFixed(3)+"%") : "n/a"}</div>
        `)
    }    
}

function setCountyMapTitle(year, absRatio) {
    countyMapLabelElm = document.getElementById("county-modal-label")
    const countyMapLabel = "Befolkningstal fordelt på amter"
    countyMapLabelElm.innerText = countyMapLabel
}

function showChart() {
    pieBtn = document.querySelector("#pie-btn")
    barBtn = document.querySelector("#bar-btn")
    lineBtn = document.querySelector("#line-btn")
    pyramidBtn = document.querySelector("#pyramid-btn")
    listBtn = document.querySelector("#list-btn")
    countyBtn = document.querySelector("#county-btn")

    pieBtn.addEventListener("click", () => getChart('pie'))
    barBtn.addEventListener("click", () => getChart('bar'))
    lineBtn.addEventListener("click", () => getChart('line'))
    pyramidBtn.addEventListener("click", () => getChart('pyramid'))
    listBtn.addEventListener("click", () => getAggregationList('list'))
    countyBtn.addEventListener("click", () => getCountyMap())
    
}  
  
COUNTY_IMG_COORDS = {
    "hjørring": [316,142], 
    "ålborg": [267,265], 
    "thisted": [102,245], 
    "viborg": [221, 366], 
    "ringkøbing": [100,426], 
    "randers": [374, 390], 
    "århus": [343, 470], 
    "skanderborg": [236, 485], 
    "vejle": [205, 550], 
    "ribe": [104, 590], 
    "haderslev": [189, 667], 
    "odense": [325,646], 
    "tønder": [125, 745],
    "åbenrå": [198, 756], 
    "sønderborg": [274, 800], 
    "svendborg": [373, 712], 
    "frederiksborg": [642, 486], 
    "københavn": [659, 567], 
    "holbæk": [515, 583], 
    "roskilde": [630, 610], 
    "sorø": [510, 665], 
    "præstø": [608, 693], 
    "maribo": [514, 806], 
    "bornholm": [639, 367]}
