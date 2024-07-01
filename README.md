<img src="./frontend/public/tileset-generator.svg" alt="tilsetGenerator" width="100"/>

# tilesetGenerator
The tilesetGenerator is a WebGIS-App to georeference 3D building models and create 3D Tiles tilesets. It was developed
for two research projects of the University of Cologne and is part of a Bachelor thesis. In its current state the
tilsetGenerator is highly customized to the requirements and data of the projects and therefore not universally usable.

## Getting started
The tilesetGenerator can be used [online](https://campusgis2.uni-koeln.de/tilesetgenerator/).

Alternatively you can run the app locally. It is recommend to use docker for that. Requirements:
- Install [Docker](https://www.docker.com/products/docker-desktop/). Docker Compose is included in Docker Desktop for
Windows and macOS. Click [here](https://github.com/docker/compose) for Linux installation.

#### Start container
```sh
docker compose up --build -d
```
The -d flag is optional, omit it if you want to see the logs.
The App is available at http://localhost:5173/.

#### Stop container
```sh
docker compose down
```

## Usage
The tilesetGenerator will create a mainTileset and one tileset for each building which will be referenced in the
mainTileset. A building may be a single 3D model or consist of multiple 3D models, representing each building level.
When models of building levels are used the tilesetGenerator will add these as children in the building's tileset. Each
building will be referenced relative to the mainTileset's centre. As this version is tailored to the needs of two
research projects, there are some prerequisites to using it:
- Only .glTF or .glb files can be used.
- The files follow a naming convention: Building files have to have a unique name (in the projects we use the building's
id, e.g. `303.glb`). Level files have to start with the unique building identifier, followed by two underscores and then
the level number (e.g. `303__-1.glb`, `303__0.glb`, `303__1.glb`). Therefore, the building id must not contain two
consecutive underscores.
- The centre of the main tileset is the Albertus-Magnus-Platz in Cologne and the building to be referenced is located
within a 10 km x 10 km square with Albertus-Magnus-Platz as the centre. If that is not the case you have to change the
hardcoded default mainTileset in `createDefaultMainTileset.jsx`, namely the `transform` attribute and/or
`boundingVolume` attribute.

With the `Select file/s` button you can add one or more 3D models. The models will only be used client side and will not
leave your computer at any time, nor does the tilesetGenerator save any information on the models or anything else.
Once you selected a model from your disc, it will be shown on the Albertus-Magnus-Platz, since this is the mainTileset's
center and the building itself has no position yet. You can now use the `Select` Button, which will reveal the inputs
and buttons to position the building. After you positioned all your buildings, you can download the generated tilesets
via the `Download tileset/s` button. When these tilesets are in the same folder as the 3D models they are ready to use.
If you prefer a different data structure, you will have to customize the `TilesetDownloadBtn` component.
