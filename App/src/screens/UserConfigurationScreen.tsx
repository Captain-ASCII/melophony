import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Select from 'react-select'

import { selectApiManager } from '@selectors/App'
import { setLanguage } from '@actions/App'
import { setConfiguration } from '@actions/Configuration'
import { selectConfiguration } from '@selectors/Configuration'

import Button from '@components/Button'
import Screen from '@components/Screen'
import InputWithIcon from '@components/InputWithIcon'
import StatusMessage, { MessageType } from '@components/StatusMessage'

import { SelectStyles } from '@utils/SelectStyles'

import { _, getLanguage, LANGUAGE_OPTIONS } from '@utils/TranslationUtils'
import TextInput from '@components/TextInput'
import Title from '@components/Title'

const UserConfigurationScreen = (): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()

  const apiManager = selectApiManager()
  const configuration = selectConfiguration()

  const [firstPassword, setFirstPassword] = useState('')
  const [secondPassword, setSecondPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmationAlert, setConfirmationAlert] = useState(false)
  const [ language, setStateLanguage ] = useState(getLanguage(configuration.getLanguage()))

  const handlePassword = (setMethod: React.Dispatch<React.SetStateAction<string>>): ((p: string) => void) => {
    return (p: string) => setMethod(p)
  }

  useEffect(() => {
    const isOkForUpdate = (firstPassword === secondPassword) && secondPassword !== ''
    setPassword(isOkForUpdate ? secondPassword : '')
    setConfirmationAlert(!isOkForUpdate)
  }, [firstPassword, secondPassword])

  const saveInfo = useCallback(() => {
    console.warn(password)
    if (password !== '') {
      apiManager.put('/user', { password })
    }
    history.goBack()
  }, [ history, password, apiManager ])

  const handleLanguageSet = useCallback(selection => {
    const lang = getLanguage(selection.value)
    setStateLanguage(lang)
    dispatch(setConfiguration(configuration.withLanguage(selection.value)))
    dispatch(setLanguage(lang))
  }, [])

  return (
    <Screen id="UserConfigurationScreen" title={ _("user.configuration.screen.title") } >
      <Title title="Language" />
      <InputWithIcon icon="flag" >
        <Select id="languages" className="multiSelect" placeholder={_("user.configuration.languages.placeholder")} styles={SelectStyles}
          options={LANGUAGE_OPTIONS} onChange={handleLanguageSet} value={{value: language.key, label: language.name}}
        />
      </InputWithIcon>
      <Title title="Password" />
      <InputWithIcon icon="lock" >
        <TextInput type="password" placeHolder="user.configuration.password.placeholder" onInput={handlePassword(setFirstPassword)} />
      </InputWithIcon>
      <InputWithIcon icon="redo-alt" type="solid" >
        <TextInput type="password" placeHolder="user.configuration.password.repeat.placeholder" onInput={handlePassword(setSecondPassword)} />
      </InputWithIcon>
      { confirmationAlert && <StatusMessage message={_('user.configuration.password.not.equal.alert')} type={MessageType.WARNING} /> }
      <div id="postActions">
        <Button icon="save" className="raised" onClick={saveInfo} title={_("user.configuration.save.button")} />
      </div>
    </Screen>
  )
}

export default UserConfigurationScreen