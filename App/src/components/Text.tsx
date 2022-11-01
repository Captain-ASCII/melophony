import React, { Fragment } from 'react'

import { useTranslation } from '@utils/TranslationUtils'

const Text = ({ children, args }: { children: string; args: Array<any> }): JSX.Element => {
  return <Fragment>{ useTranslation(children, args) }</Fragment>
}

export default Text