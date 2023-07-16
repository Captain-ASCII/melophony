
import React, { Fragment, forwardRef, useRef, useImperativeHandle } from 'react'

import Text from '@components/Text'

import { selectLanguage } from '@selectors/App'

import StringUtils from '@utils/StringUtils'

import { FR_TRANSLATIONS } from '../data/translations/fr'
import { EN_TRANSLATIONS } from '../data/translations/en'

interface Language {
  key: string;
  translations: Dict;
  name: string;
}

export interface Translation {
  key: string;
  content: string;
}

const FR_TRANSLATION_KEY = 'fr'
const EN_TRANSLATION_KEY = 'en'

const FRENCH = {key: FR_TRANSLATION_KEY, translations: FR_TRANSLATIONS, name: 'Français'}
const ENGLISH = {key: EN_TRANSLATION_KEY, translations: EN_TRANSLATIONS, name: 'English'}

const LANGUAGES: Array<Language> = [FRENCH, ENGLISH]
const LANGUAGE_OPTIONS: Array<Dict> = LANGUAGES.map(language => { return {"value": language.key, "label": language.name}})

const getLanguage = function(translationKey: string): Language {
  for (const language of LANGUAGES) {
    if (language.key === translationKey) {
      return language
    }
  }
  return ENGLISH
}

const addTranslations = function(languageKey: string, translations: Array<Translation>) {
  const language = getLanguage(languageKey)
  for (const translation of translations) {
    language.translations[translation.key] = translation.content
  }
}

function _getTranslation(language: Language, translationKey: string, args: Array<any>) {
  var result = translationKey
  const translation = language.translations[translationKey]
  if (translation !== undefined) {
    result = translation
  }
  if (args !== null) {
    result = StringUtils.format(result, args)
  }

  return result
}

const useTranslation = (translationKey: string, args: Array<any>) => {
  const language = selectLanguage()
  return _getTranslation(language, translationKey, args)
}

const _ = function(translationKey: string, args: Array<any> = null) {
  return <Text args={args}>{ translationKey }</Text>
}

export { useTranslation, _, getLanguage, addTranslations, Language, LANGUAGE_OPTIONS, FR_TRANSLATION_KEY, EN_TRANSLATION_KEY }