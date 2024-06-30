import PropTypes from 'prop-types'

FileInput.propTypes = {
  models: PropTypes.array.isRequired,
  onNewFiles: PropTypes.func.isRequired,
}

export default function FileInput({ models, onNewFiles }) {
  const handleFileChange = e => {
    const acceptedFiles = []
    const deniedFiles = []
    const filesWithoutConflict = []
    const selectedFiles = [...e.target.files]
    let buildingIdMap = new Map()

    selectedFiles.forEach(file => {
      const buildingId = getBuildingId(file.name)
      const isFileLevel = file.name.includes('__')

      if (!buildingIdMap.has(buildingId)) {
        buildingIdMap.set(buildingId, { hasLevel: isFileLevel })
      } else {
        const building = buildingIdMap.get(buildingId)

        if (isFileLevel !== building.hasLevel) {
          building.conflict = true
          buildingIdMap.set(buildingId, building)
        }
      }
    })

    selectedFiles.forEach(file => {
      const buildingInfo = buildingIdMap.get(getBuildingId(file.name))

      if (buildingInfo.conflict) deniedFiles.push(file)
      else filesWithoutConflict.push(file)
    })

    filesWithoutConflict.forEach(file => {
      if (isModelNameUnique(file.name) || isModelANewLevel(file.name)) acceptedFiles.push(file)
      else deniedFiles.push(file)
    })

    if (deniedFiles.length > 0) {
      const alertMessage = `The following files already exist or have conflicting names and were not added: ${
        deniedFiles.map(file => file.name).join(', ')
      }`

      console.warn(alertMessage)
      alert(alertMessage)
    }

    onNewFiles(acceptedFiles)

    // This resets the FileList of the input field. Since our source of truth is App.jsx's
    // models state and we work with the onChange event, we don't want the FileList's previous
    // content to interfere when deciding how we handle a file.
    e.target.value = ''
  }

  const getBuildingId = fileName => {
    return fileName.split('__')[0].split('.')[0]
  }

  const isModelANewLevel = fileName => {
    if (!fileName.split('__')[1]) return false
    const model = models.find(model => model.modelName === fileName.split('__')[0].split('.')[0])

    if (model.levels) {
      return !model.levels.some(level => level.modelLevel === fileName.split('__')[1].split('.')[0])
    }

    return false
  }

  const isModelNameUnique = fileName => {
    return !models.some(model => model.modelName === fileName.split('__')[0].split('.')[0])
  }

  return (
    <div>
      <input
        accept=".glb, .gltf"
        id="file-input"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        type="file"
      />
      <input
        type="button"
        value="Select file/s"
        onClick={() => document.getElementById('file-input').click()}
      />
    </div>
  )
}
