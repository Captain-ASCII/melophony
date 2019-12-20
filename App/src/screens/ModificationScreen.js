import React, { useCallback, useState } from 'react'

import CloseButton from '../components/utils/CloseButton'

const ModificationScreen = () => {
  const [ onSave, setOnSave ] = useState(() => false)
  
  const save = useCallback(() => {
    onSave()
    
    const inputs = document.querySelectorAll('.form-data')
    for (const input of inputs) {
      if (input.list) {
        let listElement = document.querySelector(`#${input.list.id} option[value="${input.value}"]`)
        if (input.getAttribute('keepValue')) {
          this.data[input.id] = input.value
        } else if (listElement) {
          this.data[input.id] = listElement.getAttribute('data-value')
        }
      } else {
        this.data[input.id] = input.value
      }
    }
    
    apiManager.put(`${this.type}/${this.data.id}`, this.data)
    this.props.history.goBack()
  })
  
  return (
    <div id="modificationPage">
      <div id="modificationPageHeader">
        <CloseButton />
        <h2 id="modificationPageTitle">{ this.title }</h2>
        <div id="saveButton" className="button raised" onClick={save} >Save</div>
      </div>
    </div>
  )
}

export default ModificationScreen