
import Configuration from '@models/Configuration'

export const SET_CONFIGURATION = 'SET_CONFIGURATION'

interface SetConfigurationAction {
  type: typeof SET_CONFIGURATION;
  configuration: Configuration;
}

export const setConfiguration = (configuration: Configuration): SetConfigurationAction => ({ type: SET_CONFIGURATION, configuration })

export type ConfigurationAction = SetConfigurationAction