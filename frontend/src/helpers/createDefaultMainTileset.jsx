export default function createDefaultMainTileset() {
  return {
    asset: {
      version: '1.1',
    },
    schema: {
      id: 'cg2metadataV1',
      classes: {
        campusElement: {
          name: 'campusElement',
          description: 'Currently a campusElement references either a building or a level of a building',
          properties: {
            buildingId: {
              description: 'This should be the official UzK buildingId, but other id/names can be provided if needed.',
              type: 'SCALAR',
              componentType: 'INT8',
            },
            level: {
              description: 'If this is defined, it means that this campusElement is just this level of the building.',
              type: 'SCALAR',
              componentType: 'INT8',
            },
          },
        },
      },
    },
    root: {
      boundingVolume: {
        box: [
          0, 0, 0, 10000,
          0, 0, 0, 10000,
          0, 0, 0, 200,
        ],
      },
      children: [],
      geometricError: 20000,
      refine: 'ADD',
      transform: [
        -0.12062712460954786, 0.9926978879842713, 0, 0,
        -0.7706863170115904, -0.09364951363581787, 0.6302954619596158, 0,
        0.6256929738933811, 0.07603072923063509, 0.7763553507467535, 0,
        3998831.079016911, 485915.70577487565, 4928505.253901741, 1,
      ],
    },
  }
}
