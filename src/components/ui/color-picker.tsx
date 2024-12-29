import { HexColorPicker } from "react-colorful"

export const ColorPicker = ({ color, onChange }) => {
  return <HexColorPicker color={color} onChange={onChange} />
}

