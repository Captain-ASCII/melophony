import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import InputWithIcon from '@components/InputWithIcon'
import TextInput from '@components/TextInput'

import { _ } from '@utils/TranslationUtils'

import { TrackProviderParameters } from './ProviderList'


const MAGIC_LENGTH_CONSTANT = 0.000060105


const FileUploadProvider = ({ setData, setTitle, setArtistName } : TrackProviderParameters): JSX.Element => {

  const SEPARATOR = "-"

  const [ file, setFile ] = useState(null)
  const [ duration, setDuration ] = useState('')

  const onDrop = useCallback(acceptedFile => {
    const file = acceptedFile[0]
    setFile(file)
    setData(file)

    const fileName = file.name.replace(/\.[^/.]+$/, "")
    const splitFileName = fileName.split(SEPARATOR)
    if (splitFileName.length > 1) {
      setArtistName(splitFileName[0].trim())
      setTitle(splitFileName[1].trim())
    }
    setDuration(`${Math.round(file.size * MAGIC_LENGTH_CONSTANT)}`)
  }, [])
  const { getRootProps, getInputProps } = useDropzone({onDrop, maxFiles: 1})
  const handleDuration = useCallback(value => setDuration(value), [setDuration])

  return (
    <>
      <InputWithIcon icon="upload">
        <div>
          <div className="dropZone" {...getRootProps()} >
            <input {...getInputProps()} />
            <p>{file !== null ? file.name : _("track.creation.drop.placeholder") }</p>
          </div>
          <p id="uploadFormatExplanation" >{_("track.creation.provider.upload.title.explanation")}</p>
        </div>
      </InputWithIcon>
      <InputWithIcon icon="ruler">
        <TextInput disabled={file === null} placeHolder="track.creation.track.length" value={duration} onInput={handleDuration} />
      </InputWithIcon>
    </>
  )
}

export default FileUploadProvider