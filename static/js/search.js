function displayFieldCheckboxes(elmID) {
    elm = document.getElementById(elmID)
    elm.innerHTML = `
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
        `
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
    document.getElementById("id_q").removeAttribute('readonly')
    if (value=='age'){
      console.log("inside age")
      document.getElementById("id_q").type = "number";
      document.getElementById("id_q").placeholder = "0";
      document.getElementById("id_q").min = "0";
      document.getElementById("id_q").max = "100";
    }
    else if (value=='city'){
      console.log("inside byer")
      document.getElementById("id_q").type = "text";
      //remove value as well? to avoid the number user input to stay
      document.getElementById("id_q").placeholder = "Indtast en by"
      document.getElementById("id_q").removeAttribute('min')
      document.getElementById("id_q").removeAttribute('max')
    }
    

    // do something with values array

  })

  // ensuring which fields to display is saved across page change
  var genderChecked = JSON.parse(sessionStorage.getItem("genderChecked"));
  var statusChecked = JSON.parse(sessionStorage.getItem("statusChecked"));
  var migrantChecked = JSON.parse(sessionStorage.getItem("migrantChecked"));
  
  if (genderChecked != null) {
    console.log("check was set")
    document.getElementById("gender").checked = genderChecked;
  } 

  if (statusChecked != null) {
    console.log("check was set")
    document.getElementById("status").checked = statusChecked;
  } 

  if (migrantChecked != null) {
    console.log("check was set")
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

function updateFieldBooleans() {
    // var fieldBooleans = {"show-pa-id": true, "show-name": true, "show-age": true, "show-gender": true, "show-status": true, "show-migrant": true}


    // var fieldBooleans = (JSON.parse(sessionStorage.getItem("booleans")) || {"show-pa-id": true, "show-name": true, "show-age": true, "show-gender": true, "show-status": true, "show-migrant": true})

    var fieldBooleans = JSON.parse(sessionStorage.getItem("booleans") || JSON.stringify({"show-pa-id": true, "show-name": true, "show-age": true, "show-gender": true, "show-status": true, "show-migrant": true}));

    console.log("fieldbooleans: ", fieldBooleans)

    saveBooleans(fieldBooleans)

    showResults(fieldBooleans)
    
    $('#gender').change(function() {
        if ($(this).is(':checked')) {
            console.log("gender checkbox was checked");
            fieldBooleans["show-gender"] = true
        }
        else {

            fieldBooleans["show-gender"] = false
            console.log("gender checkbox was unchecked");
        }
        saveBooleans(fieldBooleans)
        showResults(fieldBooleans)
        })

    $('#status').change(function() {
        if ($(this).is(':checked')) {
            console.log("status checkbox was checked");
            fieldBooleans["show-status"] = true
        }
        else {
            fieldBooleans[["show-status"]] = false
            console.log("status checkbox was unchecked");
        }
        saveBooleans(fieldBooleans)
        showResults(fieldBooleans)
        })

    $('#migrant').change(function() {
        if ($(this).is(':checked')) {
            console.log("migrant checkbox was checked");
            fieldBooleans["show-migrant"] = true
        }
        else {
            fieldBooleans["show-migrant"] = false
            console.log("migrant checkbox was unchecked");
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
      console.log("field is: ", field)
      toHide = document.getElementsByName(field);
      console.log(toHide[0])
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





//for loading



// function updateFieldBooleans() {
//     var fieldBooleans = {pa_id: true, name: true, age: true, gender: true, status: true, migrant: true}
    
//     $('#gender').change(function() {
//         if ($(this).is(':checked')) {
//             // console.log("gender checkbox was checked");
//             fieldBooleans.gender = true
//         }
//         else {

//             fieldBooleans.gender = false
//             // console.log("gender checkbox was unchecked");
//         }
//         showResults(fieldBooleans)
//         })

//     $('#status').change(function() {
//         if ($(this).is(':checked')) {
//             // console.log("status checkbox was checked");
//             fieldBooleans.status = true
//         }
//         else {
//             fieldBooleans.status = false
//             // console.log("status checkbox was unchecked");
//         }
//         showResults(fieldBooleans)
//         })

//     $('#migrant').change(function() {
//         if ($(this).is(':checked')) {
//             // console.log("migrant checkbox was checked");
//             fieldBooleans.migrant = true
//         }
//         else {
//             fieldBooleans.migrant = false
//             // console.log("migrant checkbox was unchecked");
//         }
//         showResults(fieldBooleans)
//         })
// }

// function showResults(booleans){
    
//     var res = document.getElementById("results")
//     res.innerHTML = ""
//     var startFor = document.createTextNode("{% for item in page_obj %}")
//     res.appendChild(startFor)

//     var card = document.createElement('div')
//     card.classList.add("card")
//     card.classList.add("mb-1")

//     var cardBody = document.createElement('div')
//     cardBody.classList.add("card-body")

//     var col = document.createElement('div')
//     col.classList.add("col")

//     var row = document.createElement('div')
//     row.classList.add("row")
//     var resRow = document.getElementById("resRow")

//     function create_paragraph(input, elm) {
//       var p = document.createElement('p')
//       p.classList.add("card-title")
//       p.classList.add("col-2")
//       p.innerHTML = input
//       // console.log("p input is: ", input)
//       elm.appendChild(p)
    
//     }
//     var fields = ["pa_id", "name", "age", "gender", "status", "migrant"]
//     var fieldDict = {pa_id: "{{ item.pa_id }}", name: "{{ item.navn }}", age : "{{ item.alder }}", gender: "{{ item.køn }}", status: "{{ item.ægteskabelig_stilling }}", migrant: "{{ item.migrant_type }}"}
    
//     fields.forEach(field => {
//       // console.log("fieldsdict: ", fieldDict.name)
//       if (booleans[field]) {
//         create_paragraph(fieldDict[field], resRow)
//       }

      
//     });

//     res.appendChild(card).appendChild(cardBody).appendChild(col).appendChild(row)
//     var endFor = document.createTextNode("{% endfor %}")
//     res.appendChild(endFor)
     
//   }