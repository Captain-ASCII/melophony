import 'core-js/stable'
import 'regenerator-runtime/runtime'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import App from './App.js'

import { reducer } from 'reducers/index'

import SplashScreen from './screens/SplashScreen.js'


import ActionManager from './utils/ActionManager'
import ApiManager from './utils/ApiManager'
import ConfigurationManager from './utils/ConfigurationManager'
import DataStorage from './utils/DataStorage'

global.actionManager = new ActionManager()
global.apiManager = new ApiManager('http://localhost:1958')
global.configurationManager = new ConfigurationManager()
global.dataStorage = new DataStorage()

async function getData() {
  let tracks = await (await fetch(`${global.configurationManager.get('serverAddress')}/tracks`)).json()
  let artists = await (await fetch(`${global.configurationManager.get('serverAddress')}/artists`)).json()
  
  // let tracks = {
  //     'hello1':{'id':'hello1','title':'Ça ira, ça ira','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/N831j0zt0jE/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':214,'startTime':0,'endTime':214,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'N831j0zt0jE'},
  //     'hello2':{'id':'hello2','title':'It Runs Through Me','artist':'GPjxprv3','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/M1N_wbhAfQ4/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-14T21:07:06.885Z','status':'Available','duration':299,'startTime':30,'endTime':299,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'M1N_wbhAfQ4'},
  //     'hello3':{'id':'hello3','title':'Jeremy's Storm','artist':'ZgNq1AOu','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/PB2SYop7AaY/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-15T21:07:06.885Z','status':'Available','duration':329,'startTime':0,'endTime':329,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'PB2SYop7AaY'},
  //     'hello4':{'id':'hello4','title':'Hot Hands','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/qZvQiOxddT8/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-18T21:07:06.885Z','status':'Available','duration':254,'startTime':0,'endTime':254,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'qZvQiOxddT8'},
  //     'hello5':{'id':'hello5','title':'Ça ira, ça ira','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/N831j0zt0jE/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':214,'startTime':0,'endTime':214,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'N831j0zt0jE'},
  //     'hello6':{'id':'hello6','title':'It Runs Through Me','artist':'GPjxprv3','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/M1N_wbhAfQ4/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-14T21:07:06.885Z','status':'Available','duration':299,'startTime':30,'endTime':299,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'M1N_wbhAfQ4'},
  //     'hello7':{'id':'hello7','title':'Jeremy's Storm','artist':'ZgNq1AOu','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/PB2SYop7AaY/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-15T21:07:06.885Z','status':'Available','duration':329,'startTime':0,'endTime':329,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'PB2SYop7AaY'},
  //     'hello8':{'id':'hello8','title':'Hot Hands','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/qZvQiOxddT8/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-18T21:07:06.885Z','status':'Available','duration':254,'startTime':0,'endTime':254,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'qZvQiOxddT8'},
  //     'hello9':{'id':'hello9','title':'Ça ira, ça ira','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/N831j0zt0jE/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':214,'startTime':0,'endTime':214,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'N831j0zt0jE'},
  //     'hello10':{'id':'hello10','title':'It Runs Through Me','artist':'GPjxprv3','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/M1N_wbhAfQ4/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-14T21:07:06.885Z','status':'Available','duration':299,'startTime':30,'endTime':299,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'M1N_wbhAfQ4'},
  //     'hello11':{'id':'hello11','title':'Jeremy's Storm','artist':'ZgNq1AOu','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/PB2SYop7AaY/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-15T21:07:06.885Z','status':'Available','duration':329,'startTime':0,'endTime':329,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'PB2SYop7AaY'},
  //     'hello12':{'id':'hello12','title':'Hot Hands','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/qZvQiOxddT8/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-18T21:07:06.885Z','status':'Available','duration':254,'startTime':0,'endTime':254,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'qZvQiOxddT8'},
  //     'hello13':{'id':'hello13','title':'Ça ira, ça ira','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/N831j0zt0jE/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':214,'startTime':0,'endTime':214,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'N831j0zt0jE'},
  //     'hello14':{'id':'hello14','title':'It Runs Through Me','artist':'GPjxprv3','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/M1N_wbhAfQ4/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-14T21:07:06.885Z','status':'Available','duration':299,'startTime':30,'endTime':299,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'M1N_wbhAfQ4'},
  //     'hello15':{'id':'hello15','title':'Jeremy's Storm','artist':'ZgNq1AOu','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/PB2SYop7AaY/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-15T21:07:06.885Z','status':'Available','duration':329,'startTime':0,'endTime':329,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'PB2SYop7AaY'},
  //     'hello16':{'id':'hello16','title':'Hot Hands','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/qZvQiOxddT8/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-18T21:07:06.885Z','status':'Available','duration':254,'startTime':0,'endTime':254,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'qZvQiOxddT8'},
  //     'hello17':{'id':'hello17','title':'Ça ira, ça ira','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/N831j0zt0jE/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':214,'startTime':0,'endTime':214,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'N831j0zt0jE'},
  //     'hello18':{'id':'hello18','title':'It Runs Through Me','artist':'GPjxprv3','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/M1N_wbhAfQ4/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-14T21:07:06.885Z','status':'Available','duration':299,'startTime':30,'endTime':299,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'M1N_wbhAfQ4'},
  //     'hello19':{'id':'hello19','title':'Jeremy's Storm','artist':'ZgNq1AOu','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/PB2SYop7AaY/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-15T21:07:06.885Z','status':'Available','duration':329,'startTime':0,'endTime':329,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'PB2SYop7AaY'},
  //     'hello20':{'id':'hello20','title':'Hot Hands','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/qZvQiOxddT8/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-18T21:07:06.885Z','status':'Available','duration':254,'startTime':0,'endTime':254,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'qZvQiOxddT8'},
  //     'hello21':{'id':'hello21','title':'Ça ira, ça ira','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/N831j0zt0jE/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':214,'startTime':0,'endTime':214,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'N831j0zt0jE'},
  //     'hello22':{'id':'hello22','title':'It Runs Through Me','artist':'GPjxprv3','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/M1N_wbhAfQ4/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-14T21:07:06.885Z','status':'Available','duration':299,'startTime':30,'endTime':299,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'M1N_wbhAfQ4'},
  //     'hello23':{'id':'hello23','title':'Jeremy's Storm','artist':'ZgNq1AOu','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/PB2SYop7AaY/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-15T21:07:06.885Z','status':'Available','duration':329,'startTime':0,'endTime':329,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'PB2SYop7AaY'},
  //     'hello24':{'id':'hello24','title':'Hot Hands','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/qZvQiOxddT8/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-18T21:07:06.885Z','status':'Available','duration':254,'startTime':0,'endTime':254,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'qZvQiOxddT8'}
  // };
  
  // let artists = {
  //     '0MIDU7cv':{'id':'0MIDU7cv','name':'The Pirouettes','tracks':[{'id':'3qzKo51V','title':'Ça ira, ça ira','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/N831j0zt0jE/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':214,'startTime':0,'endTime':214,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'N831j0zt0jE'},{'id':'9LndXO14','title':'Dernier métro','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/n-gZAn-2PcQ/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':261,'startTime':0,'endTime':261,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'n-gZAn-2PcQ'},{'id':'lEKAWQaT','title':'L'escalier','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/fc_UryVAfeA/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':212,'startTime':9,'endTime':212,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'fc_UryVAfeA'},{'id':'QgF9sDZs','title':'Medina II','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/91vmzrkk7JQ/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':106,'startTime':0,'endTime':106,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'91vmzrkk7JQ'},{'id':'l37YMe2p','title':'Just do it !','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/5-sfG8BV8wU/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-08-02T11:30:09.274Z','status':'Available','duration':'137','startTime':0,'endTime':139,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'5-sfG8BV8wU'},{'id':'Pa2ambgS','title':'Sweet child'o mine','artist':'0MIDU7cv','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/cl7a9YztLN4/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-08-02T11:34:19.419Z','status':'Available','duration':'174','startTime':0,'endTime':176,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'cl7a9YztLN4'}]},
  //     'bglHPYWF':{'id':'bglHPYWF','name':'Darius','tracks':[{'id':'b7NSfwpY','title':'Hot Hands','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/qZvQiOxddT8/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':254,'startTime':0,'endTime':254,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'qZvQiOxddT8'},{'id':'0f9FGcb9','title':'Espoir','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/6c9ZlkEzc6M/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':243,'startTime':0,'endTime':243,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'6c9ZlkEzc6M'},{'id':'zSEd5ubT','title':'Mountains','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/l0e_flmOsAc/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':323,'startTime':0,'endTime':323,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'l0e_flmOsAc'},{'id':'gl3v40jv','title':'Helios','artist':'bglHPYWF','album':'Unknown','imageSrc':{'uri':'https://i.ytimg.com/vi/A6efjoY8_m8/mqdefault.jpg'},'imageExtension':'jpg','creationDate':'2019-07-13T21:07:06.885Z','status':'Available','duration':199,'startTime':0,'endTime':199,'lastPlay':'','playCount':0,'rating':0,'progress':0,'videoId':'A6efjoY8_m8'}]}
  // };
  
  global.dataStorage.set('/tracks', tracks)
  global.dataStorage.set('/artists', artists)
  
  ReactDOM.render(
    <Provider store={store} >
      <App />
    </Provider>,
    document.getElementById('root')
  )
}

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

ReactDOM.render(
  <Provider store={store} >
    <SplashScreen getRequiredData={getData} />
  </Provider>,
  document.getElementById('root')
)

getData()
