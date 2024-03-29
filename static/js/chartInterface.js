function displayChartVariableChoices(variableName, year) {
    const choices = setChoices(year, variableName) 
    const gpId = `choose-${variableName}-variable`
    const grandParent = document.getElementById(gpId)
    const parent = document.createElement("div")
    parent.className = "row"
    //temporary fix
    if (variableName === "z") {
        parent.style="visibility:hidden"
    }
    for (const [choice, title] of Object.entries(choices)) {
        parent.insertAdjacentHTML("beforeend", `
        <div class="col-auto">
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="${variableName}" id="${choice}-${variableName}" value="${choice}">
                <label class="form-check-label" for="${choice}-${variableName}">${title}</label>
            </div>
        </div>
        `)
    }
    grandParent.replaceChildren(parent)
    if (variableName === "y") {
        resetGraphChoices()
    }
    
}

function displayAllChartVariableChoices(year) {
    const variables = ["x", "y"]
    for (const variableName of variables) {
        displayChartVariableChoices(variableName, year)
    }
}

function setChoices(year, variableName) {
    const choices = {gender: "Køn", status: "Ægteskabelig stilling", location: "Bostedstype", county: "Amt", five: "5 års aldersgruppe", age: "Alder", household_function_std: "Stilling i husstanden"}
    if (year !== "1801") {
        choices.migration = "Migrationstype"
    }
    if (variableName === "x") {
        choices.parish = "Sogn/By"
        choices.job_original = "Erhverv"
        choices.household_id = "Husstands ID"
        choices.household_size = "Husstandsstørrelse"
    }
    return choices
}

function setAllowances(variableNames, year) {
    const allowances = {}
    for (const variableName of variableNames) {
        const choices = setChoices(year, variableName)
        choices["migration"] = false //this line should fix the bug that rendered migration in y disabled when switching from 1801 to one of the other years. The problem was that since migration was never set in xallowances upon the first search, when recalling xallowances for remembering the allowed y buttons, migration was not remembered.
        let varBooleans = {}
        for (const [choice, title] of Object.entries(choices)) {
            varBooleans[choice] = false
        }
        allowances[variableName] = varBooleans
    }
    return allowances
}

function updateAllowances(allowances, btn, val) {
    Object.keys(allowances[btn]).forEach((item) => {
        if(item != val) {
            allowances[btn][item] = true   
        }
        else allowances[btn][item] = false
    })
    if (["parish", "household_id", "job_original", "household_size"].includes(val)) {
        Object.keys(allowances[btn]).forEach((item) => {
            allowances[btn][item] = false
        })
    }
}
  

function updateGraphInput(year) {
    updateGraphDisplay()

    $('input[name=abs-ratio]').on('change', (function() {
  
        //saving the id of the abs-ratio button clicked
        sessionStorage.setItem("abs-ratio", $(this).prop('id'))
        }
    ))
   
    // if the allowance objects already exists, we get them, otherwise we create them and set them all to false
    let xAllowances = JSON.parse(sessionStorage.getItem("xAllowances")) || setAllowances(["y", "z"], year)
    let yAllowances = JSON.parse(sessionStorage.getItem("yAllowances")) || setAllowances(["z"], year)

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
  
        $('input[name=z]').each(function(){
            zBtn = $(this)
            if (xAllowances.z[zBtn.val()] && yAllowances.z[zBtn.val()]) {
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
    }

    absRatio = sessionStorage.getItem("abs-ratio")
    if (absRatio != null) {
        document.getElementById(absRatio).checked = true
    }
}
  
// to recall which y and z buttons were disabled
function recallDisabledGraphButtons() {
    const yBtns = document.querySelectorAll('input[name=y]')
    const zBtns = document.querySelectorAll('input[name=z]')

    const xAllowances = JSON.parse(sessionStorage.getItem("xAllowances"))
    const yAllowances = JSON.parse(sessionStorage.getItem("yAllowances"))
  
  
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
        })
    }
    updateGraphDisplay()
}
  
function updateGraphDisplay() {
    const isX = $('input[name=x]:checked').length > 0
    const isY = $('input[name=y]:checked').length > 0
    const isZ = $('input[name=z]:checked').length > 0
    const pieBtn = document.getElementById("pie-btn")
    const lineBtn = document.getElementById("line-btn")
    const barBtn = document.getElementById("bar-btn")
    const pyramidBtn = document.getElementById("pyramid-btn")
    const listBtn = document.getElementById("list-btn")
    const countyBtn = document.getElementById("county-btn")

    if (isX) {
        lineBtn.disabled = false
        barBtn.disabled = false
        if (!isY) {
            pieBtn.disabled = false
            pyramidBtn.disabled = true

            xVal = document.querySelector('input[name="x"]:checked').value

            if (["household_id", "job_original"].includes(xVal)) {
                listBtn.disabled = false 
            } else {
                listBtn.disabled = true
            }
            if (xVal === "county") {
                countyBtn.disabled = false
            } else {
                countyBtn.disabled = true
            }

            
        } else {
            pieBtn.disabled = true
            listBtn.disabled = true
            countyBtn.disabled = true

            xVal = document.querySelector('input[name="x"]:checked').value
            yVal = document.querySelector('input[name="y"]:checked').value
            if ((xVal === "gender" && ["five", "age"].includes(yVal)) || (yVal === "gender" && ["five", "age"].includes(xVal))) {
                pyramidBtn.disabled = false
            } else {
                pyramidBtn.disabled = true 
            }
            
        } 
    }
}


function resetGraphChoices() {
    document.getElementsByName("y").forEach((elm) => {
        if (elm.checked) {
            //have to manually trigger the xvariable that would remove the checked y variable
            document.getElementById(elm.id.split('-')[0] + '-x').dispatchEvent(new Event("change"))
        }
        elm.checked = false
    })
    //and then manually trigger the xvar that we want as a result of reset (which isjust gender-x)
    document.getElementById("gender-x").checked = true
    document.getElementById("gender-y").disabled = true
    document.getElementById('gender-x').dispatchEvent(new Event("change"))
}

function setGraphResetButton() {
    resetBtn = document.getElementById("reset-graph-choices")
    resetBtn.addEventListener("click", function() {
        resetGraphChoices()
    })
}