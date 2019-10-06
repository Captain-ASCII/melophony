import React, { Component } from "react";

import CloseButton from "../components/utils/CloseButton";
import InputRange from "../components/utils/InputRange";

export default class AbstractModificationScreen extends Component {

    onSave() { /* abstract */ }

    save() {
        this.onSave();

        let inputs = document.querySelectorAll(".form-data");
        for (let input of inputs) {
            if (input.list) {
                let listElement = document.querySelector(`#${input.list.id} option[value="${input.value}"]`);
                if (input.getAttribute("keepValue")) {
                    this.data[input.id] = input.value;
                } else if (listElement) {
                    this.data[input.id] = listElement.getAttribute("data-value");
                }
            } else {
                this.data[input.id] = input.value;
            }
        }

        apiManager.put(`${this.type}/${this.data.id}`, this.data);
        this.props.history.goBack();
    }

    renderForm() {
        return null;
    }

    render() {
        return (
            <div id="modificationPage">
                <div id="modificationPageHeader">
                    <CloseButton />
                    <h2 id="modificationPageTitle">{ this.title }</h2>
                    <div id="saveButton" class="button raised" onClick={ _ => this.save() } >Save</div>
                </div>
                { this.renderForm() }
            </div>
        );
    }
}