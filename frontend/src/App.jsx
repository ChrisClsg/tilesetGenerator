import { useEffect, useRef, useState } from 'react'
import './App.css'
import { version as currentTgVersion } from '../package.json'

import { aggregateBoundingVolumeBox, createBoundingVolumeBox } from './helpers/createBoundingVolumeBox.jsx'
import createDefaultMainTileset from './helpers/createDefaultMainTileset.jsx'

import FileInput from './components/FileInput'
import ModelList from './components/ModelList'
import ModelPositioning from './components/ModelPositioning'
import TilesetDownloadBtn from './components/TilesetDownloadBtn'

import {
  Camera,
  Cartesian3,
  Cesium3DTileset,
  createDefaultImageryProviderViewModels,
  Math as CesiumMath,
  Rectangle,
  Viewer,
} from 'cesium'

function App() {
  const [mainTileset, setMainTileset] = useState(createDefaultMainTileset())
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState(null)

  const mainTilesetUrl = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    if (!viewerRef.current) {
      addCesiumViewer()

      viewerRef.current.scene.camera.setView({
        destination: Cartesian3.fromDegrees(6.9282, 50.9264, 400),
        orientation: {
          pitch: CesiumMath.toRadians(-60),
        },
      })
    }
  })

  useEffect(() => {
    if (mainTilesetUrl.current) URL.revokeObjectURL(mainTilesetUrl.current)
    const newUrl = createTilesetUrl(mainTileset)

    mainTilesetUrl.current = newUrl
    loadNewTileset(newUrl)
  }, [mainTileset])

  const addCesiumViewer = () => {
    const defaultImageryProviderViewModels = createDefaultImageryProviderViewModels()
    const filteredImageryProviderViewModels = defaultImageryProviderViewModels.filter(e => {
      return e.name === 'ArcGIS World Imagery' || e.name === 'Open­Street­Map'
    })
    const osmImageryProviderViewModel = filteredImageryProviderViewModels.find(e => e.name === 'Open­Street­Map')

    const viewer = new Viewer('cesium-container', {
      animation: false,
      geocoder: false,
      imageryProviderViewModels: filteredImageryProviderViewModels,
      sceneModePicker: false,
      selectedImageryProviderViewModel: osmImageryProviderViewModel,
      terrainProviderViewModels: [],
      timeline: false,
    })

    viewerRef.current = viewer

    // Set the camera extent for the 'View home' button
    const cameraExtent = Rectangle.fromDegrees(6.92136, 50.92535, 6.93595, 50.93088)
    Camera.DEFAULT_VIEW_RECTANGLE = cameraExtent
    Camera.DEFAULT_VIEW_FACTOR = 0
  }

  const addChildToMainTileset = ({ boundingVolumeBox, modelName, tilesetUrl }) => {
    const newChild = {
      boundingVolume: {
        box: boundingVolumeBox,
      },
      content: { uri: tilesetUrl },
      metadata: {
        class: 'campusElement',
        properties: {
          buildingId: modelName,
        },
      },
      refine: 'ADD',
    }

    setMainTileset(prevTileset => ({
      ...prevTileset,
      root: {
        ...prevTileset.root,
        children: [...prevTileset.root.children, newChild],
      },
    }))
  }

  const createModelTileset = async ({ boundingVolumeBox, modelName, modelUrl }) => {
    const tileset = {
      asset: {
        version: '1.1',
      },
      root: {
        boundingVolume: {
          box: boundingVolumeBox,
        },
        content: { uri: modelUrl },
        metadata: {
          class: 'campusElement',
          properties: {
            buildingId: modelName,
          },
        },
        refine: 'ADD',
      },
    }

    const tilesetUrl = createTilesetUrl(tileset)

    return [tileset, tilesetUrl]
  }

  const createModelTilesetWithChild = ({ boundingVolumeBox, modelLevel, modelName, modelUrl }) => {
    const tileset = {
      asset: {
        version: '1.1',
      },
      root: {
        boundingVolume: {
          box: boundingVolumeBox,
        },
        children: [
          {
            boundingVolume: {
              box: boundingVolumeBox,
            },
            content: { uri: modelUrl },
            metadata: {
              class: 'campusElement',
              properties: {
                buildingId: modelName,
                level: modelLevel,
              },
            },
          },
        ],
        metadata: {
          class: 'campusElement',
          properties: {
            buildingId: modelName,
          },
        },
        refine: 'ADD',
      },
    }

    const tilesetUrl = createTilesetUrl(tileset)

    return [tileset, tilesetUrl]
  }

  const createTilesetUrl = tileset => {
    return URL.createObjectURL(
      new Blob([JSON.stringify(tileset, null, 2)], { type: 'application/json' }),
    )
  }

  const createUpdatedModelAndUpdateMainTileset = (model, child) => {
    const updatedLevels = [...model.levels, child]

    const updatedModel = {
      ...model,
      levels: updatedLevels,
    }

    const boundingVolumes = model.levels.map(level => level.boundingVolumeBox)
    const aggregatedBoundingVolumeBox = aggregateBoundingVolumeBox([...boundingVolumes, child.boundingVolumeBox])

    const updatedModelTileset = {
      ...model.tileset,
      root: {
        ...model.tileset.root,
        boundingVolume: { box: aggregatedBoundingVolumeBox },
        children: [
          ...model.tileset.root.children,
          {
            boundingVolume: {
              box: child.boundingVolumeBox,
            },
            content: { uri: child.modelUrl },
            metadata: {
              class: 'campusElement',
              properties: {
                buildingId: child.modelName,
                level: child.modelLevel,
              },
            },
            refine: 'ADD',
          },
        ],
      },
    }

    updatedModel.tileset = updatedModelTileset
    updatedModel.tilesetUrl = createTilesetUrl(updatedModel.tileset)

    URL.revokeObjectURL(model.tilesetUrl)

    setMainTileset(prevTileset => {
      const newChildren = prevTileset.root.children.map(child => {
        if (child.metadata.properties.buildingId !== model.modelName) return child
        return {
          ...child,
          boundingVolume: { box: aggregatedBoundingVolumeBox },
          content: { uri: updatedModel.tilesetUrl },
        }
      })

      return {
        ...prevTileset,
        root: {
          ...prevTileset.root,
          children: newChildren,
        },
      }
    })

    return updatedModel
  }

  const getModelLevelFromFileName = modelName => {
    return modelName.split('__')[1].split('.')[0]
  }

  const getBuildingIdFromFileName = modelName => {
    return modelName.split('__')[0]
  }

  const handleNewBuilding = async file => {
    const [name, type] = file.name.split('.')

    const model = {
      modelName: name,
      modelType: type,
      modelUrl: URL.createObjectURL(file),
    }

    model.boundingVolumeBox = await createBoundingVolumeBox(model)

    const [tileset, tilesetUrl] = await createModelTileset(model)
    model.tileset = tileset
    model.tilesetUrl = tilesetUrl

    await addChildToMainTileset(model)
    setModels(prevModels => [...prevModels, model])
  }

  const handleNewFiles = async files => {
    for (const file of files) {
      if (isModelALevel(file.name)) await handleNewLevel(file)
      else await handleNewBuilding(file)
    }
  }

  const handleNewLevel = async file => {
    const child = {
      modelFile: file,
      modelLevel: getModelLevelFromFileName(file.name),
      modelName: getBuildingIdFromFileName(file.name),
      modelType: file.name.split('.')[1],
      modelUrl: URL.createObjectURL(file),
    }

    child.boundingVolumeBox = await createBoundingVolumeBox(child)

    setModels(prevModels => {
      const existingModel = prevModels.find(model => model.modelName === child.modelName)

      if (existingModel) {
        if (!existingModel.levels.some(level => level.modelLevel === child.modelLevel)) {
          const updatedModel = createUpdatedModelAndUpdateMainTileset(existingModel, child)

          return prevModels.map(model =>
            model.modelName !== existingModel.modelName ? model : updatedModel,
          )
        }
      } else {
        const [tileset, tilesetUrl] = createModelTilesetWithChild(child)
        const model = {
          levels: [child],
          boundingVolumeBox: child.boundingVolumeBox,
          modelName: child.modelName,
          tileset: tileset,
          tilesetUrl: tilesetUrl,
        }
        addChildToMainTileset(model)
        return [...prevModels, model]
      }
    })
  }

  const isModelALevel = fileName => {
    return fileName.includes('__')
  }

  const loadNewTileset = async tilesetUrl => {
    const viewer = viewerRef.current

    const tileset = await Cesium3DTileset.fromUrl(
      tilesetUrl,
      {
        debugShowBoundingVolume: true,
        debugShowContentBoundingVolume: true,
      },
    )

    // Remove current tileset before adding the new one
    viewer.scene.primitives.removeAll()
    await viewer.scene.primitives.add(tileset)
  }

  const removeChildFromMainTileset = modelName => {
    const updatedChildren = mainTileset.root.children.filter(child => {
      return child.metadata.properties.buildingId !== modelName
    })

    setMainTileset(prevTileset => ({
      ...prevTileset,
      root: {
        ...prevTileset.root,
        children: updatedChildren,
      },
    }))
  }

  const removeModel = ({ modelName, modelUrl }) => {
    URL.revokeObjectURL(modelUrl)

    if (selectedModel?.modelName === modelName) setSelectedModel(null)

    removeChildFromMainTileset(modelName)
    setModels(prevModels => prevModels.filter(model => model.modelName !== modelName))
  }

  return (
    <div>
      <div id="cesium-container"></div>
      <div id="container">
        <h3 style={{ marginTop: 0 }}>Select one or multiple glb/glTF file/s</h3>

        <FileInput
          models={models}
          onNewFiles={files => handleNewFiles(files)}
        />

        <ModelList
          models={models}
          removeModel={model => removeModel(model)}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

        <ModelPositioning
          mainTileset={mainTileset}
          models={models}
          selectedModel={selectedModel}
          setMainTileset={setMainTileset}
        />

        <TilesetDownloadBtn
          mainTileset={mainTileset}
          models={models}
        />
      </div>
      <div className="tg-logo-container">
        <img
          alt="tilesetGenerator"
          height="35px"
          src={`${import.meta.env.BASE_URL}/tileset-generator.svg`}
          width="35px"
        />
        <span>
          { `tG v${currentTgVersion}` }
        </span>
      </div>
    </div>
  )
}

export default App
