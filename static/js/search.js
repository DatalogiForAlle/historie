const queryOneIdentifiers = {formId: "q1-form", queryId: "id_q1", queryName: "q1", selectName: "search-category-1", selectId: "select1", storageCategoryKey: "searchCategory1", storageQueryKey: "query1", optionIdSuffix: "-1"}

const queryTwoIdentifiers = {formId: "q2-form", queryId: "id_q2", queryName: "q2", selectName: "search-category-2", selectId: "select2", storageCategoryKey: "searchCategory2", storageQueryKey: "query2", optionIdSuffix: "-2"}


// helper function for updating the query fields to be either input or select elements
function createInputElm(name, id) {
    inputElm = document.createElement("input")
    inputElm.name = name
    inputElm.id = id
    inputElm.required = true
    inputElm.setAttribute("class", "form-control")
    return inputElm
}

function createSelectElm(optionList, name, id) {
    selectElm = document.createElement('select')
    selectElm.name = name
    selectElm.id = id
    selectElm.setAttribute("class", "form-select")
    optionList.forEach(option => {
        let opt = document.createElement('option');
        opt.value = option
        opt.innerHTML = option
        selectElm.appendChild(opt)
    })
    return selectElm
}

function insertFormElm(formElm, formId) {
    const q_form = document.getElementById(formId)
    q_form.replaceChildren(formElm)
}


// helper functions for recalling user input on reload/pagination use
function recallYear(year) {
    document.getElementById(`${year}`).checked = true
}

function recallCombineValue(combine) {
    document.getElementById(`${combine}`).checked = true
}

function recallSelectedOption(searchCategory, optionIdSuffix) {
    selectId = `${searchCategory}${optionIdSuffix}`
    document.getElementById(`${selectId}`).selected = true
}

function recallQueryValue(queryId, query) {
    q = document.getElementById(queryId)
    q.value = query
}


function setYearChangeFunction(queryIdentifiers){
    yearButtons = document.querySelectorAll('input[name="year"]')
    for (const yearBtn of yearButtons) {
        yearBtn.addEventListener('change', function() {
            if (this.checked) {
                setMigrationOptionVisibility(year=this.value, queryIdentifiers)
            }
        })
    }
}

function setMigrationOptionVisibility(year, queryIdentifiers) {
    const option = document.getElementById("migration" + queryIdentifiers.optionIdSuffix)
    if (year === "1801") {
        option.style.display = "none"
        resetSearchField(queryIdentifiers)  
    } else {
        option.style.display = "block"  
    }
}

function resetSearchField(queryIdentifiers) {
    const selectElm = document.getElementById(queryIdentifiers.selectId)
    const optionNoQuery = "no-query"
    if (selectElm.value === "migration") {
        recallQueryInputAttributes(optionNoQuery, queryIdentifiers)
        selectElm.value = optionNoQuery
    }  
}

function recallIfMigration(year, queryIdentifiers) {
    if (year) {
        setMigrationOptionVisibility(year, queryIdentifiers)
    }
}



function recallQueryInputAttributes(searchCategory, queryIdentifiers) {
    const queryName = queryIdentifiers.queryName
    const queryId = queryIdentifiers.queryId
    const formId = queryIdentifiers.formId
    insertFormElm(createInputElm(queryName, queryId), formId)
    q = document.getElementById(queryId)

    switch (searchCategory) {
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
            insertFormElm(createSelectElm(genderOptions, queryName, queryId), formId)
            console.log({q: q})
            break
        case "household-function-std" :
            const householdOptions = ['hendes barn', 'ukendt', 'barn', 'tjeneste', 'husfader', 'kone', 'husmoder', 'hans barn', 'andet']
            insertFormElm(createSelectElm(householdOptions, queryName, queryId), formId)
            break
        case "migration" :
            const migrationOptions = ['migrant', 'indfødt', 'ukendt']
            insertFormElm(createSelectElm(migrationOptions, queryName, queryId), formId)
            break
    }
}


function keepYearInput(year) {
    sessionStorage.setItem("year", year)
    if (year) {
        recallYear(year)
    } else { 
        console.log("no year")
    }
}

function keepCombineInput(combine) {
    sessionStorage.setItem("combine", combine)
    if (combine) {
        recallCombineValue(combine)
    } else {
        console.log("no combine")
    }
}

function keepQueryInput(queryIdentifiers, searchCategory, query) {
    sessionStorage.setItem(queryIdentifiers.storageCategoryKey, searchCategory)
    sessionStorage.setItem(queryIdentifiers.storageQueryKey, query)
    if (searchCategory) {
        recallSelectedOption(searchCategory, queryIdentifiers.optionIdSuffix)
        recallQueryInputAttributes(searchCategory, queryIdentifiers)
        recallQueryValue(queryIdentifiers.queryId, query)
    }
}

function setSelectChangeFunction(queryIdentifiers) {
    selectElm = document.getElementById(queryIdentifiers.selectId)
    selectElm.addEventListener("change", function() {
        recallQueryInputAttributes(this.value, queryIdentifiers)
    })
}


function keepUserInput(year, searchCategory1, query1, searchCategory2, query2, combine) {

    keepYearInput(year)
    keepCombineInput(combine)
    keepQueryInput(queryOneIdentifiers, searchCategory1, query1)
    keepQueryInput(queryTwoIdentifiers, searchCategory2, query2)
    recallIfMigration(year, queryOneIdentifiers)
    recallIfMigration(year, queryTwoIdentifiers)
    
    setYearChangeFunction(queryOneIdentifiers)
    setYearChangeFunction(queryTwoIdentifiers)
    setSelectChangeFunction(queryOneIdentifiers)
    setSelectChangeFunction(queryTwoIdentifiers)
}


function displayFieldCheckBoxes(year){
    const fieldsToDisplay = setFieldsToDisplay(year)
    grandParent = document.getElementById("field-checkboxes")
    parent = document.createElement("div")
    parent.id = "field-checkbox-parent"
    parent.style="display:flex"

    for (const [fieldId, fieldTitle] of Object.entries(fieldsToDisplay)) {
        parent.insertAdjacentHTML("beforeend",
        `
        <div class="form-check form-check-inline">
            <label class="form-check-label">
                <input 
                    class="form-check-input" 
                    type="checkbox" 
                    name=${fieldId} 
                    id=${fieldId} 
                    checked>
                ${fieldTitle}
            </label>
        </div>
        `)
    } 
    grandParent.replaceChildren(parent)  
}

function setFieldsToDisplay(year) {
    let fieldsToDisplay = { age: "Alder", gender: "Køn", status: "Ægteskabelig stilling", location: "Bostedstype", parish: "Sogn/By", "household-function-std": "Stilling i husstanden"}
    if (year !== "1801") {
        fieldsToDisplay.migration = "Migranttype"
    } 
    return fieldsToDisplay
}

function saveFieldChoice(fieldCheckboxId, fieldsToDisplay) {
    console.log("inside saveFieldChoice")
    let fieldCheckBoxBooleans = retrieveFieldCheckboxBooleans()
    if (fieldCheckBoxBooleans) {
        let fieldCheckbox = document.getElementById(fieldCheckboxId)
        fieldCheckBoxBooleans[fieldCheckboxId] = fieldCheckbox.checked
    }
    saveFieldCheckboxBooleans(fieldCheckBoxBooleans)
    showResults(fieldsToDisplay)
}

function saveFieldCheckboxBooleans(fieldCheckboxBooleans) {
    sessionStorage.setItem("fieldCheckboxBooleans", JSON.stringify(fieldCheckboxBooleans))
}

function retrieveFieldCheckboxBooleans(){
    return JSON.parse(sessionStorage.getItem("fieldCheckboxBooleans"))
}


function setDefaultFieldCheckboxBooleans(select1Id, select2Id, fieldsToDisplay) {
    const select1 = document.getElementById(select1Id)
    const select2 = document.getElementById(select2Id)
    const initialTrue = ["age", "gender", select1.value, select2.value]
    let defaultFieldCheckboxBooleans = {}
    for (const [fieldId, fieldTitle] of Object.entries(fieldsToDisplay)) {
        let checkField = initialTrue.includes(fieldId)
        fieldCheckbox = document.getElementById(fieldId)
        defaultFieldCheckboxBooleans[fieldId] = checkField
    }
    saveFieldCheckboxBooleans(defaultFieldCheckboxBooleans)
    updateFieldCheckboxes()
}

function updateFieldCheckboxes() {
    const fieldCheckboxBooleans = retrieveFieldCheckboxBooleans()
    if (fieldCheckboxBooleans) {
        for (const [fieldId, checked] of Object.entries(fieldCheckboxBooleans)) {
            fieldCheckbox = document.getElementById(fieldId)
            if (fieldCheckbox) {
                fieldCheckbox.checked = checked
            }
        }
    }
}

function isNewQuery() {
    const searchParams = window.location.search;
    //a brand new query does not have a page param in the url
    return !searchParams.includes("page=")
}

function showResults(fieldsToDisplay) {
    let fieldCheckBoxBooleans = retrieveFieldCheckboxBooleans()
    for ([fieldId, fieldTitle] of Object.entries(fieldsToDisplay)) {
        const fieldDisplayElms = document.getElementsByName("show-"+fieldId);
        if (fieldCheckBoxBooleans[fieldId]) {
            for (elm of fieldDisplayElms) {
              elm.style.display="inline";
            }
          }
          else {
            for (elm of fieldDisplayElms) {
              elm.style.display="none";
            }
          } 
    }
}


function setAllFieldCheckboxClickFunction(fieldsToDisplay) {
    for (const [fieldId, fieldTitle] of Object.entries(fieldsToDisplay)) {
        let fieldCheckbox = document.getElementById(fieldId)
        if (fieldCheckbox) {
            fieldCheckbox.addEventListener("change", function(e) {
                saveFieldChoice(e.target.id, fieldsToDisplay)
            })
        }
        
    }
}

function keepFieldCheckboxInput(year) {
    // right now I create same const fieldsToDisplay twice, one here and one in displayFieldCheckBoxes.
    // if time, fix so it is only done once(since they should always be the same)
    const fieldsToDisplay = setFieldsToDisplay(year)
    setAllFieldCheckboxClickFunction(fieldsToDisplay)
   
    if (isNewQuery()) {
        setDefaultFieldCheckboxBooleans(queryOneIdentifiers.selectId, queryTwoIdentifiers.selectId, fieldsToDisplay)
    }
    updateFieldCheckboxes()
    showResults(fieldsToDisplay)

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
