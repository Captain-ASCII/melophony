import { StylesConfig } from 'react-select'

export const SelectStyles: StylesConfig = {
  container: (styles: any) => ({ ...styles, flex: 1 }),
  valueContainer: (styles: any) => ({...styles, height: 30 }),
  control: (styles: any) => ({ ...styles, backgroundColor: '#22252c', borderWidth: 0, minHeight: 36, height: 36, flex: 1 }),
  option: (styles: any) => ({...styles, backgroundColor: '#22252c' }),
  placeholder: (styles: any) => ({...styles, fontSize: 13 }),
  input: (styles: any) => ({...styles, color: 'white', fontSize: 13}),
  singleValue: (styles: any) => ({...styles , color: 'white'}),
  multiValue: (styles: any) => ({ ...styles, backgroundColor: '#2c84F8' }),
  multiValueLabel: (styles: any) => ({...styles, color: 'white', fontSize: 13, fontFamily: 'Arial'}),
  menuList: (styles: any) => ({...styles, color: 'white', fontSize: 13, fontFamily: 'Arial'}),
  multiValueRemove: (styles: any) => ({...styles, ':hover': {color: '#dc2d1b'}}),
  menu: (styles: any) => ({...styles, backgroundColor: '#22252c'})
}