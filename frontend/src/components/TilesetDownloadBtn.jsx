import PropTypes from 'prop-types'

import axios from 'axios'
import cloneDeep from 'lodash.clonedeep'
import fileDownload from 'js-file-download'

TilesetDownloadBtn.propTypes = {
  mainTileset: PropTypes.object.isRequired,
  models: PropTypes.array,
}

export default function TilesetDownloadBtn({ mainTileset, models }) {
  const createTilesetFiles = () => {
    const files = [{
      name: 'tileset__campus.json',
      url: cleanUpMainTileset(mainTileset),
    }]

    if (models.length) {
      models.forEach(model => {
        files.push({
          name: `tileset__${model.modelName}.json`,
          url: cleanUpChildTileset(model),
        })
      })
    }

    return files
  }

  const cleanUpChildTileset = ({ levels, modelName, modelType, tileset }) => {
    const cleanTileset = cloneDeep(tileset)
    if (cleanTileset.root.children) {
      cleanTileset.root.children.forEach(child => {
        const level = levels.find(level => level.modelLevel === child.metadata.properties.level)
        child.content.uri = `${modelName}__${child.metadata.properties.level}.${level.modelType}`
      })
    } else {
      cleanTileset.root.content.uri = `${modelName}.${modelType}`
    }

    return createTilesetUrl(cleanTileset)
  }

  const cleanUpMainTileset = mainTileset => {
    const cleanTileset = cloneDeep(mainTileset)

    cleanTileset.root.children.forEach(child => {
      child.content.uri = `tileset__${child.metadata.properties.buildingId}.json`
    })

    return createTilesetUrl(cleanTileset)
  }

  const createTilesetUrl = tileset => {
    return URL.createObjectURL(
      new Blob([JSON.stringify(tileset, null, 2)], { type: 'application/json' }),
    )
  }

  const handleDownload = () => {
    const files = createTilesetFiles()

    files.forEach(file => {
      axios.get(file.url, { responseType: 'blob' }).then(res => {
        fileDownload(res.data, file.name)
      })
    })

    // Clean up memory
    files.forEach(file => URL.revokeObjectURL(file.url))
  }

  return (
    <button
      onClick={() => handleDownload()}
      style={{ marginTop: '1rem' }}
    >
      Download tileset/s
    </button>
  )
}
