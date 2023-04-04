function displayFieldCheckboxes(elmID) {
    elm = document.getElementById(elmID)
    elm.insertAdjacentHTML('beforeend', `
    <b>Vælg hvilke felter du vil se</b>
            <div style="display:flex">
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" name="gender" id="gender" value="køn" onClick=saveGender() checked>
                    <label class="form-check-label" for="gender">Køn</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" name="status" id="status" value="ægteskabelig_status" onClick=saveStatus() checked>
                    <label class="form-check-label" for="status">Ægteskabelig status</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" name="migrant" id="migrant" value="migrant_type" onClick=saveMigrant() checked>
                    <label class="form-check-label" for="migrant">Migranttype</label>
                </div>
            </div>
        `)
}




function keepUserInput(query, year, search_category) {
  //keeping the input values in the form throughout pagination/submitting

  document.getElementById("id_q").value = query

  if (year == '1850') {
    document.getElementById("1850").checked = true;
  }
  else if (year == '1901') {
    document.getElementById("1901").checked = true;
  }

  if (search_category == 'age') {
    document.getElementById("age").checked = true;
    document.getElementById("id_q").removeAttribute('readonly')
  }
  else if (search_category == 'city') {
    document.getElementById("city").checked = true;
    document.getElementById("id_q").removeAttribute('readonly')
  }

  $('input:radio[name=search_category]').click(function() {
    var value = $('input:radio[name=search_category]:checked').map(function() {
      return this.value
    }).get();
    q = document.getElementById("id_q")
    q.removeAttribute('readonly')
    if (value=='age'){
      // console.log("inside age")
      q.type = "number";
      q.placeholder = "0";
      q.min = "0";
      q.max = "100";
    }
    else if (value=='city'){
      // console.log("inside byer")
      q.type = "text";
      //setting value to empty string to let the placeholder take over. In the opposite case (value=='age'), since a number field does not accept text, the value is removed automatically, I suppose
      q.value = ""
      q.placeholder = "Indtast en by"
      // console.log("placeholder is: ", q.placeholder)
      // console.log("but values is: ", q.value)
      q.removeAttribute('min')
      q.removeAttribute('max')
    }
    

    // do something with values array

  })

  // ensuring which fields to display is saved across page change
  var genderChecked = JSON.parse(sessionStorage.getItem("genderChecked"));
  var statusChecked = JSON.parse(sessionStorage.getItem("statusChecked"));
  var migrantChecked = JSON.parse(sessionStorage.getItem("migrantChecked"));
  
  if (genderChecked != null) {
    // console.log("check was set")
    document.getElementById("gender").checked = genderChecked;
  } 

  if (statusChecked != null) {
    // console.log("check was set")
    document.getElementById("status").checked = statusChecked;
  } 

  if (migrantChecked != null) {
    // console.log("check was set")
    document.getElementById("migrant").checked = migrantChecked;
  } 
  
  
}

function saveGender() {	
	var checkbox = document.getElementById("gender");
    sessionStorage.setItem("genderChecked", checkbox.checked);	
}

function saveStatus() {	
	var checkbox = document.getElementById("status");
    sessionStorage.setItem("statusChecked", checkbox.checked);	
}

function saveMigrant() {	
	var checkbox = document.getElementById("migrant");
    sessionStorage.setItem("migrantChecked", checkbox.checked);	
}


function saveBooleans(booleans) {
  sessionStorage.setItem("booleans", JSON.stringify(booleans))
}

// function saveGraphVariables() {
//   sessionStorage.setItem("")
// }

function updateFieldBooleans() {
    // var fieldBooleans = {"show-pa-id": true, "show-name": true, "show-age": true, "show-gender": true, "show-status": true, "show-migrant": true}


    // var fieldBooleans = (JSON.parse(sessionStorage.getItem("booleans")) || {"show-pa-id": true, "show-name": true, "show-age": true, "show-gender": true, "show-status": true, "show-migrant": true})

    var fieldBooleans = JSON.parse(sessionStorage.getItem("booleans") || JSON.stringify({"show-pa-id": true, "show-name": true, "show-age": true, "show-gender": true, "show-status": true, "show-migrant": true}));

    // console.log("fieldbooleans: ", fieldBooleans)

    saveBooleans(fieldBooleans)

    showResults(fieldBooleans)
    
    $('#gender').change(function() {
        if ($(this).is(':checked')) {
            // console.log("gender checkbox was checked");
            fieldBooleans["show-gender"] = true
        }
        else {

            fieldBooleans["show-gender"] = false
            // console.log("gender checkbox was unchecked");
        }
        saveBooleans(fieldBooleans)
        showResults(fieldBooleans)
        })

    $('#status').change(function() {
        if ($(this).is(':checked')) {
            // console.log("status checkbox was checked");
            fieldBooleans["show-status"] = true
        }
        else {
            fieldBooleans[["show-status"]] = false
            // console.log("status checkbox was unchecked");
        }
        saveBooleans(fieldBooleans)
        showResults(fieldBooleans)
        })

    $('#migrant').change(function() {
        if ($(this).is(':checked')) {
            // console.log("migrant checkbox was checked");
            fieldBooleans["show-migrant"] = true
        }
        else {
            fieldBooleans["show-migrant"] = false
            // console.log("migrant checkbox was unchecked");
        }
        saveBooleans(fieldBooleans)
        showResults(fieldBooleans)
        })
}

function showResults(booleans) {
  var fields = ["show-pa-id", "show-name", "show-age", "show-gender", "show-status", "show-migrant"]
  // var fields = ["gender"]
  fields.forEach(field => {
      // console.log("fieldsdict: ", fieldDict.name)
      // console.log("field is: ", field)
      toHide = document.getElementsByName(field);
      // console.log(toHide[0])
      if (booleans[field]) {
        for (elm of toHide) {
          elm.style.display="inline";
        }
      }
      else {
        for (elm of toHide) {
          elm.style.display="none";
        }
      }})
}

function getToolTipList() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  return tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
}



function updateAllowances(allowances, btn, val) {
  Object.keys(allowances[btn]).forEach((item) => {
    if(item != val) {
      allowances[btn][item] = true   
    }
    else allowances[btn][item] = false
   })
}


function updateGraphInput() {
  
  // if the allowance objects already exists, we get them, otherwise we create them and set them all to false
  var xAllowances = JSON.parse(sessionStorage.getItem("xAllowances")) || {y: {gender: false, status: false, migrant: false, city: false}, z: {gender: false, status: false, migrant: false, city: false}}
  var yAllowances = JSON.parse(sessionStorage.getItem("yAllowances")) || {z:{gender: false, status: false, migrant: false, city: false}}

  // when x changes, should affect both y and z
  $('input[name=x]').on('change', (function() {

    //saving the id of the x button that is checked to recall later
    sessionStorage.setItem("xID", $(this).prop('id'))
    
    // the value of the checked button determines what buttons in z and y should be disabled
    var xVal = $(this).val()

    // updating which y and z buttons should be disabled by choice of x
    updateAllowances(xAllowances, "y", xVal)
    updateAllowances(xAllowances, "z", xVal)
    

    // updating button options for y (x's perspective)
    $('input[name=y]').each(function(){

      yBtn = $(this)
      // making allowed y button available
      if (xAllowances.y[yBtn.val()]) {
        yBtn.prop('disabled', false)
      }  
      // making disallowed y button disabled and removing potential checkmark
      else {
        yBtn.prop('disabled', true)
        if (yBtn.is(':checked')) {
          yBtn.prop('checked', false)
          sessionStorage.removeItem('yID')
          //update y's z allowances: if y no longer checked, no z buttons are allowed
          Object.keys(xAllowances.z).forEach(item => {
            yAllowances.z[item] = false
          sessionStorage.removeItem('zID')  
        })}
      }})

      // updating button options for z (x's AND y's perspective)
      $('input[name=z]').each(function(){
        zBtn = $(this)
        // if z-button allowed by both x and y, enable it 
        if (xAllowances.z[zBtn.val()] && yAllowances.z[zBtn.val()]) {
          zBtn.prop('disabled', false)
        }
        // if z-button disallowed by either x or y, disable it and remove potential checkmark
        else {
          zBtn.prop('disabled', true)
          if (zBtn.is(':checked')) {
            zBtn.prop('checked', false)
            sessionStorage.removeItem('zID')
          }
          
        }
      })

      //saving the current graph button states
      sessionStorage.setItem("xAllowances", JSON.stringify(xAllowances))
      sessionStorage.setItem("yAllowances", JSON.stringify(yAllowances))
      
      // showing which graphs can be created
      updateGraphDisplay()

    })) //first on change func ends here

    // when y changes, should only affect z
    $('input[name=y]').on('change', (function() {

       
      sessionStorage.setItem("yID", $(this).prop('id'))
      
      var yVal = $(this).val()

      updateAllowances(yAllowances, "z", yVal)


      console.log(xAllowances)
      console.log(yAllowances)
      $('input[name=z]').each(function(){
        zBtn = $(this)
      if (xAllowances.z[zBtn.val()] && yAllowances.z[zBtn.val()]) {
        console.log("both x and y allow z btn")
        zBtn.prop('disabled', false)
      }
      else {
        zBtn.prop('disabled', true)
        if (zBtn.is(':checked')) {
          zBtn.prop('checked', false)
          sessionStorage.removeItem('zID')
        }
      }

      })

      //saving the updated state of yAllowances
      sessionStorage.setItem("yAllowances", JSON.stringify(yAllowances))

      // showing which graphs can be created
      updateGraphDisplay() 
    }))

    // when z changes, should not affect any variable button options
    $('input[name=z]').on('change', (function() {
      sessionStorage.setItem("zID", $(this).prop('id'))

      // showing which graphs can be created
      updateGraphDisplay()
    }))
  }

// to recal which graph buttons were selected
function recallGraphInput() {
  xID = sessionStorage.getItem("xID")
  yID = sessionStorage.getItem("yID")
  zID = sessionStorage.getItem("zID")

  if (xID != null) {
    document.getElementById(xID).checked=true;
  }
  if (yID != null) {
    document.getElementById(yID).checked=true;
  }
  if (zID != null) {
    document.getElementById(zID).checked=true;
  }}

// to recall which y and z buttons were disabled
function recallDisabledGraphButtons() {
  const yBtns = document.querySelectorAll('input[name=y]')
  const zBtns = document.querySelectorAll('input[name=z]')
  const xAllowances = JSON.parse(sessionStorage.getItem("xAllowances"))
  const yAllowances = JSON.parse(sessionStorage.getItem("yAllowances"))
  console.log("xallow is: ", xAllowances)


  if (xAllowances != null) {
    yBtns.forEach((btn) => {
      if (!xAllowances['y'][btn.value]) {
        btn.disabled = true
        btn.checked = false
      }
      else {
        btn.disabled = false
      }
    })
  }

  if (xAllowances != null && yAllowances != null) {
    zBtns.forEach((btn) => {
      if (yAllowances.z[btn.value] && xAllowances.z[btn.value]) {
        btn.disabled = false
      }
      else {
        btn.disabled = true
        btn.checked = false
      }
    })}
}

function updateGraphDisplay() {
  var isX = $('input[name=x]:checked').length > 0
  var isY = $('input[name=y]:checked').length > 0
  var isZ = $('input[name=z]:checked').length > 0

  if (isX) {
    if (!isY) {
      $('#pie-btn').show()
      $('#line-btn').hide()
      $('#bar-btn').hide()
    }
    else {
      $('#pie-btn').hide()
      $('#line-btn').show()
      $('#bar-btn').show()
    } 
  }
}



function showPieChart() {
  pieBtn = document.querySelector("#pie-btn")
  pieBtn.addEventListener("click", function() {
    // make ajax call
    xVal = document.querySelector('input[name="x"]:checked').value;
    year = document.querySelector('input[name="year"]:checked').value;
    console.log("xVal is: " + xVal)
    console.log("year is: " + year)
    fetch(`pie_chart/?x_val=${xVal}&year=${year}`, {
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

      const ctx = document.getElementById('pie-chart-canvas');
      // if (pieChart) {
      //   console.log("piechart was")
      //   pieChart.destroy()
      // }
      // if (typeof(pieChart) === 'undefined' || pieChart === null) {
      //     console.log("piechart was NOT")
      // }
      // else {
      //   console.log("piechart was")
      //   pieChart.destroy()
      // }
      // if (pieChart) {
      //   console.log("piechart was")
      // }
      console.log("right before creating pieChart")
      
      var pieChart = new Chart(ctx, {
        type: 'pie',
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
                    text: '1850'
                },
                customCanvasBackgroundColor: {
                  color: 'white',
                }

            },
            animation: {
              //option to download chart as a png image
              onComplete: function() {
                pieDownload = document.querySelector("#pie-download")
                pieDownload.style.visibility = "visible"
                pieDownload.href = pieChart.toBase64Image()
                pieDownload.download = "pie_chart_image.png"
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
    }
    );
    

    // console.log("pie chart is of type: ", typeof(pieChart))

    // function displayDownloadButton() {
    //   downloadButton = document.querySelector("#pie-download")
    //   downloadButton.style.display = "block"

    // }
    // var imagePieChart = pieChart.toBase64Image()
    // console.log(imagePieChart)
    // var a = document.createElement('a')
    // a.href = pieChart.toBase64Image()
    // a.download = "my_file_name.png"
    // a.click()



    });
  }); 
}


