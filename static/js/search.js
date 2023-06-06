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
                    <input class="form-check-input" type="checkbox" name="location" id="location" value="bostedstype" onClick=saveLocation() checked>
                    <label class="form-check-label" for="location">Bostedstype</label>
                </div>
            </div>
        `)
}



function recallSelectedOption(search_category) {
    document.getElementById(`${search_category}`).selected = true
}

function recallYear(year) {
    document.getElementById(`${year}`).checked = true
}

function createSelect(optionList, q_select) {
    optionList.forEach(option => {
        let opt = document.createElement('option');
        console.log({opt: option})
        opt.value = option
        opt.innerHTML = option
        q_select.appendChild(opt)
    })
    // q_select.selectedIndex = 0
}

function resetToDefaultAttributes(q, q_select) {
    attributesToRemove = ["readonly", "min", "max", "pattern", "placeholder", "title"]
    attributesToRemove.forEach(attr => q.removeAttribute(attr))
    q.setAttribute("class", "form-control")
    q.style.removeProperty("display")
    q_select.style.display = "none"
    q_select.value = null
}


function createFormElm(elmType) {
    formElm = document.createElement(elmType)
    formElm.name = "q"
    formElm.id = "id_q"
    return formElm
}

function creatInputElm() {
    formElm = createFormElm("input")
    formElm.required = true
    formElm.setAttribute("class", "form-control")
    return formElm
}

function createSelectElm(optionList) {
    formElm = createFormElm("select")
    formElm.setAttribute("class", "form-select")
    optionList.forEach(option => {
        let opt = document.createElement('option');
        opt.value = option
        opt.innerHTML = option
        formElm.appendChild(opt)
    })
    return formElm
}

function insertFormElm(elm) {
    const q1_form = document.getElementById("q1-form")
    q1_form.replaceChildren(elm)
}


// function onChangeHandler(search_category) {
//     insertFormElm(creatInputElm())
//     q = document.getElementById("id_q")

//     switch (search_category) {
//         case "age" :
//             console.log("inside age onSelectChange")
//             q.type = "number";
//             q.placeholder = "0";
//             q.min = "0";
//             q.max = "100";
//             break
//         case "parish" :
//             console.log("inside parish onSelectChange")
//             q.type = "text"
//             q.placeholder = "Indtast en by"
//             break
//         case "no-query" :
//             console.log("inside no-query onSelectChange")
//             q.type = "text";
//             q.value = null
//             q.placeholder = ""
//             q.setAttribute('readonly', true) 
//             console.log({noquery_qval: q.value})
//             break
//         case "age-interval" :
//             console.log("inside age-interval onSelectChange")
//             q.type = "text"
//             q.title="Example of acceptable input: 10-20"
//             q.placeholder = "Ex: 20-35"
//             q.pattern="^[0-9]{1,3}-[0-9]{1,3}$"
//             console.log({age_q: q})
//             break
//         case "gender" :
//             const genderOptions = ["m", "f"]
//             insertFormElm(createSelectElm(genderOptions))
//             // q = document.getElementById("id_q")
//             break
//         case "household_function_std" :
//             const householdOptions = ['hendes barn', 'ukendt', 'barn', 'tjeneste', 'husfader', 'kone', 'husmoder', 'hans barn', 'andet']
//             insertFormElm(createSelectElm(householdOptions))
//             break
//     }
// }


function recallQueryInputAttributes(search_category, query, onChange=false) {
    console.log({search_category})
    insertFormElm(creatInputElm())
    q = document.getElementById("id_q")
    if (!onChange) {
        q.value = query
    }   
    console.log({q: q})

    switch (search_category) {
        case "age" :
            console.log("inside age onSelectChange")
            q.type = "number";
            q.placeholder = "0";
            q.min = "0";
            q.max = "100";
            break
        case "parish" :
            console.log("inside parish onSelectChange")
            q.type = "text"
            q.placeholder = "Indtast en by"
            break
        case "no-query" :
            console.log("inside no-query onSelectChange")
            q.type = "text";
            q.value = null
            q.placeholder = ""
            q.setAttribute('readonly', true) 
            console.log({noquery_qval: q.value})
            break
        case "age-interval" :
            console.log("inside age-interval onSelectChange")
            q.type = "text"
            q.title="Example of acceptable input: 10-20"
            q.placeholder = "Ex: 20-35"
            q.pattern="^[0-9]{1,3}-[0-9]{1,3}$"
            console.log({age_q: q})
            break
        case "gender" :
            const genderOptions = ["m", "f"]
            insertFormElm(createSelectElm(genderOptions))
            q = document.getElementById("id_q")
            if (!onChange) {
                q.value = query
            }
            break
        case "household_function_std" :
            const householdOptions = ['hendes barn', 'ukendt', 'barn', 'tjeneste', 'husfader', 'kone', 'husmoder', 'hans barn', 'andet']
            insertFormElm(createSelectElm(householdOptions))
            q = document.getElementById("id_q")
            if (!onChange) {
                q.value = query
            }
            break
    }
}

function keepUserInput(query, year, search_category) {
    //keeping the input values in the form throughout pagination/submitting
    sessionStorage.setItem("year", year)
    sessionStorage.setItem("searchCategory", search_category)
    sessionStorage.setItem("query", query)
    console.log({search_category: search_category})
    //   document.getElementById("modal-size").classList.add('modal-xl');

    if (year) {
        recallYear(year)
    } else {
        console.log("no year")
    }
    
    if (search_category) {
        recallSelectedOption(search_category)
        recallQueryInputAttributes(search_category, query, onChange=false)
    }
    
    const select1 = document.getElementById("select1")

    select1.addEventListener("change", function() {
        recallQueryInputAttributes(this.value, query, onChange=true)
    })
        
    // ensuring which fields to display is saved across page change
    var genderChecked = JSON.parse(sessionStorage.getItem("genderChecked"));
    var statusChecked = JSON.parse(sessionStorage.getItem("statusChecked"));
    var locationChecked = JSON.parse(sessionStorage.getItem("locationChecked"));
    
    if (genderChecked != null) {
        // console.log("check was set")
        document.getElementById("gender").checked = genderChecked;
    } 

    if (statusChecked != null) {
        // console.log("check was set")
        document.getElementById("status").checked = statusChecked;
    } 

    if (locationChecked != null) {
        // console.log("check was set")
        document.getElementById("location").checked = locationChecked;
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

function saveLocation() {	
	var checkbox = document.getElementById("location");
    sessionStorage.setItem("locationChecked", checkbox.checked);	
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

    var fieldBooleans = JSON.parse(sessionStorage.getItem("booleans") || JSON.stringify({"show-pa-id": true, "show-name": true, "show-age": true, "show-gender": true, "show-status": true, "show-location": true}));

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

    $('#location').change(function() {
        if ($(this).is(':checked')) {
            // console.log("location checkbox was checked");
            fieldBooleans["show-location"] = true
        }
        else {
            fieldBooleans["show-location"] = false
            // console.log("location checkbox was unchecked");
        }
        saveBooleans(fieldBooleans)
        showResults(fieldBooleans)
        })
}

function showResults(booleans) {
  var fields = ["show-pa-id", "show-name", "show-age", "show-gender", "show-status", "show-location"]
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
  updateGraphDisplay()
  
  // if the allowance objects already exists, we get them, otherwise we create them and set them all to false
  var xAllowances = JSON.parse(sessionStorage.getItem("xAllowances")) || {y: {gender: false, status: false, location: false, county: false, five: false}, z: {gender: false, status: false, location: false, county: false, five: false}}
  var yAllowances = JSON.parse(sessionStorage.getItem("yAllowances")) || {z:{gender: false, status: false, location: false, county: false, five: false}}

//   console.log({xAllows: xAllowances})
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


    //   console.log(xAllowances)
    //   console.log(yAllowances)
      $('input[name=z]').each(function(){
        zBtn = $(this)
      if (xAllowances.z[zBtn.val()] && yAllowances.z[zBtn.val()]) {
        // console.log("both x and y allow z btn")
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
//   console.log({yBtnsChecked: document.querySelectorAll('input[name=z]:checked').length})
  const xAllowances = JSON.parse(sessionStorage.getItem("xAllowances"))
  const yAllowances = JSON.parse(sessionStorage.getItem("yAllowances"))
//   console.log("xallow is: ", xAllowances)


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


  updateGraphDisplay()
}

function updateGraphDisplay() {
    var isX = $('input[name=x]:checked').length > 0
    var isY = $('input[name=y]:checked').length > 0
    var isZ = $('input[name=z]:checked').length > 0
    // console.log({isY: isY})
    // console.log({isX: isX})

    if (isX) {
        $('#line-btn').show()
        $('#bar-btn').show()
        if (!isY) {
            $('#pie-btn').show()    
        } else {
        $('#pie-btn').hide()
        } 
    }
}
