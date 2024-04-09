import {VALUE, VALID, EDITABLE, LABEL} from "../kolibri/presentationModel.js";

export { personListItemProjector, personFormProjector }

const bindTextInput = (textAttr, inputElement) => {
    inputElement.oninput = _ => textAttr.setConvertedValue(inputElement.value);

    textAttr.getObs(VALUE).onChange(text => inputElement.value = text);

    textAttr.getObs(VALID, true).onChange(
        valid => valid
          ? inputElement.classList.remove("invalid")
          : inputElement.classList.add("invalid")
    );

    textAttr.getObs(EDITABLE, true).onChange(
        isEditable => isEditable
        ? inputElement.removeAttribute("readonly")
        : inputElement.setAttribute("readonly", true));

    // todo: the label property should be shown as a pop-over on the text element.
    textAttr.getObs(LABEL).onChange( newLabel =>
        inputElement.setAttribute("title", newLabel));

};

const personTextProjector = textAttr => {

    const inputElement = document.createElement("INPUT");
    inputElement.type = "text";
    inputElement.size = 20;

    bindTextInput(textAttr, inputElement);

    return inputElement;
};

const personListItemProjector = (masterController, selectionController, rootElement, person) => {

    let tableElement = rootElement.querySelector('table');

    // create table element if it doesn't already exist
    if (tableElement == null) {
        tableElement = document.createElement('table');
        tableElement.id = 'person-list';
        rootElement.appendChild(tableElement);

        // create header row
        const headerRow = document.createElement('tr');
        tableElement.appendChild(headerRow);

        const deleteButtonHeader = document.createElement('th');
        headerRow.appendChild(deleteButtonHeader);

        const firstnameHeader = document.createElement('th');
        headerRow.appendChild(firstnameHeader);
        firstnameHeader.id = 'firstnameHeader';

        const lastnameHeader = document.createElement('th');
        headerRow.appendChild(lastnameHeader);
        lastnameHeader.id = 'lastnameHeader';

        person.firstname.getObs(LABEL).onChange( newLabel =>
            tableElement.querySelector("#firstnameHeader").textContent = newLabel);
        person.lastname.getObs(LABEL).onChange( newLabel =>
            tableElement.querySelector("#lastnameHeader").textContent = newLabel);
    }

    const row = document.createElement('tr');
    tableElement.appendChild(row);

    const deleteButton      = document.createElement("Button");
    deleteButton.setAttribute("class","delete");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = _ => masterController.removePerson(person);

    const firstnameInputElement = personTextProjector(person.firstname); // todo create the input fields and bind to the attribute props
    const lastnameInputElement  = personTextProjector(person.lastname);

    // todo: when a line in the master view is clicked, we have to set the selection
    deleteButton.onfocus          = _ => selectionController.setSelectedPerson(person);
    firstnameInputElement.onfocus = _ => selectionController.setSelectedPerson(person);
    lastnameInputElement.onfocus  = _ => selectionController.setSelectedPerson(person);

    selectionController.onPersonSelected(
        selected => selected === person
          ? row.classList.add("selected")
          : row.classList.remove("selected")
    );

    masterController.onPersonRemove( (removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        tableElement.removeChild(row);
        // todo: what to do with selection when person was removed?
        selectionController.clearSelection();
        removeMe();
    } );

    const deleteButtonCell = document.createElement('td');
    row.appendChild(deleteButtonCell);
    deleteButtonCell.appendChild(deleteButton);

    const firstNameCell = document.createElement('td');
    row.appendChild(firstNameCell);
    firstNameCell.appendChild(firstnameInputElement);

    const lastNameCell = document.createElement('td');
    row.appendChild(lastNameCell);
    lastNameCell.appendChild(lastnameInputElement);

    // todo: what to do with selection when person was added?
    selectionController.setSelectedPerson(person);
};

const personFormProjector = (detailController, rootElement, person) => {

    const divElement = document.createElement("DIV");
    divElement.innerHTML = `
    <FORM>
        <DIV class="detail-form">
            <LABEL for="firstname"></LABEL>
            <INPUT TYPE="text" size="20" id="firstname">   
            <LABEL for="lastname"></LABEL>
            <INPUT TYPE="text" size="20" id="lastname">   
        </DIV>
    </FORM>`;

    // todo: bind text values
    bindTextInput(person.firstname, divElement.querySelector("#firstname"));
    bindTextInput(person.lastname,  divElement.querySelector("#lastname"));

    // todo: bind label values
    person.firstname.getObs(LABEL).onChange( newLabel =>
        divElement.querySelector("label[for='firstname']").textContent = newLabel);
    person.lastname.getObs(LABEL).onChange( newLabel =>
        divElement.querySelector("label[for='lastname']").textContent = newLabel);

    rootElement.firstChild.replaceWith(divElement); // react - style ;-)
};
