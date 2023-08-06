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
        if (document.getElementById(queryIdentifiers.selectId).value === "migration") {
            resetSearchField(queryIdentifiers)  
        }
    } else {
        option.style.display = "block"  
    }
}

function resetSearchField(queryIdentifiers) {
    const selectElm = document.getElementById(queryIdentifiers.selectId)
    const optionNoQuery = "no-query"
    recallQueryInputAttributes(optionNoQuery, queryIdentifiers)
    selectElm.value = optionNoQuery
}

// function resetSearchField(queryIdentifiers) {
//     const selectElm = document.getElementById(queryIdentifiers.selectId)
//     const optionNoQuery = "no-query"
//     if (selectElm.value === "migration") {
//         recallQueryInputAttributes(optionNoQuery, queryIdentifiers)
//         selectElm.value = optionNoQuery
//     }  
// }

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
            q.min = "-1";
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
        case "status":
            const statusOptions = ["ugift", "gift", "enke", "skilt", "ukendt"]
            insertFormElm(createSelectElm(statusOptions, queryName, queryId), formId)
            break
        case "location":
            const locationOptions = ["land", "by", "københavn"]
            insertFormElm(createSelectElm(locationOptions, queryName, queryId), formId)
            break
        case "job-original":
            q.type = "text"
            q.placeholder = "Indtast et erhverv"
            break
        case "household-id":
            console.log("inside hid onSelectChange")
            q.type = "number";
            q.placeholder = "0";
            q.min = "0";
            // q.max = "100";
            break
        case "household-size" :
            console.log("inside household-size-interval onSelectChange")
            q.type = "text"
            q.title="Example of acceptable input: 4-5"
            q.placeholder = "Ex: 4-5"
            q.pattern="^[0-9]{1,3}-[0-9]{1,3}$"
            // console.log({age_q: q})
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
    grandParent = document.getElementById("field-checkboxes-column")
    parent = document.createElement("div")
    parent.className = "row pt-2 pb-2"

    for (const [fieldId, fieldTitle] of Object.entries(fieldsToDisplay)) {
        parent.insertAdjacentHTML("beforeend",
        `
        <div class="col-auto">
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
        </div>
        `)
    } 
    grandParent.replaceChildren(parent) 

}

function setFieldsToDisplay(year) {
    let fieldsToDisplay = { age: "Alder", gender: "Køn", status: "Ægteskabelig stilling", location: "Bostedstype", parish: "Sogn/By", "household-function-std": "Stilling i husstanden", "job-original": "Erhverv", county: "Amt", "household-id": "Husstands ID", "household-size": "Husstandsstørrelse"}
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
    if (fieldCheckBoxBooleans) {
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

function keepFieldCheckboxInput(year, submitElm) {
    // right now I create same const fieldsToDisplay twice, one here and one in displayFieldCheckBoxes.
    // if time, fix so it is only done once(since they should always be the same)
    const fieldsToDisplay = setFieldsToDisplay(year)
    setAllFieldCheckboxClickFunction(fieldsToDisplay)
    console.log({submitElm: submitElm})
   
    if (isNewQuery()) {
        if (submitElm === "search-btn") {
            setDefaultFieldCheckboxBooleans(queryOneIdentifiers.selectId, queryTwoIdentifiers.selectId, fieldsToDisplay)
        }
    }

    updateFieldCheckboxes()
    showResults(fieldsToDisplay)
}

function savePerPage(per_page) {
    sessionStorage.setItem("perPage", per_page)
}

function recallPerPage(per_page) {
    const perPageElm = document.getElementById(`per-page-${per_page}`)
    if (perPageElm) {
        perPageElm.checked = true
    }
}

function keepPerPage(per_page) {
    savePerPage(per_page)
    recallPerPage(per_page)
}


function retrieveQueryInput() {
    const inputFields = ["year", "searchCategory1", "query1", "searchCategory2","query2", "combine"]
    const queryInputs = {}
    for (const inputField of inputFields) {
        queryInputs[inputField] = sessionStorage.getItem(inputField)
    }
    return queryInputs 
} 

function setPerPageButtonFunctions() {
    console.log("inside setPerPAgeButtonFuntions")
    const perPageButtons = document.querySelectorAll('input[name="num-results"]')
    const queryForm = document.getElementById("query-form")
    for (const perPageBtn of perPageButtons) {
        // changing per page should resubmit query
        
        perPageBtn.addEventListener('change', function() {
            queryInputs = retrieveQueryInput()
            keepUserInput(queryInputs.year, queryInputs.searchCategory1, queryInputs.query1, queryInputs.searchCategory2, queryInputs.query2, queryInputs.combine)
            // keepFieldCheckboxInput(queryInputs.year, setDefault=false)
            queryForm.submit()
        })
    }
}


function handleResultsPerPage(per_page) {
    keepPerPage(per_page)
    
    setPerPageButtonFunctions()
}



function getToolTipList() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  return tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
}

// function resetAllSearchFields() {
//     console.log("heythere")
    // resetSearchField(queryOneIdentifiers)
    // resetSearchField(queryTwoIdentifiers)
// }

function setResetButton() {
    console.log("works")
    resetBtn = document.getElementById("remove-filters-btn")
    resetBtn.addEventListener("click", function(){
        resetSearchField(queryOneIdentifiers)
        resetSearchField(queryTwoIdentifiers)
    })
}
