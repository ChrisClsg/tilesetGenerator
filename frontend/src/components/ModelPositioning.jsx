import {
  Cartesian3,
  HeadingPitchRoll,
  Math as CesiumMath,
  Matrix4,
  Transforms,
} from 'cesium'
import PropTypes from 'prop-types'
import TransformInputs from './TransformInputs'

ModelPositioning.propTypes = {
  mainTileset: PropTypes.object.isRequired,
  models: PropTypes.array.isRequired,
  selectedModel: PropTypes.object,
  setMainTileset: PropTypes.func.isRequired,
}

export default function ModelPositioning({ mainTileset, models, selectedModel, setMainTileset }) {
  const createTransformationMatrixRelativeToMainTileset = ({
    heading = 0,
    height = 0,
    lat,
    long,
    pitch = 0,
    roll = 0,
  }) => {
    const position = Cartesian3.fromDegrees(long, lat, height)
    const hpr = new HeadingPitchRoll(
      CesiumMath.toRadians(heading), CesiumMath.toRadians(pitch), CesiumMath.toRadians(roll),
    )
    const transform = Transforms.headingPitchRollToFixedFrame(position, hpr)

    const transformRelativeToMainTileset = Matrix4.multiply(
      Matrix4.inverse(Matrix4.fromArray(mainTileset.root.transform), new Matrix4()), transform, new Matrix4(),
    )

    return transformRelativeToMainTileset
  }

  const updateTransformation = (inputValues, selectedModel) => {
    const transform = createTransformationMatrixRelativeToMainTileset(inputValues)
    const childIndex = [...mainTileset.root.children].findIndex(
      child => child.metadata.properties.buildingId === selectedModel.modelName,
    )

    const updatedChild = {
      ...mainTileset.root.children[childIndex],
      transform: Object.values(transform),
    }

    const updatedChildren = mainTileset.root.children

    updatedChildren.splice(childIndex, 1, updatedChild)

    setMainTileset(prevTileset => ({
      ...prevTileset,
      root: {
        ...prevTileset.root,
        children: updatedChildren,
      },
    }))
  }

  return (
    <div>
      {
        models.map(model => (
          <div key={`${model.modelName}-input`}>
            <div style={{ display: model === selectedModel ? 'block' : 'none' }}>
              <h3>{ `Change position for '${model.modelName}':` }</h3>
              <TransformInputs
                selectedModel={selectedModel}
                inputValuesChanged={(inputValues, selectedModel) => updateTransformation(inputValues, selectedModel)}
              />
            </div>
          </div>
        ))
      }
    </div>
  )
}
