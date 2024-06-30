import { useState } from 'react'
import MoveByCardinalDirection from './MoveByCardinalDirection'
import PropTypes from 'prop-types'
import toFixedNumber from '../helpers/toFixedNumber.jsx'

TransformInputs.propTypes = {
  inputValuesChanged: PropTypes.func.isRequired,
  selectedModel: PropTypes.object,
}

export default function TransformInputs({ inputValuesChanged, selectedModel }) {
  const [inputValues, setInputValues] = useState({
    heading: 0,
    height: 0,
    lat: 50.92807,
    long: 6.92829,
    pitch: 0,
    roll: 0,
  })

  const updateInputValues = (attr, newVal) => {
    const updatedInputValues = {
      ...inputValues,
      [attr]: newVal,
    }

    setInputValues(updatedInputValues)
    inputValuesChanged(updatedInputValues, selectedModel)
  }

  return (
    <div>
      <div className="input-row">
        <div>
          <label htmlFor="lat-input">Latitude: </label>
          <input
            disabled={!selectedModel}
            id="lat-input"
            name="latitude"
            onChange={e => { updateInputValues('lat', toFixedNumber(+e.target.value, 5)) }}
            step="0.00001"
            type="number"
            value={inputValues.lat}
          />
        </div>
        <div>
          <label htmlFor="long-input">Longitude: </label>
          <input
            disabled={!selectedModel}
            id="long-input"
            name="longitude"
            onChange={e => { updateInputValues('long', toFixedNumber(+e.target.value, 5)) }}
            step="0.00001"
            type="number"
            value={inputValues.long}
          />
        </div>
        <div>
          <label htmlFor="height-input">Height: </label>
          <input
            disabled={!selectedModel}
            id="height-input"
            name="height"
            onChange={e => { updateInputValues('height', +e.target.value) }}
            step="0.1"
            type="number"
            value={inputValues.height}
          />
        </div>
      </div>
      <div className="input-row">
        <div>
          <label htmlFor="heading-input">Heading: </label>
          <input
            disabled={!selectedModel}
            id="heading-input"
            name="heading"
            onChange={e => { updateInputValues('heading', +e.target.value) }}
            step="0.1"
            type="number"
            value={inputValues.heading}
          />
        </div>
        <div>
          <label htmlFor="pitch-input">Pitch: </label>
          <input
            disabled={!selectedModel}
            id="pitch-input"
            name="pitch"
            onChange={e => { updateInputValues('pitch', +e.target.value) }}
            step="0.1"
            type="number"
            value={inputValues.pitch}
          />
        </div>
        <div>
          <label htmlFor="roll-input">Roll: </label>
          <input
            disabled={!selectedModel}
            id="roll-input"
            name="roll"
            onChange={e => { updateInputValues('roll', +e.target.value) }}
            step="0.1"
            type="number"
            value={inputValues.roll}
          />
        </div>
      </div>
      <div style={{ margin: '2rem auto .5rem auto', width: 'fit-content' }}>
        <MoveByCardinalDirection
          disabled={!selectedModel}
          lat={inputValues.lat}
          long={inputValues.long}
          updateLat={newVal => updateInputValues('lat', newVal)}
          updateLong={newVal => updateInputValues('long', newVal)}
        />
      </div>
    </div>
  )
}
