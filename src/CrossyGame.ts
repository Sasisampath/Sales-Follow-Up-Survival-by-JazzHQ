import { Renderer } from "expo-three";
import { TweenMax } from "gsap";
import { Vibration } from "react-native";
import {
  AmbientLight,
  DirectionalLight,
  Group,
  OrthographicCamera,
  Scene,
} from "three";

import * as THREE from "three";

import AudioManager from "./AudioManager";
import { CHECKPOINT_TILE_COLOR } from "./game/RowFactory";
import { groundLevel, MAP_OFFSET, maxRows } from "./GameSettings";
import Feathers from "./Particles/Feathers";
import Water from "./Particles/Water";
import Rows from "./Row";
import { Fill } from "./Row/Grass";

// TODO Add to state - disable/enable when battery is low
const useParticles = true;
const useShadows = true;

export class CrossyScene extends Scene {
  world: CrossyWorld;
  worldWithCamera: Group;
  constructor({ gl }) {
    super();
    this.__gl = gl;

    this.worldWithCamera = new Group();
    this.world = new CrossyWorld();
    this.worldWithCamera.add(this.world);
    this.add(this.worldWithCamera);

    const light = new DirectionalLight(0xffffff, 1.0);
    light.position.set(20, 30, 0.05);
    light.castShadow = useShadows;
    light.shadow.mapSize.width = 1024 * 2;
    light.shadow.mapSize.height = 1024 * 2;

    const d = 15;
    const v = 6;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = 9;
    light.shadow.camera.top = v;
    light.shadow.camera.bottom = -v;
    light.shadow.camera.far = 100;
    light.shadow.bias = 0.0001;

    this.add(light);

    this.light = light;

    // let helper = new CameraHelper(light.shadow.camera);
    // this.add(helper);
  }

  setShadowsEnabled(enabled) {
    this.light.castShadow = enabled;
  }

  resetParticles = (position) => {
    if (!useParticles) return;
    this.featherParticles.mesh.position.copy(position);
    this.waterParticles.mesh.position.copy(position);
    this.featherParticles.mesh.position.y = 0;
    this.waterParticles.mesh.position.y = 0;
  };

  useParticle = (model, type, direction = 0) => {
    if (!useParticles) return;
    requestAnimationFrame(async () => {
      if (type === "water") {
        this.waterParticles.mesh.position.copy(model.position);
        this.waterParticles.run(type);
        await AudioManager.playAsync(AudioManager.sounds.water);
      } else if (type === "feathers") {
        this.featherParticles.mesh.position.copy(model.position);
        this.featherParticles.run(type, direction);
      }
    });
  };

  waterParticles: Water | undefined;
  featherParticles: Feathers | undefined;

  createParticles = () => {
    if (!useParticles) return;

    this.waterParticles = new Water();
    this.world.add(this.waterParticles.mesh);

    this.featherParticles = new Feathers();
    this.world.add(this.featherParticles.mesh);
  };

  rumble = () => {
    Vibration.vibrate();

    TweenMax.to(this.position, 0.2, {
      x: 0,
      y: 0,
      z: 1,
    });
    TweenMax.to(this.position, 0.2, {
      x: 0,
      y: 0,
      z: 0,
      delay: 0.2,
    });
  };
}

export class CrossyCamera extends OrthographicCamera {
  constructor() {
    super(-1, 1, 1, -1, -30, 30);
    this.position.set(-1, 2.8, -2.9); // Change -1 to -.02
    this.lookAt(0, 0, 0);
  }

  updateScale = ({ width, height, scale }) => {
    this.left = -(width * scale);
    this.right = width * scale;
    this.top = height * scale;
    this.bottom = -(height * scale);
    this.zoom = 400;
    this.updateProjectionMatrix();
  };
}

export class CrossyWorld extends Group {
  constructor() {
    super();

    this.add(new AmbientLight(0xffffff, 1.8));
  }

  createParticles = () => {
    this.waterParticles = new Water();
    this.add(this.waterParticles.mesh);

    this.featherParticles = new Feathers();
    this.add(this.featherParticles.mesh);
  };
}

export class CrossyRenderer extends Renderer {
  constructor(props) {
    super(props);
    this.__gl = props.gl;
    this.setShadowsEnabled(useShadows);

    // Set proper color space for vibrant colors
    this.outputColorSpace = THREE.SRGBColorSpace;
  }

  setShadowsEnabled(enabled) {
    this.shadowMap.enabled = enabled;
  }
}

export class GameMap {
  floorMap = {};

  reset() {
    this.floorMap = {};
  }

  getRow(index) {
    return this.floorMap[`${index}`];
  }
  setRow(index, value) {
    this.floorMap[`${index}`] = value;
  }

  // Detect collisions with trees/cars
  treeCollision = (position) => {
    const targetZ = `${position.z | 0}`;
    if (targetZ in this.floorMap) {
      const { type, entity } = this.floorMap[targetZ];
      if (type === "grass" || type === "decision") {
        const key = `${position.x | 0}`;
        if (key in entity.obstacleMap) {
          return true;
        }
      }
    }

    return false;
  };
}

export class EntityContainer {
  items = [];
  count = 0;
}

export class CrossyGameMap extends GameMap {
  grasses = new EntityContainer();
  water = new EntityContainer();
  roads = new EntityContainer();
  railRoads = new EntityContainer();
  rowCount = 0;

  constructor({ heroWidth, onCollide, scene, missionEngine }) {
    super();

    this.heroWidth = heroWidth;
    this.missionEngine = missionEngine;

    // Assign mesh to corresponding array
    // and add mesh to scene
    for (let i = 0; i < maxRows; i++) {
      this.grasses.items[i] = new Rows.Grass(this.heroWidth);
      this.water.items[i] = new Rows.Water(this.heroWidth, onCollide);
      this.roads.items[i] = new Rows.Road(this.heroWidth, onCollide);
      this.railRoads.items[i] = new Rows.RailRoad(this.heroWidth, onCollide);
      scene.world.add(this.grasses.items[i]);
      scene.world.add(this.water.items[i]);
      scene.world.add(this.roads.items[i]);
      scene.world.add(this.railRoads.items[i]);
    }
  }

  tick(dt, hero) {
    for (const railRoad of this.railRoads.items) {
      railRoad.update(dt, hero);
    }
    for (const road of this.roads.items) {
      road.update(dt, hero);
    }
    for (const water of this.water.items) {
      water.update(dt, hero);
    }

    const pulseT = performance.now() * 0.004;
    for (const grass of this.grasses.items) {
      const marker = grass.userData?.decisionMarker as THREE.Mesh | undefined;
      const mat = marker?.material as THREE.MeshBasicMaterial | undefined;
      if (mat) {
        const phase = pulseT + (grass.position?.z ?? 0) * 0.7;
        mat.opacity = 0.36 + 0.24 * Math.sin(phase);
        const hue = 0.11 + 0.028 * Math.sin(phase * 1.3);
        mat.color.setHSL(hue, 0.92, 0.56);
      }
    }
  }

  // Helper to get clear positions (positions without obstacles) from a grass row
  getClearPositionsFromGrass = (grassEntity): number[] => {
    const blockedPositions = grassEntity.getBlockedPositions();
    const blockedSet = new Set(blockedPositions);
    // Playable x range is typically -4 to 4 (center area)
    const clearPositions: number[] = [];
    for (let x = -4; x <= 4; x++) {
      if (!blockedSet.has(x)) {
        clearPositions.push(x);
      }
    }
    return clearPositions;
  };

  // Scene generators
  newRow = (rowKind) => {
    if (this.grasses.count === maxRows) {
      this.grasses.count = 0;
    }
    if (this.roads.count === maxRows) {
      this.roads.count = 0;
    }
    if (this.water.count === maxRows) {
      this.water.count = 0;
    }
    if (this.railRoads.count === maxRows) {
      this.railRoads.count = 0;
    }
    if (this.rowCount < 10) {
      rowKind = "grass";
    }

    const ROW_TYPES = ["grass", "roadtype", "water"];
    if (rowKind == null) {
      if (
        this.rowCount > 12 &&
        this.missionEngine &&
        Math.random() < 0.28
      ) {
        rowKind = "decision";
      } else {
        rowKind = ROW_TYPES[Math.floor(Math.random() * ROW_TYPES.length)];
      }
    }

    // Get the previous row info for coordination
    const previousRow = this.getRow(this.rowCount - 1);

    switch (rowKind) {
      case "grass":
        this.grasses.items[this.grasses.count].position.z = this.rowCount;

        // If previous row is water, ensure lily pad positions are kept clear
        let requiredClearPositions: number[] = [];
        if (previousRow && previousRow.type === "water") {
          requiredClearPositions = previousRow.entity.getLilyPadPositions();
        }

        this.grasses.items[this.grasses.count].generate(
          this.mapRowToObstacle(this.rowCount),
          requiredClearPositions
        );
        this.setRow(this.rowCount, {
          type: "grass",
          entity: this.grasses.items[this.grasses.count],
        });
        this.grasses.count++;
        break;
      case "roadtype":
        if (((Math.random() * 4) | 0) === 0) {
          this.railRoads.items[this.railRoads.count].position.z = this.rowCount;
          this.railRoads.items[this.railRoads.count].active = true;
          this.setRow(this.rowCount, {
            type: "railRoad",
            entity: this.railRoads.items[this.railRoads.count],
          });
          this.railRoads.count++;
        } else {
          this.roads.items[this.roads.count].position.z = this.rowCount;

          const previousRowType = (this.getRow(this.rowCount - 1) || {}).type;
          this.roads.items[this.roads.count].isFirstLane(
            previousRowType !== "road"
          );
          this.roads.items[this.roads.count].active = true;
          this.setRow(this.rowCount, {
            type: "road",
            entity: this.roads.items[this.roads.count],
          });
          this.roads.count++;
        }
        break;
      case "water":
        this.water.items[this.water.count].position.z = this.rowCount;
        this.water.items[this.water.count].active = true;

        // If previous row is grass, get clear positions so lily pads are accessible
        let clearPositions: number[] = [];
        if (
          previousRow &&
          (previousRow.type === "grass" || previousRow.type === "decision")
        ) {
          clearPositions = this.getClearPositionsFromGrass(previousRow.entity);
        }

        this.water.items[this.water.count].generate(clearPositions);
        this.setRow(this.rowCount, {
          type: "water",
          entity: this.water.items[this.water.count],
        });
        this.water.count++;
        break;
      case "decision": {
        const mission = this.missionEngine
          ? this.missionEngine.nextDecisionRow()
          : null;
        if (!mission) {
          this.grasses.items[this.grasses.count].position.z = this.rowCount;
          let requiredClearPositions: number[] = [];
          if (previousRow && previousRow.type === "water") {
            requiredClearPositions = previousRow.entity.getLilyPadPositions();
          }
          this.grasses.items[this.grasses.count].generate(
            this.mapRowToObstacle(this.rowCount),
            requiredClearPositions
          );
          this.setRow(this.rowCount, {
            type: "grass",
            entity: this.grasses.items[this.grasses.count],
          });
          this.grasses.count++;
          break;
        }
        this.grasses.items[this.grasses.count].position.z = this.rowCount;
        let decisionClear: number[] = [];
        if (previousRow && previousRow.type === "water") {
          decisionClear = previousRow.entity.getLilyPadPositions();
        }
        const threeLanes = [-1, 0, 1];
        const required = [
          ...new Set([...decisionClear, ...threeLanes]),
        ];
        const grass = this.grasses.items[this.grasses.count];
        grass.generate(Fill.empty, required);
        const checkpointMat = new THREE.MeshBasicMaterial({
          color: CHECKPOINT_TILE_COLOR,
          transparent: true,
          opacity: 0.48,
          depthWrite: false,
        });
        const checkpoint = new THREE.Mesh(
          new THREE.PlaneGeometry(8.2, 1.05),
          checkpointMat
        );
        checkpoint.rotation.x = -Math.PI / 2;
        checkpoint.position.set(0, groundLevel + 0.04, 0);
        checkpoint.renderOrder = 2;
        grass.add(checkpoint);
        grass.userData.decisionMarker = checkpoint;
        grass.userData.isDecisionCheckpoint = true;

        this.setRow(this.rowCount, {
          type: "decision",
          entity: grass,
          mission,
          decisionResolved: false,
        });
        this.grasses.count++;
        break;
      }
    }

    this.rowCount++;
  };

  reset() {
    this.grasses.count = 0;
    this.water.count = 0;
    this.roads.count = 0;
    this.railRoads.count = 0;

    this.rowCount = 0;
    super.reset();
  }

  // Setup initial scene
  init = () => {
    for (let i = 0; i < maxRows; i++) {
      this.grasses.items[i].position.z = MAP_OFFSET;

      this.water.items[i].position.z = MAP_OFFSET;
      this.water.items[i].active = false;
      this.roads.items[i].position.z = MAP_OFFSET;
      this.roads.items[i].active = false;
      this.railRoads.items[i].position.z = MAP_OFFSET;
      this.railRoads.items[i].active = false;
    }

    this.grasses.items[this.grasses.count].position.z = this.rowCount;
    this.grasses.items[this.grasses.count].generate(
      this.mapRowToObstacle(this.rowCount)
    );
    this.grasses.count++;
    this.rowCount++;

    for (let i = 0; i < maxRows + 3; i++) {
      this.newRow();
    }
  };

  mapRowToObstacle = (row) => {
    if (this.rowCount < 5) {
      return Fill.solid;
    } else if (this.rowCount < 10) {
      return Fill.empty;
    }
    return Fill.random;
  };
}
