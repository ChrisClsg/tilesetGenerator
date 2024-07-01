import axios from 'axios'

const aggregateBoundingVolumeBox = boundingVolumeBoxes => {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let minZ = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let maxZ = Number.NEGATIVE_INFINITY

  boundingVolumeBoxes.forEach(box => {
    const centerX = box[0]
    const centerY = box[1]
    const centerZ = box[2]

    const halfAxisX = Math.sqrt(box[3] * box[3] + box[4] * box[4] + box[5] * box[5])
    const halfAxisY = Math.sqrt(box[6] * box[6] + box[7] * box[7] + box[8] * box[8])
    const halfAxisZ = Math.sqrt(box[9] * box[9] + box[10] * box[10] + box[11] * box[11])

    const min = [
      centerX - halfAxisX,
      centerY - halfAxisY,
      centerZ - halfAxisZ,
    ]
    const max = [
      centerX + halfAxisX,
      centerY + halfAxisY,
      centerZ + halfAxisZ,
    ]

    minX = Math.min(minX, min[0])
    minY = Math.min(minY, min[1])
    minZ = Math.min(minZ, min[2])
    maxX = Math.max(maxX, max[0])
    maxY = Math.max(maxY, max[1])
    maxZ = Math.max(maxZ, max[2])
  })

  const aggregatedCenter = [
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2,
  ]

  const aggregatedHalfAxes = [
    (maxX - minX) / 2, 0, 0,
    0, (maxY - minY) / 2, 0,
    0, 0, (maxZ - minZ) / 2,
  ]

  const aggregatedBoundingBox = [
    aggregatedCenter[0], aggregatedCenter[1], aggregatedCenter[2],
    aggregatedHalfAxes[0], aggregatedHalfAxes[1], aggregatedHalfAxes[2],
    aggregatedHalfAxes[3], aggregatedHalfAxes[4], aggregatedHalfAxes[5],
    aggregatedHalfAxes[6], aggregatedHalfAxes[7], aggregatedHalfAxes[8],
  ]

  return aggregatedBoundingBox
}

const createBoundingVolumeBox = async ({ modelType, modelUrl }) => {
  let boundingVolumeBox = [
    0, 0, 0, 100,
    0, 0, 0, 100,
    0, 0, 0, 50,
  ]

  if (modelType === 'glb') {
    // Since .glb is a binary file format, we need to get a arraybuffer an manually extract the JSON Chunk of
    // the .glb file.
    await axios.get(modelUrl, { responseType: 'arraybuffer' }).then(res => {
      const headerView = new DataView(res.data, 0, 20)
      const jsonChunkLength = headerView.getUint32(12, true)
      const jsonChunkOffset = 20

      const jsonChunkArrayBuffer = res.data.slice(jsonChunkOffset, jsonChunkOffset + jsonChunkLength)
      const jsonChunk = new TextDecoder().decode(jsonChunkArrayBuffer)
      const jsonObject = JSON.parse(jsonChunk)

      boundingVolumeBox = calculateBoundingVolumeBox(getMaxMinAndOffsetValues(jsonObject))
    })
  } else if (modelType === 'gltf') {
    await axios.get(modelUrl).then(res => {
      boundingVolumeBox = calculateBoundingVolumeBox(getMaxMinAndOffsetValues(res.data))
    })
  } else {
    console.error('File is neither .glb nor .gltf!')
  }

  return boundingVolumeBox
}

// Calculates a bounding volume box from given max and min values of the x-, y- and z-axis.
const calculateBoundingVolumeBox = ({ maxX, maxY, maxZ, minX, minY, minZ, offsetX, offsetY, offsetZ }) => {
  // The size of the box
  const dx = maxX - minX
  const dy = maxY - minY
  const dz = maxZ - minZ

  // The center of the box
  const cx = minX + dx * 0.5
  const cy = minY + dy * 0.5
  const cz = (minZ + dz * 0.5) + offsetZ

  // The x-direction and half length
  const hxx = (dx + offsetX) * 0.5
  const hxy = 0
  const hxz = 0

  // The y-direction and half length
  const hyx = 0
  const hyy = (dy + offsetY) * 0.5
  const hyz = 0

  // The z-direction and half length
  const hzx = 0
  const hzy = 0
  const hzz = dz * 0.5

  return [
    cx, cy, cz,
    hxx, hxy, hxz,
    hyx, hyy, hyz,
    hzx, hzy, hzz,
  ]
}

// Loops through every accessor and node of a gltf file to get the absolute max and min values of the x-, y- and z-axis,
// as well the highest translation values of the x-, y- and z-axis. Translation will be referred to as offset.
const getMaxMinAndOffsetValues = gltf => {
  const minMaxAccessors = gltf.accessors.filter(el => el.max && el.min)
  const nodesWithTranslation = gltf.nodes.filter(node => node.translation)
  let offsets = {}

  if (gltf.nodes) {
    offsets = {
      offsetX: Math.max(...nodesWithTranslation.map(node => node.translation[0])),
      offsetY: Math.max(...nodesWithTranslation.map(node => node.translation[1])),
      offsetZ: Math.max(...nodesWithTranslation.map(node => node.translation[2])),
    }
  }

  return transformYUpToZUp({
    maxX: minMaxAccessors.reduce((a, b) => a.max[0] > b.max[0] ? a : b).max[0],
    maxY: minMaxAccessors.reduce((a, b) => a.max[1] > b.max[1] ? a : b).max[1],
    maxZ: minMaxAccessors.reduce((a, b) => a.max[2] > b.max[2] ? a : b).max[2],
    minX: minMaxAccessors.reduce((a, b) => a.min[0] < b.min[0] ? a : b).min[0],
    minY: minMaxAccessors.reduce((a, b) => a.min[1] < b.min[1] ? a : b).min[1],
    minZ: minMaxAccessors.reduce((a, b) => a.min[2] < b.min[2] ? a : b).min[2],
    ...offsets,
  })
}

// Transforms axes from y-up to z-up. The standard for gltf files is y-up but the standard for 3D-Tiles is z-up.
const transformYUpToZUp = ({ maxX, maxY, maxZ, minX, minY, minZ, offsetX = 0, offsetY = 0, offsetZ = 0 }) => {
  return {
    maxX: maxX,
    maxY: maxZ,
    maxZ: maxY,
    minX: minX,
    minY: minZ,
    minZ: minY,
    offsetX: offsetX,
    offsetY: offsetZ,
    offsetZ: offsetY,
  }
}

export {
  aggregateBoundingVolumeBox,
  createBoundingVolumeBox,
}
