import React, { useCallback, useEffect, useState } from 'react'

import { selectConfiguration } from '@selectors/Configuration'

import { ApiClient } from '@utils/ApiManager'
import { _ } from '@utils/TranslationUtils'

import Button from '@components/Button'
import TextInput from '@components/TextInput'
import Loader from '@components/Loader'


const Image = ({ url, index, onSelect, selected }: { url: string; index: number; onSelect: (url: string, index: number) => void; selected: boolean }): JSX.Element => {

  const [display, setDisplay] = useState('none')

  return (
    <div className={`imageSearchBox ${selected ? 'selected' : ''}`} style={{display: display}}>
      <img className="imageSearchImage" onClick={() => onSelect(url, index)}  src={url} onLoad={() => setDisplay('block')} />
    </div>
  )
}

const ImageSearcher = ({ initialQuery, onSelect }: { initialQuery: string; onSelect: (url: string) => void }): JSX.Element => {

  const configuration = selectConfiguration()

  const [imageUrls, setImageUrls] = useState([])
  const [selected, setSelected] = useState(-1)
  const [imageQuery, setImageQuery] = useState(initialQuery)
  const [realQuery, setRealQuery] = useState('')
  const [ loading, setLoading ] = useState(false)

  const handleQueryInput = useCallback(text => setImageQuery(text), [setImageQuery])
  const searchImages = useCallback(() => setRealQuery(imageQuery), [imageQuery, setRealQuery])

  useEffect(() => {
    const googleApi = new ApiClient('https://www.googleapis.com')

    async function loadImages() {
      if (realQuery !== undefined && realQuery !== '') {
        setLoading(true)
        const [code, result] = await googleApi.get('/customsearch/v1', {
          key: configuration.getKey('googleImageSecretKey'),
          cx: configuration.getKey('googleImageCx'),
          q: `${realQuery} filetype:png OR filetype:jpeg`,
          searchType: 'image',
          imgSize: 'xlarge'
        })

        if (code === 200) {
          const imageUrls = []
          if ('items' in result && result.items != null) {
            for (const image of result.items) {
              imageUrls.push(image.link)
            }
          }
          setImageUrls(imageUrls)
        }
        setLoading(false)
      }
    }
    loadImages()
  }, [realQuery])

  const chooseImage = useCallback((url, index) => {
    onSelect(url)
    setSelected(index)
  }, [onSelect])

  return (
    <div className="imageSearchContainer" >
      <div className="imageSearchInputs" >
        <TextInput placeHolder="image.search.placeholder" initialValue={imageQuery} onInput={handleQueryInput} />
        <Button icon="search" className="raised responsiveShrink" onClick={searchImages} title={_("image.search.button")} />
      </div>
      <div className="imageSearchImages" >
        { loading ? <Loader /> : imageUrls.map((url, index) => <Image key={index} index={index} url={url} onSelect={chooseImage} selected={selected === index} />) }
      </div>
    </div>
  )
}

export default ImageSearcher