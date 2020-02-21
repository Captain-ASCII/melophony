import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

const IconButton = ({ onClick, title, icon, data }) => {
  const handleClick = useCallback(() => onClick(data))
  return (
    <i className={`fa fa-${icon} icon button`} onClick={handleClick} title={title}  />
  )
}

IconButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.any
}

export default IconButton