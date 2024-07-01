import PropTypes from 'prop-types'

ModelList.propTypes = {
  models: PropTypes.array.isRequired,
  removeModel: PropTypes.func.isRequired,
  selectedModel: PropTypes.object,
  setSelectedModel: PropTypes.func.isRequired,
}

export default function ModelList({ models, removeModel, selectedModel, setSelectedModel }) {
  const handleModelSelection = model => {
    if (selectedModel === model) setSelectedModel(null)
    else setSelectedModel(model)
  }

  return (
    <div
      className="models-list-container"
      style={{ display: models.size < 1 ? 'none' : 'block' }}
    >
      <ul>
        {
          models.map(model => (
            <li
              className={
                model === selectedModel ? 'selected' : ''
              }
              key={model.modelName}
            >
              <span className="model-name">{ model.modelName }</span>
              <button onClick={() => handleModelSelection(model)}>Select</button>
              <button onClick={() => removeModel(model)}>Delete</button>
            </li>
          ))
        }
      </ul>
    </div>
  )
}
