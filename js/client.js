try {
    // DOM elements
    var settingsSection = document.getElementById("settingsList");
    var modSection = document.getElementById("modList");
    var toolsSection = document.getElementById("toolsList");
    var selectModButtons = document.getElementById("selectModButtons");
    var settingsSaveButtons = document.getElementById("settingsSaveButtons");
    // var noModIndicator = document.getElementById("noMods");

    function getCheckBoxes(section, checkIfChecked) {
        var checkBoxes = section.getElementsByTagName('input');
        var returnVal = [];
        for (var i = 0; i < checkBoxes.length; i++) {
            if (checkBoxes[i].type === 'checkbox') {
                if (checkIfChecked && checkBoxes[i].checked) {
                    returnVal.push(checkBoxes[i]);
                } else if (!checkIfChecked) {
                    returnVal.push(checkBoxes[i]);
                }
            }
        }
        return returnVal
    }

    //Animation
    var settingOption = 0;
    var settingsOptions = Array.from(settingsSection.children[0].children);
    settingsOptions.forEach(function (e) {
        settingOption += 1;
        e.style.transform = "translateY(100%)";
        e.style.opacity = "0%";
        e.style.animation = "0.5s moveSettingsAnimation forwards ease " + (settingOption / 18) + "s";
    });
    DetectModListChanges();
    function DetectModListChanges() {
        var mod = 0;
        var allMods = Array.from(modSection.children);
        allMods.forEach(function (e) {
            mod += 1;
            e.style.transform = "translateY(50%)";
            e.style.opacity = "0%";
            e.style.animation = "0.5s moveAnimation forwards ease " + (mod / 18) + "s";
        });
    }
    modSection.addEventListener('DOMSubtreeModified', function () {
        DetectModListChanges();
        // noModIndicator.style.display = "none";
    });
    var tool = 0;
    var allTools = Array.from(toolsSection.children);
    allTools.forEach(function (e) {
        tool += 1;
        e.style.transform = "translateY(50%)";
        e.style.opacity = "0%";
        e.style.animation = "0.5s moveAnimation forwards ease " + (tool / 18) + "s";
    });

    //Header
    document.getElementById("homeButton").addEventListener("click", function () {
        settingsSection.style.display = "none";
        modSection.style.display = "block";
        toolsSection.style.display = "none";
        selectModButtons.style.display = "block";
        settingsSaveButtons.style.display = "none";
    });
    document.getElementById("toolsButton").addEventListener("click", function () {
        settingsSection.style.display = "none";
        modSection.style.display = "none";
        toolsSection.style.display = "block";
        selectModButtons.style.display = "none";
        settingsSaveButtons.style.display = "none";
    });
    document.getElementById("settingsButton").addEventListener("click", function () {
        settingsSection.style.display = "block";
        modSection.style.display = "none";
        toolsSection.style.display = "none";
        selectModButtons.style.display = "none";
        settingsSaveButtons.style.display = "block";
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

        checkBoxes.forEach((checkbox) => {
            document.getElementById(checkbox.id).checked = true;
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

    function handleCheckbox(checkbox) {
        window.api.send("toMain", ["settings_checkbox", checkbox.id.split("settings.")[1], checkbox.checked])
    }

    const checkboxes = getCheckBoxes(settingsSection)
    checkboxes.forEach((checkbox) => {
        document.getElementById(checkbox.id).addEventListener("click", function (ev) {
            handleCheckbox(ev.target)
        });
    })

    document.getElementById("resetSettingsButton").addEventListener("click", function(){
        window.api.send("toMain", ["resetSettingsButton"]);
    });

} catch (error) {
    console.error("An error occurred:", error.message);
}