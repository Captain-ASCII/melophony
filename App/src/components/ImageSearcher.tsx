import React, { useCallback, useEffect, useState } from 'react'

import { ApiClient } from '@utils/ApiManager'
import { _ } from '@utils/TranslationUtils'

import Button from '@components/Button'
import TextInput from '@components/TextInput'


const Image = ({ url, index, onSelect, selected }: { url: string; index: number; onSelect: (url: string, index: number) => void; selected: boolean }): JSX.Element => {

  const [display, setDisplay] = useState('none')

  return (
    <div className={`imageSearchBox ${selected ? 'selected' : ''}`} style={{display: display}}>
      <img className="imageSearchImage" onClick={() => onSelect(url, index)}  src={url} onLoad={() => setDisplay('block')} />
    </div>
  )
}

const ImageSearcher = ({ initialQuery, onSelect }: { initialQuery: string; onSelect: (url: string) => void }): JSX.Element => {

  const [imageUrls, setImageUrls] = useState([])
  const [selected, setSelected] = useState(-1)
  const [imageQuery, setImageQuery] = useState(initialQuery)
  const [realQuery, setRealQuery] = useState('')

  const handleQueryInput = useCallback(text => setImageQuery(text), [setImageQuery])
  const searchImages = useCallback(() => setRealQuery(imageQuery), [imageQuery, setRealQuery])

  useEffect(() => {
    const googleApi = new ApiClient('https://www.googleapis.com')

    async function loadImages() {
      if (realQuery !== undefined && realQuery !== '') {
        const [code, result] = await googleApi.get('/customsearch/v1', {
          key: 'AIzaSyB-9vU4FkDG8E1STGcNQDC_nTHzLYLOsKY',
          cx: '003292925288195925892:6yuqd0j6-gk',
          q: realQuery,
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
        <TextInput initialValue={imageQuery} onInput={handleQueryInput} />
        <Button icon="search" className="raised" onClick={searchImages} title={_("image.search.button")} />
      </div>
      <div className="imageSearchImages" >
        { imageUrls.map((url, index) => <Image key={index} index={index} url={url} onSelect={chooseImage} selected={selected === index} />)}
      </div>
    </div>
  )
}

export default ImageSearcher