import React, { useCallback, useEffect, useState } from 'react'
// @ts-ignore
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import { TrackCreationParameters } from '@screens/TrackCreationScreen'

import Icon from '@components/Icon'

import { _ } from '@utils/TranslationUtils'
import Log from '@utils/Log'
import FileUploadProvider from './FileUploadProvider'

/**
 * The following example of Providers.tsx file show how to register new providers in the front-end.
 * It can be copied to (very simply) show how the mechanism works.
 * The idea is to add a getProviders() method in the file returning an array of ProviderInfo
 * with the component, name and icon (font-awesome) of the providers defined in the Providers.tsx file.
 * Therefore, all the providers components that can collect the information required for the back-end providers can be added.
 * The components must take the TrackProviderParameters interface as parameters and return a JSX.Element.
 *
 * -----------------------------------------------
 *
 * import React from 'react'
 * import { TrackProviderParameters, ProviderInfo } from './ProviderList'
 * import { _, addTranslations, FR_TRANSLATION_KEY, EN_TRANSLATION_KEY } from '../utils/TranslationUtils'
 *
 * // Export the getProviders() method, the providers will be retrieved by Melophony and added automatically.
 * export { getProviders }
 *
 * // Return the list of providers defined in the file.
 * // An additional collection field can be added to indicate the icon collection in which this icon can be found.
 * function getProviders(): Array<ProviderInfo> {
 *   return [{name: "Test", icon: "vial", providerKey: "test_provider", Component: TestProvider}]
 * }
 *
 * // A provider taking the TrackProviderParameters as arguments and returning the component used to get the information required for the back-end provider.
 * const TestProvider = ({ trackRequest, setTrackRequest } : TrackProviderParameters): JSX.Element => {
 *   return <div style={{textAlign: "center"}}><h1>{_("test.provider.specific.translation")}</h1></div>
 * }
 *
 * // In order to provide translations that may not already be available in the language dictionaries,
 * // The following call must be made to add the translations (in French and English here):
 * addTranslations(FR_TRANSLATION_KEY, [{key:"test.provider.specific.translation", content: "Ceci est un service de test"}])
 * addTranslations(EN_TRANSLATION_KEY, [{key: "test.provider.specific.translation", content: "This is a test provider"}])
 *
 * */

export interface ProviderInfo {
  name: string;
  icon: string;
  collection?: string;
  providerKey: string;
  Component: (providerCallbacks: TrackProviderParameters) => JSX.Element;
}

export interface TrackProviderParameters {
  setExtraInfo: (info: object) => void;
  setData: (data: any) => void;
  setTitle: (title: string) => void;
  setArtistName: (artistName: string) => void;
}

let PROVIDERS: ProviderInfo[] = []

// @ts-ignore
import("@providers/Providers").then((module: any) => {
  PROVIDERS = module.getProviders();
  PROVIDERS.push({name: "File Upload", icon: "upload", providerKey: "upload_file_provider", Component: FileUploadProvider},)
}).catch(_ => Log.w("No more providers"))

function setLine(index: number) {
  const width = document.getElementById("providersTabList").clientWidth
  const step = width / PROVIDERS.length
  document.getElementById("providersTabBar").style.transform = `translateX(${(step / 2) + (index * step)}px) translateX(-50%)`
}

const ProviderList = ({ setProviderKey, setExtraInfo, setData, setTitle, setArtistName } : TrackCreationParameters): JSX.Element => {

  const setProvider = (index: number) => {
    setLine(index)
    setProviderKey(PROVIDERS[index].providerKey)
  }
  useEffect(() => setProvider(0), [])

  const handleProviderChange = useCallback(index => setProvider(index), [])

  return (
    <>
      <Tabs onSelect={handleProviderChange} selectedTabClassName="tabSelected" >
        <TabList id="providersTabList" className="tabList" >
          { PROVIDERS.map(({name, icon, collection}) => <Tab key={name} ><Icon icon={icon} collection={collection} />{ name }</Tab>) }
        </TabList>
        <div id="providersTabBar" className="tabBar"></div>

        {
          PROVIDERS.map(({Component}, index) => (
            <TabPanel className="tabPanel" key={index}>
              <Component setExtraInfo={setExtraInfo} setData={setData} setTitle={setTitle} setArtistName={setArtistName} />
            </TabPanel>
          ))
        }
      </Tabs>
    </>
  )
}

export default ProviderList