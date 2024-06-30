import PropTypes from 'prop-types'
import toFixedNumber from '../helpers/toFixedNumber.jsx'

MoveByCardinalDirection.propTypes = {
  disabled: PropTypes.bool.isRequired,
  lat: PropTypes.number.isRequired,
  long: PropTypes.number.isRequired,
  updateLat: PropTypes.func.isRequired,
  updateLong: PropTypes.func.isRequired,
}

export default function MoveByCardinalDirection({ disabled, lat, long, updateLat, updateLong }) {
  const moveByCardinalDirection = to => {
    to === 'north' && updateLat(toFixedNumber(lat + 0.00001, 5))
    to === 'east' && updateLong(toFixedNumber(long + 0.00001, 5))
    to === 'south' && updateLat(toFixedNumber(lat - 0.00001, 5))
    to === 'west' && updateLong(toFixedNumber(long - 0.00001, 5))
  }

  return (
    <div>
      <h1>Use the buttons to adjust the position of the building and calculate the new coordinates.</h1>
      <button
        disabled={disabled}
        onClick={() => moveByCardinalDirection('north')}
        style={{ margin: '0 auto .5rem auto' }}
      >
        Move building North
      </button>
      <div style={{ margin: '0 auto', width: 'fit-content' }}>
        <button
          disabled={disabled}
          onClick={() => moveByCardinalDirection('west')}
          style={{ display: 'inline-block', marginRight: '.5rem' }}
        >
          Move Building West
        </button>
        <button
          disabled={disabled}
          onClick={() => moveByCardinalDirection('east')}
          style={{ display: 'inline-block' }}
        >
          Move Building East
        </button>
      </div>
      <button
        disabled={disabled}
        onClick={() => moveByCardinalDirection('south')}
        style={{ margin: '.5rem auto 0 auto' }}
      >
        Move Building South
      </button>
    </div>
  )
}
