import React from "react";

import { useHistory } from "react-router-dom";

export default function CloseButton({ icon, additionalClass }) {
    let history = useHistory();

    if (!icon) {
        icon = "times";
    }

    return (<div id="backButton" class={`button icon ${ additionalClass ? additionalClass : "" }`}
                 onClick={ _ => history.goBack() } ><i class={`fa fa-${icon} fa-2x icon`}></i></div>);
}