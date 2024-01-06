try {
    // DOM elements
    var settingsSection = document.getElementById("settingsList");
    var modSection = document.getElementById("modList");
    var toolsSection = document.getElementById("toolsList");

    function getCheckBoxes(section, checkIfChecked){
        var checkBoxes = section.getElementsByTagName('input');
        var returnVal = [];
        for (var i = 0; i < checkBoxes.length; i++) {
            if (checkBoxes[i].type === 'checkbox') {
                if (checkIfChecked && checkBoxes[i].checked){
                    returnVal.push(checkBoxes[i]);
                } else if(!checkIfChecked) {
                    returnVal.push(checkBoxes[i]);
                }
            }
        }
        return returnVal
    }

    //Header
    document.getElementById("homeButton").addEventListener("click", function () {
        settingsSection.style.display = "none";
        modSection.style.display = "block";
        toolsSection.style.display = "none";
    });
    document.getElementById("toolsButton").addEventListener("click", function () {
        settingsSection.style.display = "none";
        modSection.style.display = "none";
        toolsSection.style.display = "block";
    });
    document.getElementById("settingsButton").addEventListener("click", function () {
        settingsSection.style.display = "block";
        modSection.style.display = "none";
        toolsSection.style.display = "none";
    });

    


    //Footer
    document.getElementById("exitButton").addEventListener("click", function () {
        window.api.send("toMain", ["exitClicked"]);
    });
    document.getElementById("refreshButton").addEventListener("click", function () {
        window.api.send("toMain", ["refreshClicked"]);
    });
    document.getElementById("selectButton").addEventListener("click", function () {
        const checkBoxes = getCheckBoxes(modSection)

        checkBoxes.forEach((id) => {
            document.getElementById(checkbox.id).checked = false;
        })
    });
    document.getElementById("deselectButton").addEventListener("click", function () {
        const checkBoxes = getCheckBoxes(modSection)

        checkBoxes.forEach((checkbox) => {
            document.getElementById(checkbox.id).checked = false;
        })
    });
    document.getElementById("launchButton").addEventListener("click", function () {
        var checkboxes = [];
        getCheckBoxes(modSection, true).forEach((checkbox) => {
            checkboxes.push(checkbox.id);
        });

        window.api.send("toMain", ["launchClicked", JSON.stringify(checkboxes)]);
    });


    // Settings
    document.getElementById("findMSMButton").addEventListener("click", function () {
        window.api.send("toMain", ["findMSM"]);
    });

    function handleCheckbox(checkbox){
        window.api.send("toMain", ["settings_checkbox", checkbox.id.split("settings.")[1], checkbox.checked])
    }

    const checkboxes = getCheckBoxes(settingsSection)
    checkboxes.forEach((checkbox) => {
        document.getElementById(checkbox.id).addEventListener("click", function(ev){
            handleCheckbox(ev.target)
        });
    })

} catch (error) {
    console.error("An error occurred:", error.message);
}