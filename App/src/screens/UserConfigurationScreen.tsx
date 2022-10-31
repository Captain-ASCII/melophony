import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Select from 'react-select'

import { setLanguage } from '@actions/App'
import { setConfiguration } from '@actions/Configuration'
import { selectConfiguration } from '@selectors/Configuration'

import Button from '@components/Button'
import CloseButton from '@components/CloseButton'

import { SelectStyles } from '@utils/SelectStyles'

import { _, getLanguage, LANGUAGE_OPTIONS } from '@utils/TranslationUtils'

const UserConfigurationScreen = (): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()

  const configuration = selectConfiguration()
  const [ language, setStateLanguage ] = useState(getLanguage(configuration.getLanguage()))

  const saveInfo = useCallback(() => history.goBack(), [ history ])

  const handleLanguageSet = useCallback(selection => {
    const lang = getLanguage(selection.value)
    setStateLanguage(lang)
    dispatch(setConfiguration(configuration.withLanguage(selection.value)))
    dispatch(setLanguage(lang))
  }, [])

  return (
    <div id="UserConfigurationScreen" className="screen" >
      <div id="pageHeader">
        <h2 id="pageTitle">{ _("user.configuration.screen.title") }</h2>
        <CloseButton />
      </div>
      <div className="input">
        <i className="fa fa-solid fa-flag fa-2x icon" />
        <Select id="languages" className="multiSelect" placeholder={_("user.configuration.languages.placeholder")} styles={SelectStyles}
          options={LANGUAGE_OPTIONS} onChange={handleLanguageSet} value={{value: language.key, label: language.name}}
        />
      </div>
      <div id="postActions">
        <Button icon="save" className="raised" onClick={saveInfo} title={_("user.configuration.save.button")} />
      </div>
    </div>
  )
}

export default UserConfigurationScreen