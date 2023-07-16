import React, { useCallback, useState } from 'react'

import { selectApiManager } from '@selectors/App'

import Screen from '@components/Screen'
import StatusMessage, { MessageType } from '@components/StatusMessage'

import { _ } from '@utils/TranslationUtils'

function DiffOrZero(end: number, start: number) {
  if (start > 0) {
    return Math.round(end - start)
  }
  return 0
}

function format(n: number) {
  return Math.round(n)
}

const PerformanceTableEntry = ({ resource }: { resource: PerformanceResourceTiming }): JSX.Element => {

  const [isOpen, setOpen] = useState(false)
  const toggleOpen = useCallback(() => setOpen(!isOpen), [isOpen])

  return (
    <li>
      <div className="perfRecordHeader" onClick={toggleOpen} >
        <p className="recordName">{ resource.name }</p>
        <p>{ format(DiffOrZero(resource.responseEnd, resource.startTime)) } ms</p>
      </div>
      { isOpen &&
        <ul>
          <li>DNS time: { format(resource.domainLookupEnd - resource.domainLookupStart) } ms</li>
          <li>TCP handshake time: { format(resource.connectEnd - resource.connectStart) } ms</li>
          <li>Secure connection time: { format(DiffOrZero(resource.connectEnd, resource.secureConnectionStart)) } ms</li>
          <li>Response time: { format(resource.responseEnd - resource.responseStart) } ms</li>
          <li>Fetch until response end: { format(DiffOrZero(resource.responseEnd, resource.fetchStart)) } ms</li>
          <li>Request start until response end: { format(DiffOrZero(resource.responseEnd, resource.requestStart)) } ms</li>
        </ul>
      }
    </li>
  )
}

const PerformanceEntryList = (): JSX.Element => {

  if (performance === undefined) {
    return <StatusMessage message="Performance API not supported" type={MessageType.ERROR} />
  }

  const resources = performance.getEntriesByType("resource")

  if (resources === undefined || resources.length <= 0) {
    return <StatusMessage message="No resources" type={MessageType.ERROR} />
  }

  return (
    <ul className="perfRecords">
    { resources.map(resource => <PerformanceTableEntry key={`${resource.name}_${resource.startTime}`} resource={resource as PerformanceResourceTiming} />) }
    </ul>
  )
}


const ArtistCreationScreen = (): JSX.Element => {
  const apiManager = selectApiManager()

  // const requests = apiManager.getRequestsInfo()

  return (
    <Screen id="NetworkStatisticsScreen" title={_("network.statistics.screen.title")} >
      <PerformanceEntryList />
    </Screen>
  )
}

export default ArtistCreationScreen