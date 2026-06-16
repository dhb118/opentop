import "./tankWorld.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  actionForTankKey,
  applyBlastImpulse,
  applyTankRecoil,
  armorZoneForImpact,
  cityBuildingDamageForBlast,
  cityBuildingDamageStage,
  damageAfterArmor,
  buildCallsign,
  clampArenaPoint,
  defaultTankCameraMode,
  defaultTankRoom,
  germanCityBuildings,
  germanCityMapLabel,
  germanCityMaterialLabel,
  germanCityStreetLights,
  multiplayerRoomStorageKey,
  normalizeTankCameraMode,
  normalizeRoomCode,
  shellDamageForDistance,
  shellHeightAfterStep,
  sortScoreboard,
  stepShellVerticalVelocity,
  stepTankPhysics,
  tankBlastRadius,
  tankCameraModes,
  tankArenaSize,
  tankShellMuzzleLift,
  tankShellSpeed,
  terrainSurfaceForPoint,
  terrainSurfaceProfiles,
  type ArenaPoint,
  type ArmorZone,
  type GermanCityBuilding,
  type GermanCityDamageStage,
  type ScoreboardEntry,
  type TankCameraMode,
  type TankMode,
  type TankPhysicsState,
  type TerrainSurface
} from "./tankWorldModel";

type TankKind = "player" | "bot" | "peer";
type WorldAssetKey = "tank" | "bags" | "trench" | "ruins" | "barrel" | "crate" | "guardTower" | "fence" | "bridge";

interface TankEntity {
  id: string;
  callsign: string;
  kind: TankKind;
  group: THREE.Group;
  hull: THREE.Group;
  turret: THREE.Group;
  skin: THREE.Object3D | null;
  surface: TerrainSurface;
  lastArmorZone: ArmorZone | null;
  health: number;
  score: number;
  turretYaw: number;
  physics: TankPhysicsState;
  reloadMs: number;
  lastSeen: number;
}

interface ShellEntity {
  ownerId: string;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  ttl: number;
  age: number;
}

interface DustEntity {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  ttl: number;
  maxTtl: number;
}

interface ExplosionEntity {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  ttl: number;
  maxTtl: number;
}

interface CityBuildingEntity {
  building: GermanCityBuilding;
  group: THREE.Group;
  body: THREE.Mesh;
  roof: THREE.Mesh;
  windows: THREE.Mesh[];
  box: THREE.Box3;
  health: number;
  stage: GermanCityDamageStage;
}

interface RemoteStatePacket {
  type: "state";
  senderId: string;
  callsign: string;
  x: number;
  z: number;
  heading: number;
  turretYaw: number;
  health: number;
  score: number;
}

interface RemoteShotPacket {
  type: "shot";
  senderId: string;
  x: number;
  z: number;
  heading: number;
}

type RemotePacket = RemoteStatePacket | RemoteShotPacket;

interface TankDom {
  canvas: HTMLCanvasElement;
  modeButtons: HTMLButtonElement[];
  cameraButtons: HTMLButtonElement[];
  roomInput: HTMLInputElement;
  roomApply: HTMLButtonElement;
  status: HTMLElement;
  health: HTMLElement;
  score: HTMLElement;
  speed: HTMLElement;
  surface: HTMLElement;
  heading: HTMLElement;
  camera: HTMLElement;
  assets: HTMLElement;
  reload: HTMLElement;
  armorZone: HTMLElement;
  map: HTMLElement;
  material: HTMLElement;
  cityDamage: HTMLElement;
  roster: HTMLElement;
  prompt: HTMLElement;
}

interface WorldAssetDefinition {
  key: WorldAssetKey;
  label: string;
  url: string;
}

interface CoverPlacement {
  x: number;
  z: number;
  sx: number;
  sz: number;
  height: number;
  kind: "ruins" | "trench" | "bags" | "bunker";
}

interface SceneryPlacement {
  key: Exclude<WorldAssetKey, "tank">;
  x: number;
  z: number;
  footprint: number;
  yaw: number;
}

interface PbrTextureSet {
  color: string;
  normal: string;
  roughness: string;
  ao?: string;
  displacement?: string;
}

interface PbrMaterialKit {
  tankArmor: THREE.MeshStandardMaterial;
  tankTrack: THREE.MeshStandardMaterial;
  cobblestone: THREE.MeshStandardMaterial;
  brick: THREE.MeshStandardMaterial;
  plaster: THREE.MeshStandardMaterial;
  damagedBrick: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  rail: THREE.MeshStandardMaterial;
  window: THREE.MeshStandardMaterial;
  windowGlow: THREE.MeshStandardMaterial;
}

const playerId = crypto.randomUUID();
const playerCallsign = buildCallsign(playerId);
const shellGeometry = new THREE.SphereGeometry(0.34, 12, 8);
const explosionGeometry = new THREE.SphereGeometry(1, 16, 10);
const tankBodyGeometry = new THREE.BoxGeometry(3.2, 1.25, 4.2);
const tankTurretGeometry = new THREE.CylinderGeometry(0.95, 1.05, 0.74, 18);
const tankBarrelGeometry = new THREE.BoxGeometry(0.36, 0.34, 3);
const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
const craterGeometry = new THREE.CircleGeometry(1, 28);
const roadGeometry = new THREE.PlaneGeometry(1, 1);
const dustGeometry = new THREE.SphereGeometry(0.42, 8, 6);
const hedgehogBeamGeometry = new THREE.BoxGeometry(0.34, 0.34, 4.6);
const wirePostGeometry = new THREE.CylinderGeometry(0.08, 0.1, 1.4, 8);
const wireGeometry = new THREE.CylinderGeometry(0.035, 0.035, 1, 8);
const supplyCollisionGeometry = new THREE.BoxGeometry(1, 1, 1);
const cameraModeLabels: Record<TankCameraMode, string> = {
  commander: "车长",
  gunner: "炮手",
  driver: "驾驶",
  tactical: "战术"
};
const armorZoneLabels: Record<ArmorZone, string> = {
  front: "正面",
  side: "侧面",
  rear: "后部",
  top: "顶部"
};
const worldAssets: WorldAssetDefinition[] = [
  {
    key: "tank",
    label: "Quaternius Tank",
    url: "assets/vendor/poly-pizza/quaternius-tank/quaternius-tank.glb"
  },
  {
    key: "bags",
    label: "Quaternius Bags",
    url: "assets/vendor/poly-pizza/quaternius-bags/quaternius-bags.glb"
  },
  {
    key: "trench",
    label: "Quaternius Sack Trench",
    url: "assets/vendor/poly-pizza/quaternius-sack-trench/quaternius-sack-trench.glb"
  },
  {
    key: "ruins",
    label: "Quaternius Modular Ruins",
    url: "assets/vendor/poly-pizza/quaternius-modular-ruins/quaternius-modular-ruins.glb"
  },
  {
    key: "barrel",
    label: "Quaternius Barrel",
    url: "assets/vendor/poly-pizza/quaternius-barrel/quaternius-barrel.glb"
  },
  {
    key: "crate",
    label: "Quaternius Cube Crate",
    url: "assets/vendor/poly-pizza/quaternius-cube-crate/quaternius-cube-crate.glb"
  },
  {
    key: "guardTower",
    label: "Quaternius Guard Tower",
    url: "assets/vendor/poly-pizza/quaternius-guard-tower/quaternius-guard-tower.glb"
  },
  {
    key: "fence",
    label: "Kenney Fence Fortified",
    url: "assets/vendor/poly-pizza/kenney-fence-fortified/kenney-fence-fortified.glb"
  },
  {
    key: "bridge",
    label: "Quaternius Small Bridge",
    url: "assets/vendor/poly-pizza/quaternius-small-bridge/quaternius-small-bridge.glb"
  }
];

const pbrTextureSets = {
  tankMetal: {
    color: "assets/vendor/ambientcg/Metal038/Metal038_1K-JPG_Color.jpg",
    normal: "assets/vendor/ambientcg/Metal038/Metal038_1K-JPG_NormalGL.jpg",
    roughness: "assets/vendor/ambientcg/Metal038/Metal038_1K-JPG_Roughness.jpg",
    displacement: "assets/vendor/ambientcg/Metal038/Metal038_1K-JPG_Displacement.jpg"
  },
  cobblestone: {
    color: "assets/vendor/ambientcg/PavingStones150/PavingStones150_1K-JPG_Color.jpg",
    normal: "assets/vendor/ambientcg/PavingStones150/PavingStones150_1K-JPG_NormalGL.jpg",
    roughness: "assets/vendor/ambientcg/PavingStones150/PavingStones150_1K-JPG_Roughness.jpg",
    ao: "assets/vendor/ambientcg/PavingStones150/PavingStones150_1K-JPG_AmbientOcclusion.jpg",
    displacement: "assets/vendor/ambientcg/PavingStones150/PavingStones150_1K-JPG_Displacement.jpg"
  },
  brick: {
    color: "assets/vendor/ambientcg/Bricks100/Bricks100_1K-JPG_Color.jpg",
    normal: "assets/vendor/ambientcg/Bricks100/Bricks100_1K-JPG_NormalGL.jpg",
    roughness: "assets/vendor/ambientcg/Bricks100/Bricks100_1K-JPG_Roughness.jpg",
    ao: "assets/vendor/ambientcg/Bricks100/Bricks100_1K-JPG_AmbientOcclusion.jpg",
    displacement: "assets/vendor/ambientcg/Bricks100/Bricks100_1K-JPG_Displacement.jpg"
  },
  plaster: {
    color: "assets/vendor/ambientcg/Plaster001/Plaster001_1K-JPG_Color.jpg",
    normal: "assets/vendor/ambientcg/Plaster001/Plaster001_1K-JPG_NormalGL.jpg",
    roughness: "assets/vendor/ambientcg/Plaster001/Plaster001_1K-JPG_Roughness.jpg",
    displacement: "assets/vendor/ambientcg/Plaster001/Plaster001_1K-JPG_Displacement.jpg"
  }
} satisfies Record<string, PbrTextureSet>;

const coverPlacements: CoverPlacement[] = [
  { x: -24, z: -16, sx: 12, sz: 7, height: 3.8, kind: "ruins" },
  { x: 18, z: -23, sx: 8, sz: 13, height: 2.2, kind: "trench" },
  { x: 29, z: 20, sx: 13, sz: 8, height: 3.4, kind: "ruins" },
  { x: -18, z: 18, sx: 9, sz: 12, height: 2, kind: "bags" },
  { x: 0, z: 0, sx: 8, sz: 8, height: 3.2, kind: "bunker" },
  { x: -34, z: 34, sx: 10, sz: 4, height: 1.8, kind: "trench" }
];
const sceneryPlacements: SceneryPlacement[] = [
  { key: "ruins", x: -24, z: -16, footprint: 15, yaw: 0.18 },
  { key: "ruins", x: 29, z: 20, footprint: 16, yaw: -0.5 },
  { key: "trench", x: 18, z: -23, footprint: 12, yaw: Math.PI / 2 },
  { key: "trench", x: -34, z: 34, footprint: 11, yaw: -0.08 },
  { key: "bags", x: -18, z: 18, footprint: 9, yaw: 0.64 },
  { key: "bags", x: 5, z: -5, footprint: 6.5, yaw: -0.42 },
  { key: "barrel", x: -36, z: -34, footprint: 3.4, yaw: 0.2 },
  { key: "barrel", x: -32, z: -36, footprint: 3, yaw: -0.35 },
  { key: "crate", x: -39, z: -31, footprint: 3.2, yaw: 0.8 },
  { key: "crate", x: 35, z: 36, footprint: 3.4, yaw: -0.48 },
  { key: "barrel", x: 39, z: 33, footprint: 2.8, yaw: 0.7 },
  { key: "guardTower", x: -43, z: 40, footprint: 8.5, yaw: 0.72 },
  { key: "guardTower", x: 42, z: -40, footprint: 8, yaw: -2.35 },
  { key: "fence", x: -43, z: 24, footprint: 6, yaw: Math.PI / 2 },
  { key: "fence", x: -43, z: 30, footprint: 6, yaw: Math.PI / 2 },
  { key: "fence", x: 43, z: -25, footprint: 6, yaw: -Math.PI / 2 },
  { key: "bridge", x: 0, z: -7, footprint: 11, yaw: Math.PI / 2 }
];

export function mountTankWorld(root: HTMLElement): void {
  root.innerHTML = `
    <main class="tank-app" data-mode="single">
      <canvas class="tank-canvas" aria-label="铁脊行动 3D 坦克战场"></canvas>
      <section class="tank-hud" aria-label="坦克作战控制与状态">
        <div class="tank-brand">
          <p>铁脊行动 / Iron Ridge</p>
          <h1>二战坦克试验场</h1>
          <span>Three.js 真实物理 · CC0 3D 资产 · 同源房间联机</span>
        </div>
        <div class="tank-toolbar" role="group" aria-label="作战模式">
          <button class="tank-mode-button active" data-mode="single" type="button">单人演训</button>
          <button class="tank-mode-button" data-mode="multiplayer" type="button">同源联机</button>
        </div>
        <div class="tank-camera-switch" role="group" aria-label="视角切换">
          ${tankCameraModes
            .map(
              (mode) =>
                `<button class="tank-camera-button${mode === defaultTankCameraMode ? " active" : ""}" data-camera-mode="${mode}" type="button">${cameraModeLabels[mode]}</button>`
            )
            .join("")}
        </div>
        <div class="tank-room">
          <label>
            房间
            <input name="tank-room" value="${defaultTankRoom}" maxlength="12" />
          </label>
          <button data-room-apply type="button">加入</button>
        </div>
        <div class="tank-status-grid">
          <span><b data-health>100</b>装甲</span>
          <span><b data-score>0</b>击毁</span>
          <span><b data-status>单人</b>链路</span>
          <span><b data-speed>0</b>速度</span>
          <span><b data-surface>荒野</b>履带地面</span>
          <span><b data-heading>000</b>航向</span>
        </div>
        <div class="tank-system-row">
          <span>视角 <b data-camera>${cameraModeLabels[defaultTankCameraMode]}</b></span>
          <span>资产 <b data-assets>加载中</b></span>
          <span>地图 <b data-map>${germanCityMapLabel}</b></span>
          <span>材质 <b data-material>${germanCityMaterialLabel}</b></span>
          <span>城损 <b data-city-damage>完整</b></span>
          <span>装填 <b data-reload>就绪</b></span>
          <span>受击 <b data-armor-zone>完整</b></span>
        </div>
        <div class="tank-roster" data-roster></div>
        <p class="tank-prompt" data-prompt>WASD/方向键驾驶，Q/E 转炮塔，Space/鼠标开火，C 切换视角。</p>
      </section>
    </main>
  `;

  const game = new TankWorldGame(readTankDom(root));
  game.start();
  window.addEventListener("beforeunload", () => game.dispose(), { once: true });
}

function readTankDom(root: HTMLElement): TankDom {
  const canvas = root.querySelector<HTMLCanvasElement>(".tank-canvas");
  const roomInput = root.querySelector<HTMLInputElement>("[name='tank-room']");
  const roomApply = root.querySelector<HTMLButtonElement>("[data-room-apply]");
  const status = root.querySelector<HTMLElement>("[data-status]");
  const health = root.querySelector<HTMLElement>("[data-health]");
  const score = root.querySelector<HTMLElement>("[data-score]");
  const speed = root.querySelector<HTMLElement>("[data-speed]");
  const surface = root.querySelector<HTMLElement>("[data-surface]");
  const heading = root.querySelector<HTMLElement>("[data-heading]");
  const camera = root.querySelector<HTMLElement>("[data-camera]");
  const assets = root.querySelector<HTMLElement>("[data-assets]");
  const reload = root.querySelector<HTMLElement>("[data-reload]");
  const armorZone = root.querySelector<HTMLElement>("[data-armor-zone]");
  const map = root.querySelector<HTMLElement>("[data-map]");
  const material = root.querySelector<HTMLElement>("[data-material]");
  const cityDamage = root.querySelector<HTMLElement>("[data-city-damage]");
  const roster = root.querySelector<HTMLElement>("[data-roster]");
  const prompt = root.querySelector<HTMLElement>("[data-prompt]");

  if (
    !canvas ||
    !roomInput ||
    !roomApply ||
    !status ||
    !health ||
    !score ||
    !speed ||
    !surface ||
    !heading ||
    !camera ||
    !assets ||
    !reload ||
    !armorZone ||
    !map ||
    !material ||
    !cityDamage ||
    !roster ||
    !prompt
  ) {
    throw new Error("Missing tank world UI nodes.");
  }

  return {
    canvas,
    modeButtons: Array.from(root.querySelectorAll<HTMLButtonElement>(".tank-mode-button[data-mode]")),
    cameraButtons: Array.from(root.querySelectorAll<HTMLButtonElement>(".tank-camera-button[data-camera-mode]")),
    roomInput,
    roomApply,
    status,
    health,
    score,
    speed,
    surface,
    heading,
    camera,
    assets,
    reload,
    armorZone,
    map,
    material,
    cityDamage,
    roster,
    prompt
  };
}

class TankWorldGame {
  private readonly dom: TankDom;
  private readonly input = new Set<string>();
  private readonly shells: ShellEntity[] = [];
  private readonly dust: DustEntity[] = [];
  private readonly explosions: ExplosionEntity[] = [];
  private readonly tanks = new Map<string, TankEntity>();
  private readonly obstacles: THREE.Box3[] = [];
  private readonly cityBuildings: CityBuildingEntity[] = [];
  private readonly assetLoader = new GLTFLoader();
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly materials = createPbrMaterialKit(this.textureLoader);
  private readonly assetLibrary = new Map<WorldAssetKey, THREE.Object3D>();
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
  private renderer: THREE.WebGLRenderer | null = null;
  private animationFrame = 0;
  private channel: BroadcastChannel | null = null;
  private mode: TankMode = "single";
  private cameraMode: TankCameraMode = defaultTankCameraMode;
  private roomCode = defaultTankRoom;
  private player!: TankEntity;
  private assetStatus = `0/${worldAssets.length} CC0 GLB + PBR`;
  private materialStatus = germanCityMaterialLabel;
  private cityDamageStatus = "完整";
  private sceneryApplied = false;
  private cameraKick = 0;
  private lastBroadcast = 0;
  private lastFrameMs = performance.now();
  private lastHudUpdate = 0;

  constructor(dom: TankDom) {
    this.dom = dom;
  }

  start(): void {
    this.configureRenderer();
    this.buildScene();
    this.bindEvents();
    this.setCameraMode(defaultTankCameraMode);
    this.setMode("single");
    this.animationFrame = requestAnimationFrame(() => this.tick());
  }

  dispose(): void {
    cancelAnimationFrame(this.animationFrame);
    this.channel?.close();
    this.renderer?.dispose();
  }

  private configureRenderer(): void {
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: this.dom.canvas,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance"
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setClearColor(0x070907, 1);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.resize();
    } catch {
      this.dom.prompt.textContent = "WebGL is unavailable in this browser.";
    }
  }

  private buildScene(): void {
    this.scene.background = new THREE.Color(0x050806);
    this.scene.fog = new THREE.Fog(0x050806, 46, 150);
    this.camera.position.set(0, 30, 34);

    const hemi = new THREE.HemisphereLight(0xd8ecff, 0x16120c, 1.05);
    const sun = new THREE.DirectionalLight(0xffd79a, 3.4);
    sun.position.set(-28, 48, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(3072, 3072);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 150;
    sun.shadow.camera.left = -72;
    sun.shadow.camera.right = 72;
    sun.shadow.camera.top = 72;
    sun.shadow.camera.bottom = -72;
    const skyFill = new THREE.DirectionalLight(0x6fa6ff, 0.48);
    skyFill.position.set(30, 28, -32);
    this.scene.add(hemi, sun, skyFill);

    this.createTerrain();
    this.createCratersAndRoads();
    this.createGermanCityScene();

    this.createWalls();
    this.createObstacles();
    this.createDefensiveDetails();
    this.player = this.createTank(playerId, playerCallsign, "player", 0xdefc5a, { x: 0, z: 30 });
    this.loadWorldAssets();
  }

  private createTerrain(): void {
    const geometry = new THREE.PlaneGeometry(tankArenaSize, tankArenaSize, 72, 72);
    const positions = geometry.attributes.position;
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const z = positions.getY(index);
      const ripple = Math.sin(x * 0.31) * 0.18 + Math.cos(z * 0.27) * 0.14 + Math.sin((x + z) * 0.11) * 0.12;
      positions.setZ(index, ripple);
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      color: 0x25281a,
      roughness: 0.98,
      metalness: 0.02,
      map: createGroundTexture()
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(tankArenaSize, 24, 0x8aa55c, 0x283222);
    grid.position.y = 0.06;
    this.scene.add(grid);
  }

  private createCratersAndRoads(): void {
    ensureGeometryUv2(roadGeometry);
    const verticalRoad = new THREE.Mesh(
      roadGeometry,
      createPbrMaterial(this.textureLoader, pbrTextureSets.cobblestone, {
        repeat: [1.4, 12],
        color: 0xb3aaa0,
        metalness: 0.02,
        roughness: 0.96,
        normalScale: 0.78,
        displacementScale: 0.018
      })
    );
    verticalRoad.scale.set(10.6, tankArenaSize, 1);
    verticalRoad.rotation.x = -Math.PI / 2;
    verticalRoad.position.y = 0.09;
    verticalRoad.receiveShadow = true;
    verticalRoad.name = "german-city-cobblestone-main-road";
    this.scene.add(verticalRoad);

    const horizontalRoad = new THREE.Mesh(
      roadGeometry,
      createPbrMaterial(this.textureLoader, pbrTextureSets.cobblestone, {
        repeat: [12, 1.4],
        color: 0xb3aaa0,
        metalness: 0.02,
        roughness: 0.96,
        normalScale: 0.78,
        displacementScale: 0.018
      })
    );
    horizontalRoad.scale.set(tankArenaSize, 10.6, 1);
    horizontalRoad.rotation.x = -Math.PI / 2;
    horizontalRoad.position.y = 0.1;
    horizontalRoad.position.z = -7;
    horizontalRoad.receiveShadow = true;
    horizontalRoad.name = "german-city-cobblestone-cross-road";
    this.scene.add(horizontalRoad);

    const craterMaterial = new THREE.MeshStandardMaterial({
      color: 0x17140f,
      roughness: 1,
      transparent: true,
      opacity: 0.72
    });
    [
      { x: -32, z: 18, radius: 9.5 },
      { x: 27, z: -12, radius: 8.5 },
      { x: 12, z: 30, radius: 7.2 },
      { x: -8, z: -31, radius: 5.4 },
      { x: 38, z: 33, radius: 4.8 }
    ].forEach((crater, index) => {
      const mesh = new THREE.Mesh(craterGeometry, craterMaterial);
      mesh.scale.set(crater.radius, crater.radius * (0.72 + (index % 2) * 0.18), 1);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = index * 0.7;
      mesh.position.set(crater.x, 0.12, crater.z);
      this.scene.add(mesh);
    });
  }

  private createGermanCityScene(): void {
    this.createTramRails();
    for (const building of germanCityBuildings) {
      this.createGermanCityBuilding(building);
    }
    for (const lamp of germanCityStreetLights) {
      this.createStreetLamp(lamp.x, lamp.z, lamp.castsShadow);
    }
  }

  private createGermanCityBuilding(building: GermanCityBuilding): void {
    const group = new THREE.Group();
    group.position.set(building.x, 0, building.z);
    group.rotation.y = building.yaw;
    group.name = `german-city-${building.facade}-building`;

    const material =
      building.facade === "brick"
        ? this.materials.brick
        : building.facade === "damaged"
          ? this.materials.damagedBrick
          : this.materials.plaster;
    const bodyGeometry = new THREE.BoxGeometry(building.width, building.height, building.depth, 2, 4, 2);
    ensureGeometryUv2(bodyGeometry);
    const body = new THREE.Mesh(bodyGeometry, material);
    body.position.y = building.height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const roofGeometry = createGabledRoofGeometry(
      building.width + 0.9,
      building.depth + 0.9,
      Math.max(1.5, building.height * 0.16)
    );
    ensureGeometryUv2(roofGeometry);
    const roof = new THREE.Mesh(roofGeometry, this.materials.roof);
    roof.position.y = building.height;
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    const windows = this.addCityWindows(group, building);
    if (building.facade === "damaged") {
      this.addRubbleSpill(group, building);
    }

    this.scene.add(group);
    const box = new THREE.Box3().setFromObject(group).expandByScalar(0.55);
    this.cityBuildings.push({
      building,
      group,
      body,
      roof,
      windows,
      box,
      health: 100,
      stage: "intact"
    });
    this.obstacles.push(box);
  }

  private addCityWindows(group: THREE.Group, building: GermanCityBuilding): THREE.Mesh[] {
    const floors = Math.max(2, Math.floor(building.height / 3.2));
    const columns = Math.max(2, Math.floor(building.width / 3.2));
    const windowGeometry = new THREE.BoxGeometry(0.78, 1.08, 0.09);
    const yStart = 1.9;
    const zFaces = [building.depth / 2 + 0.06, -building.depth / 2 - 0.06];
    const windows: THREE.Mesh[] = [];

    for (const z of zFaces) {
      for (let floor = 0; floor < floors; floor += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = ((column + 0.5) / columns - 0.5) * (building.width - 1.8);
          const y = yStart + floor * 2.65;
          if (y > building.height - 1.1) {
            continue;
          }
          const window = new THREE.Mesh(
            windowGeometry,
            (floor + column + Math.round(building.x + building.z)) % 5 === 0
              ? this.materials.windowGlow
              : this.materials.window
          );
          window.position.set(x, y, z);
          if (z < 0) {
            window.rotation.y = Math.PI;
          }
          window.castShadow = false;
          window.receiveShadow = true;
          group.add(window);
          windows.push(window);
        }
      }
    }
    return windows;
  }

  private addRubbleSpill(group: THREE.Group, building: GermanCityBuilding): void {
    const rubbleMaterial = this.materials.damagedBrick;
    for (let index = 0; index < 18; index += 1) {
      const size = 0.35 + Math.random() * 0.55;
      const geometry = new THREE.BoxGeometry(size, size * 0.55, size * (0.8 + Math.random() * 0.8));
      ensureGeometryUv2(geometry);
      const rubble = new THREE.Mesh(geometry, rubbleMaterial);
      rubble.position.set(
        -building.width / 2 + Math.random() * building.width,
        size * 0.28,
        building.depth / 2 + 0.4 + Math.random() * 2.4
      );
      rubble.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.35);
      rubble.castShadow = true;
      rubble.receiveShadow = true;
      group.add(rubble);
    }
  }

  private createTramRails(): void {
    const railMaterial = this.materials.rail;
    [
      { x: -1.35, z: 0, sx: 0.18, sz: tankArenaSize - 10 },
      { x: 1.35, z: 0, sx: 0.18, sz: tankArenaSize - 10 },
      { x: 0, z: -8.35, sx: tankArenaSize - 10, sz: 0.18 },
      { x: 0, z: -5.65, sx: tankArenaSize - 10, sz: 0.18 }
    ].forEach((rail) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(rail.sx, 0.09, rail.sz), railMaterial);
      mesh.position.set(rail.x, 0.18, rail.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = "german-city-tram-rail";
      this.scene.add(mesh);
    });
  }

  private createStreetLamp(x: number, z: number, castsShadow: boolean): void {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 4.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x2f342e, roughness: 0.62, metalness: 0.72 })
    );
    pole.position.y = 2.1;
    pole.castShadow = true;
    pole.receiveShadow = true;
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 16, 10),
      new THREE.MeshStandardMaterial({ color: 0xffd69a, emissive: 0xffa444, emissiveIntensity: 1.25 })
    );
    lamp.position.y = 4.35;
    const light = new THREE.PointLight(0xffb56d, 0.9, 17, 2);
    light.position.y = 4.35;
    light.castShadow = castsShadow;
    light.shadow.mapSize.set(512, 512);
    light.shadow.bias = -0.0008;
    group.add(pole, lamp, light);
    group.position.set(x, 0, z);
    group.name = "german-city-street-lamp";
    this.scene.add(group);
  }

  private createWalls(): void {
    const material = new THREE.MeshStandardMaterial({ color: 0x3d4535, roughness: 0.92 });
    const walls = [
      { x: 0, z: -tankArenaSize / 2, sx: tankArenaSize, sz: 1.2 },
      { x: 0, z: tankArenaSize / 2, sx: tankArenaSize, sz: 1.2 },
      { x: -tankArenaSize / 2, z: 0, sx: 1.2, sz: tankArenaSize },
      { x: tankArenaSize / 2, z: 0, sx: 1.2, sz: tankArenaSize }
    ];

    for (const wall of walls) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(wall.sx, 2.8, wall.sz), material);
      mesh.position.set(wall.x, 1.4, wall.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }
  }

  private createObstacles(): void {
    const materials: Record<CoverPlacement["kind"], THREE.MeshStandardMaterial> = {
      ruins: new THREE.MeshStandardMaterial({ color: 0x777363, roughness: 0.96 }),
      trench: new THREE.MeshStandardMaterial({ color: 0x4a3d2d, roughness: 0.98 }),
      bags: new THREE.MeshStandardMaterial({ color: 0x7d754d, roughness: 0.96 }),
      bunker: new THREE.MeshStandardMaterial({ color: 0x4e5149, roughness: 0.94, metalness: 0.04 })
    };

    for (const item of coverPlacements) {
      const mesh = new THREE.Mesh(obstacleGeometry, materials[item.kind]);
      mesh.scale.set(item.sx, 2.4, item.sz);
      mesh.scale.y = item.height;
      mesh.position.set(item.x, item.height / 2, item.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = `procedural-${item.kind}-cover`;
      this.scene.add(mesh);
      this.obstacles.push(new THREE.Box3().setFromObject(mesh).expandByScalar(item.kind === "trench" ? 0.7 : 1.1));
    }
  }

  private createDefensiveDetails(): void {
    const steelMaterial = new THREE.MeshStandardMaterial({ color: 0x4f5954, roughness: 0.78, metalness: 0.28 });
    const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x9aa28d, roughness: 0.65, metalness: 0.45 });
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x463b2a, roughness: 0.92 });
    const supplyMaterial = new THREE.MeshStandardMaterial({
      color: 0x756441,
      roughness: 0.96,
      transparent: true,
      opacity: 0.12
    });

    [
      { x: -39, z: -7, yaw: 0.18 },
      { x: -33, z: -8, yaw: -0.26 },
      { x: 35, z: 5, yaw: 0.52 },
      { x: 39, z: 11, yaw: -0.18 },
      { x: 12, z: -39, yaw: 0.7 },
      { x: 18, z: -38, yaw: -0.55 }
    ].forEach((item) => this.createHedgehog(item.x, item.z, item.yaw, steelMaterial));

    this.createBarbedWireLine(new THREE.Vector3(-44, 0, -28), new THREE.Vector3(-44, 0, 10), wireMaterial, postMaterial);
    this.createBarbedWireLine(new THREE.Vector3(44, 0, -8), new THREE.Vector3(44, 0, 32), wireMaterial, postMaterial);
    this.createBarbedWireLine(new THREE.Vector3(-8, 0, -44), new THREE.Vector3(31, 0, -44), wireMaterial, postMaterial);

    [
      { x: -36, z: -34, sx: 7, sz: 5 },
      { x: 37, z: 35, sx: 6, sz: 5 }
    ].forEach((item) => {
      const mesh = new THREE.Mesh(supplyCollisionGeometry, supplyMaterial);
      mesh.scale.set(item.sx, 1.8, item.sz);
      mesh.position.set(item.x, 0.9, item.z);
      mesh.name = "procedural-supply-cover";
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.obstacles.push(new THREE.Box3().setFromObject(mesh).expandByScalar(0.8));
    });
  }

  private createHedgehog(x: number, z: number, yaw: number, material: THREE.Material): void {
    const group = new THREE.Group();
    const beamA = new THREE.Mesh(hedgehogBeamGeometry, material);
    const beamB = new THREE.Mesh(hedgehogBeamGeometry, material);
    const beamC = new THREE.Mesh(hedgehogBeamGeometry, material);
    beamA.rotation.y = Math.PI / 2;
    beamB.rotation.x = Math.PI / 2;
    beamC.rotation.set(Math.PI / 4, 0, Math.PI / 2);
    [beamA, beamB, beamC].forEach((beam) => {
      beam.castShadow = true;
      beam.receiveShadow = true;
      group.add(beam);
    });
    group.position.set(x, 1.2, z);
    group.rotation.y = yaw;
    this.scene.add(group);
    this.obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.2, z), new THREE.Vector3(4, 2.4, 4)));
  }

  private createBarbedWireLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    wireMaterial: THREE.Material,
    postMaterial: THREE.Material
  ): void {
    const direction = end.clone().sub(start);
    const length = direction.length();
    const segments = Math.max(2, Math.ceil(length / 6));
    const step = direction.clone().divideScalar(segments);

    for (let index = 0; index <= segments; index += 1) {
      const point = start.clone().addScaledVector(step, index);
      const post = new THREE.Mesh(wirePostGeometry, postMaterial);
      post.position.set(point.x, 0.72, point.z);
      post.castShadow = true;
      post.receiveShadow = true;
      this.scene.add(post);
    }

    for (let index = 0; index < segments; index += 1) {
      const a = start.clone().addScaledVector(step, index);
      const b = start.clone().addScaledVector(step, index + 1);
      for (const y of [0.72, 1.1]) {
        const wire = createCylinderBetween(a.clone().setY(y), b.clone().setY(y), wireMaterial);
        this.scene.add(wire);
      }
    }
  }

  private createTank(id: string, callsign: string, kind: TankKind, color: number, point: ArenaPoint): TankEntity {
    const group = new THREE.Group();
    const material = this.createTankArmorMaterial(kind, color);
    const darkMaterial = this.materials.tankTrack.clone();
    const hull = new THREE.Group();
    const body = new THREE.Mesh(tankBodyGeometry, material);
    body.position.y = 0.85;
    const leftTrack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 4.55), darkMaterial);
    leftTrack.position.set(-1.86, 0.42, 0);
    const rightTrack = leftTrack.clone();
    rightTrack.position.x = 1.86;
    hull.add(body, leftTrack, rightTrack);
    const turret = new THREE.Group();
    const turretBase = new THREE.Mesh(tankTurretGeometry, material);
    turretBase.position.y = 1.65;
    turretBase.rotation.y = Math.PI / 2;
    const barrel = new THREE.Mesh(tankBarrelGeometry, material);
    barrel.position.set(0, 1.68, 1.94);
    [body, leftTrack, rightTrack, turretBase, barrel].forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    turret.add(turretBase, barrel);
    group.add(hull, turret);
    group.position.set(point.x, 0, point.z);
    this.scene.add(group);

    const tank: TankEntity = {
      id,
      callsign,
      kind,
      group,
      hull,
      turret,
      skin: null,
      surface: terrainSurfaceForPoint(point),
      lastArmorZone: null,
      health: 100,
      score: 0,
      turretYaw: 0,
      physics: {
        position: point,
        heading: 0,
        linearVelocity: 0,
        angularVelocity: 0
      },
      reloadMs: 0,
      lastSeen: performance.now()
    };
    this.tanks.set(id, tank);
    this.applyTankSkin(tank);
    return tank;
  }

  private createTankArmorMaterial(kind: TankKind, fallbackColor: number): THREE.MeshStandardMaterial {
    const material = this.materials.tankArmor.clone();
    material.color.setHex(kind === "player" ? 0x687454 : kind === "peer" ? 0x55707a : kind === "bot" ? 0x73604a : fallbackColor);
    material.needsUpdate = true;
    return material;
  }

  private loadWorldAssets(): void {
    this.assetStatus = "加载中";
    Promise.allSettled(
      worldAssets.map(
        (asset) =>
          new Promise<[WorldAssetKey, THREE.Object3D]>((resolve, reject) => {
            this.assetLoader.load(
              asset.url,
              (gltf) => {
                prepareAssetScene(gltf.scene);
                resolve([asset.key, gltf.scene]);
              },
              undefined,
              reject
            );
          })
      )
    ).then((results) => {
      for (const result of results) {
        if (result.status === "fulfilled") {
          const [key, scene] = result.value;
          this.assetLibrary.set(key, scene);
        }
      }
      this.assetStatus = `${this.assetLibrary.size}/${worldAssets.length} CC0 GLB + PBR`;
      for (const tank of this.tanks.values()) {
        this.applyTankSkin(tank);
      }
      this.applyDownloadedScenery();
      if (this.assetLibrary.has("ruins") && this.assetLibrary.has("trench") && this.assetLibrary.has("bags")) {
        this.hideProceduralCovers();
      }
      this.updateHud(true);
    });
  }

  private applyTankSkin(tank: TankEntity): void {
    const tankAsset = this.assetLibrary.get("tank");
    if (!tankAsset) {
      return;
    }
    if (tank.skin) {
      tank.group.remove(tank.skin);
    }
    const skin = normalizeAssetModel(tankAsset, 5.2, 0.02, 0);
    skin.name = `${tank.callsign}-cc0-tank-skin`;
    this.applyPbrTankMaterials(skin, tank);
    tank.hull.visible = false;
    tank.group.add(skin);
    tank.skin = skin;
  }

  private applyPbrTankMaterials(root: THREE.Object3D, tank: TankEntity): void {
    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) {
        return;
      }
      const signature = `${mesh.name} ${mesh.parent?.name ?? ""}`.toLowerCase();
      const isTrack = /track|tread|wheel|roadwheel|belt|chain|kette/.test(signature);
      const material = isTrack ? this.materials.tankTrack.clone() : this.createTankArmorMaterial(tank.kind, 0x746149);
      if (mesh.geometry) {
        ensureGeometryUv2(mesh.geometry);
      }
      mesh.material = material;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }

  private applyDownloadedScenery(): void {
    if (this.sceneryApplied) {
      return;
    }
    this.sceneryApplied = true;
    for (const placement of sceneryPlacements) {
      const asset = this.assetLibrary.get(placement.key);
      if (!asset) {
        continue;
      }
      const mesh = normalizeAssetModel(asset, placement.footprint, 0, placement.yaw);
      mesh.position.x = placement.x;
      mesh.position.z = placement.z;
      mesh.name = `downloaded-${placement.key}-scenery`;
      this.scene.add(mesh);
      if (placement.key === "guardTower" || placement.key === "fence") {
        this.obstacles.push(new THREE.Box3().setFromObject(mesh).expandByScalar(0.6));
      }
    }
  }

  private hideProceduralCovers(): void {
    this.scene.traverse((child) => {
      if (child.name.startsWith("procedural-")) {
        child.visible = false;
      }
    });
  }

  private bindEvents(): void {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        this.cycleCameraMode();
        return;
      }
      if (actionForTankKey(event.key)) {
        event.preventDefault();
        this.input.add(event.key.toLowerCase());
      }
    });
    window.addEventListener("keyup", (event) => this.input.delete(event.key.toLowerCase()));
    this.dom.canvas.addEventListener("pointermove", (event) => this.updateTurretTarget(event));
    this.dom.canvas.addEventListener("pointerdown", () => this.fire(this.player, true));
    for (const button of this.dom.modeButtons) {
      button.addEventListener("click", () => this.setMode(button.dataset.mode === "multiplayer" ? "multiplayer" : "single"));
    }
    for (const button of this.dom.cameraButtons) {
      button.addEventListener("click", () => this.setCameraMode(normalizeTankCameraMode(button.dataset.cameraMode)));
    }
    this.dom.roomApply.addEventListener("click", () => this.joinRoom(this.dom.roomInput.value));
  }

  private cycleCameraMode(): void {
    const current = tankCameraModes.indexOf(this.cameraMode);
    this.setCameraMode(tankCameraModes[(current + 1) % tankCameraModes.length]);
  }

  private setCameraMode(mode: TankCameraMode): void {
    this.cameraMode = mode;
    for (const button of this.dom.cameraButtons) {
      button.classList.toggle("active", normalizeTankCameraMode(button.dataset.cameraMode) === mode);
    }
    this.dom.canvas.closest(".tank-app")?.setAttribute("data-camera-mode-current", mode);
    this.updateHud(true);
  }

  private resize(): void {
    const width = Math.max(1, this.dom.canvas.clientWidth);
    const height = Math.max(1, this.dom.canvas.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer?.setSize(width, height, false);
  }

  private setMode(mode: TankMode): void {
    this.mode = mode;
    for (const button of this.dom.modeButtons) {
      button.classList.toggle("active", button.dataset.mode === mode);
    }
    this.clearBotsAndPeers();
    if (mode === "single") {
      this.channel?.close();
      this.channel = null;
      this.spawnBots();
    } else {
      this.joinRoom(this.dom.roomInput.value || localStorage.getItem(multiplayerRoomStorageKey) || defaultTankRoom);
    }
    this.updateHud(true);
  }

  private joinRoom(value: string): void {
    this.roomCode = normalizeRoomCode(value);
    this.dom.roomInput.value = this.roomCode;
    localStorage.setItem(multiplayerRoomStorageKey, this.roomCode);
    this.channel?.close();
    this.channel = new BroadcastChannel(`iron-ridge:${this.roomCode}`);
    this.channel.addEventListener("message", (event: MessageEvent<RemotePacket>) => this.receivePacket(event.data));
    this.broadcastState(true);
    this.updateHud(true);
  }

  private clearBotsAndPeers(): void {
    for (const tank of this.tanks.values()) {
      if (tank.kind === "player") {
        continue;
      }
      this.scene.remove(tank.group);
      this.tanks.delete(tank.id);
    }
  }

  private spawnBots(): void {
    [
      { x: -34, z: -32 },
      { x: 32, z: -30 },
      { x: -30, z: 8 },
      { x: 35, z: 24 },
      { x: 6, z: -38 }
    ].forEach((point, index) => {
      this.createTank(`bot-${index}`, `BOT-${index + 1}`, "bot", 0xff784f, point);
    });
  }

  private tick(): void {
    const now = performance.now();
    const dt = Math.min((now - this.lastFrameMs) / 1000, 0.05);
    this.lastFrameMs = now;
    this.updatePlayer(dt);
    this.updateBots(dt);
    this.updateShells(dt);
    this.updateDust(dt);
    this.updateExplosions(dt);
    this.updatePeers();
    this.updateCamera(dt);
    this.broadcastState(false);
    this.updateHud(false);
    this.renderer?.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(() => this.tick());
  }

  private updatePlayer(dt: number): void {
    const turn = (this.hasAction("turnLeft") ? 1 : 0) - (this.hasAction("turnRight") ? 1 : 0);
    const drive = (this.hasAction("forward") ? 1 : 0) - (this.hasAction("reverse") ? 1 : 0);
    const turret = (this.hasAction("turretLeft") ? 1 : 0) - (this.hasAction("turretRight") ? 1 : 0);
    this.player.turretYaw += turret * dt * 2.8;
    this.moveTank(this.player, dt, drive, turn);
    if (this.hasAction("fire")) {
      this.fire(this.player, true);
    }
  }

  private updateBots(dt: number): void {
    if (this.mode !== "single") {
      return;
    }

    for (const tank of this.tanks.values()) {
      if (tank.kind !== "bot" || tank.health <= 0) {
        continue;
      }
      const dx = this.player.group.position.x - tank.group.position.x;
      const dz = this.player.group.position.z - tank.group.position.z;
      const target = Math.atan2(dx, dz);
      tank.turretYaw = THREE.MathUtils.lerp(tank.turretYaw, target, dt * 2.2);
      this.moveTank(tank, dt, Math.hypot(dx, dz) > 18 ? 0.72 : -0.22, clamp(angleDelta(target, tank.physics.heading) * 2.4, -1, 1));
      if (Math.abs(angleDelta(tank.turretYaw, target)) < 0.16 && Math.hypot(dx, dz) < 42) {
        this.fire(tank, false);
      }
    }
  }

  private moveTank(tank: TankEntity, dt: number, throttle: number, turn: number): void {
    tank.reloadMs = Math.max(0, tank.reloadMs - dt * 1000);
    const surface = terrainSurfaceForPoint(tank.physics.position);
    const surfaceProfile = terrainSurfaceProfiles[surface];
    const next = stepTankPhysics(
      tank.physics,
      { throttle, turn, surfaceGrip: surfaceProfile.grip, dragMultiplier: surfaceProfile.dragMultiplier },
      dt
    );
    const blocked = this.hitsObstacle(next.position);
    tank.physics = blocked
      ? stepTankPhysics(
          tank.physics,
          { throttle, turn, blocked: true, surfaceGrip: surfaceProfile.grip, dragMultiplier: surfaceProfile.dragMultiplier },
          dt
        )
      : next;
    tank.physics.position = clampArenaPoint(tank.physics.position);
    tank.surface = terrainSurfaceForPoint(tank.physics.position);
    tank.group.position.set(tank.physics.position.x, 0, tank.physics.position.z);
    const pitch = clamp(-tank.physics.linearVelocity * 0.012, -0.08, 0.08);
    const roll = clamp(-tank.physics.angularVelocity * 0.22, -0.09, 0.09);
    tank.group.rotation.set(pitch, tank.physics.heading, roll);
    tank.turret.rotation.y = tank.turretYaw - tank.physics.heading;
    if (Math.abs(tank.physics.linearVelocity) > 1.25 && Math.random() < terrainSurfaceProfiles[tank.surface].dust * dt * 6) {
      this.spawnTrackDust(tank);
    }
  }

  private updateShells(dt: number): void {
    for (let index = this.shells.length - 1; index >= 0; index -= 1) {
      const shell = this.shells[index];
      shell.ttl -= dt;
      shell.age += dt;
      const verticalVelocity = shell.velocity.y;
      shell.mesh.position.x += shell.velocity.x * dt;
      shell.mesh.position.y = shellHeightAfterStep(shell.mesh.position.y, verticalVelocity, dt);
      shell.mesh.position.z += shell.velocity.z * dt;
      shell.velocity.y = stepShellVerticalVelocity(verticalVelocity, dt);
      const point = { x: shell.mesh.position.x, z: shell.mesh.position.z };
      if (
        shell.ttl <= 0 ||
        Math.abs(point.x) > tankArenaSize / 2 ||
        Math.abs(point.z) > tankArenaSize / 2
      ) {
        this.removeShell(index);
        continue;
      }
      const cityHit = this.findCityBuildingAtPoint(point);
      if (shell.mesh.position.y <= 0.28 || cityHit || this.hitsObstacle(point)) {
        this.explodeShell(shell, index, cityHit);
        continue;
      }
      const hit = this.findShellHit(shell);
      if (hit) {
        this.explodeShell(shell, index, null);
      }
    }
  }

  private explodeShell(shell: ShellEntity, index: number, directBuilding: CityBuildingEntity | null): void {
    const origin = shell.mesh.position.clone();
    origin.y = Math.max(0.2, origin.y);
    this.spawnExplosion(origin);
    this.applyCityBlastDamage(origin, directBuilding);
    this.applyBlastDamage(origin, shell.ownerId);
    this.removeShell(index);
  }

  private spawnExplosion(origin: THREE.Vector3): void {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffb24a,
      transparent: true,
      opacity: 0.48,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(explosionGeometry, material);
    mesh.position.copy(origin);
    mesh.scale.setScalar(1.2);
    const light = new THREE.PointLight(0xff9340, 2.4, 18);
    light.position.copy(origin).add(new THREE.Vector3(0, 1.8, 0));
    this.scene.add(mesh, light);
    this.explosions.push({ mesh, light, ttl: 0.58, maxTtl: 0.58 });

    const scorch = new THREE.Mesh(
      craterGeometry,
      new THREE.MeshBasicMaterial({ color: 0x0f0905, transparent: true, opacity: 0.48, depthWrite: false })
    );
    scorch.rotation.x = -Math.PI / 2;
    scorch.position.set(origin.x, 0.145, origin.z);
    scorch.scale.setScalar(1.2 + Math.random() * 1.5);
    this.scene.add(scorch);
  }

  private applyBlastDamage(origin: THREE.Vector3, ownerId: string): void {
    for (const tank of this.tanks.values()) {
      if (tank.id === ownerId || tank.health <= 0) {
        continue;
      }
      const distance = Math.hypot(tank.group.position.x - origin.x, tank.group.position.z - origin.z);
      const baseDamage = shellDamageForDistance(distance);
      if (baseDamage > 0) {
        const impactBearing = Math.atan2(origin.x - tank.group.position.x, origin.z - tank.group.position.z);
        const armorZone = armorZoneForImpact(tank.physics.heading, impactBearing);
        const damage = damageAfterArmor(baseDamage, armorZone);
        tank.physics = applyBlastImpulse(tank.physics, { x: origin.x, z: origin.z }, distance);
        tank.lastArmorZone = armorZone;
        if (tank.kind === "player") {
          this.cameraKick = Math.min(1, this.cameraKick + 0.45);
        }
        this.damageTank(tank, ownerId, damage, armorZone);
      }
    }
  }

  private applyCityBlastDamage(origin: THREE.Vector3, directBuilding: CityBuildingEntity | null): void {
    for (const building of this.cityBuildings) {
      const distance = building === directBuilding ? 0 : distanceToBoxXZ(origin, building.box);
      const damage = cityBuildingDamageForBlast(distance);
      if (damage > 0) {
        this.damageCityBuilding(building, damage, origin);
      }
    }
  }

  private damageCityBuilding(building: CityBuildingEntity, damage: number, origin: THREE.Vector3): void {
    const previousStage = building.stage;
    building.health = Math.max(0, building.health - damage);
    building.stage = cityBuildingDamageStage(building.health);
    this.addBuildingImpactRubble(building, origin, damage >= 28 ? 12 : 6);
    if (building.stage !== previousStage) {
      this.applyCityBuildingStage(building);
    }
    this.cityDamageStatus = this.formatCityDamageStatus();
  }

  private applyCityBuildingStage(building: CityBuildingEntity): void {
    const { height } = building.building;
    if (building.stage !== "intact") {
      building.body.material = this.materials.damagedBrick.clone();
    }

    if (building.stage === "scarred") {
      building.body.scale.y = 0.96;
      building.body.position.y = (height * building.body.scale.y) / 2;
      building.roof.position.y = height * building.body.scale.y;
    } else if (building.stage === "breached") {
      building.body.scale.y = 0.74;
      building.body.position.y = (height * building.body.scale.y) / 2;
      building.roof.rotation.z = 0.05;
      building.roof.position.y = height * building.body.scale.y + 0.25;
      building.windows.forEach((window, index) => {
        window.visible = index % 3 !== 0;
      });
    } else if (building.stage === "collapsed") {
      building.body.scale.y = 0.34;
      building.body.position.y = (height * building.body.scale.y) / 2;
      building.roof.visible = false;
      building.windows.forEach((window) => {
        window.visible = false;
      });
      this.addBuildingImpactRubble(building, building.group.position.clone(), 28);
    }

    building.box.setFromObject(building.group).expandByScalar(0.72);
  }

  private addBuildingImpactRubble(building: CityBuildingEntity, origin: THREE.Vector3, count: number): void {
    const local = building.group.worldToLocal(origin.clone());
    const rubbleX = clamp(local.x, -building.building.width / 2, building.building.width / 2);
    const rubbleZ = clamp(local.z, -building.building.depth / 2, building.building.depth / 2);
    for (let index = 0; index < count; index += 1) {
      const size = 0.24 + Math.random() * 0.62;
      const geometry = new THREE.BoxGeometry(size, size * 0.45, size * (0.7 + Math.random()));
      ensureGeometryUv2(geometry);
      const rubble = new THREE.Mesh(geometry, this.materials.damagedBrick);
      const radius = 0.4 + Math.random() * 2.6;
      const angle = Math.random() * Math.PI * 2;
      rubble.position.set(rubbleX + Math.cos(angle) * radius, size * 0.23, rubbleZ + Math.sin(angle) * radius);
      rubble.rotation.set(Math.random() * 0.55, Math.random() * Math.PI, Math.random() * 0.45);
      rubble.castShadow = true;
      rubble.receiveShadow = true;
      building.group.add(rubble);
    }
  }

  private formatCityDamageStatus(): string {
    const damaged = this.cityBuildings.filter((building) => building.health < 100).length;
    if (damaged === 0) {
      return "完整";
    }
    const collapsed = this.cityBuildings.filter((building) => building.stage === "collapsed").length;
    return collapsed > 0
      ? `${damaged}/${this.cityBuildings.length} 受损 · ${collapsed} 坍塌`
      : `${damaged}/${this.cityBuildings.length} 受损`;
  }

  private spawnTrackDust(tank: TankEntity): void {
    const side = Math.random() > 0.5 ? 1 : -1;
    const heading = tank.physics.heading;
    const backOffset = -Math.sign(tank.physics.linearVelocity || 1) * 2.2;
    const x = tank.group.position.x + Math.sin(heading) * backOffset + Math.cos(heading) * side * 1.45;
    const z = tank.group.position.z + Math.cos(heading) * backOffset - Math.sin(heading) * side * 1.45;
    const material = new THREE.MeshBasicMaterial({
      color: tank.surface === "mud" ? 0x332416 : 0x8b8056,
      transparent: true,
      opacity: tank.surface === "road" ? 0.2 : 0.32,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(dustGeometry, material);
    mesh.position.set(x, 0.28, z);
    mesh.scale.setScalar(0.6 + Math.random() * 0.55);
    this.scene.add(mesh);
    this.dust.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.35 + Math.random() * 0.35, (Math.random() - 0.5) * 0.8),
      ttl: 0.85,
      maxTtl: 0.85
    });
  }

  private updateDust(dt: number): void {
    for (let index = this.dust.length - 1; index >= 0; index -= 1) {
      const dust = this.dust[index];
      dust.ttl -= dt;
      dust.mesh.position.addScaledVector(dust.velocity, dt);
      dust.mesh.scale.multiplyScalar(1 + dt * 0.9);
      const material = dust.mesh.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, (dust.ttl / dust.maxTtl) * 0.32);
      if (dust.ttl <= 0) {
        this.scene.remove(dust.mesh);
        material.dispose();
        this.dust.splice(index, 1);
      }
    }
  }

  private updateExplosions(dt: number): void {
    for (let index = this.explosions.length - 1; index >= 0; index -= 1) {
      const explosion = this.explosions[index];
      explosion.ttl -= dt;
      const progress = 1 - explosion.ttl / explosion.maxTtl;
      explosion.mesh.scale.setScalar(1.2 + progress * tankBlastRadius);
      explosion.light.intensity = Math.max(0, 2.4 * (1 - progress));
      const material = explosion.mesh.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, 0.48 * (1 - progress));
      if (explosion.ttl <= 0) {
        this.scene.remove(explosion.mesh, explosion.light);
        material.dispose();
        this.explosions.splice(index, 1);
      }
    }
  }

  private updatePeers(): void {
    const now = performance.now();
    for (const tank of this.tanks.values()) {
      if (tank.kind === "peer" && now - tank.lastSeen > 4200) {
        this.scene.remove(tank.group);
        this.tanks.delete(tank.id);
      }
    }
  }

  private updateCamera(dt: number): void {
    const origin = this.player.group.position;
    const hullHeading = this.player.physics.heading;
    const gunHeading = this.player.turretYaw;
    let desired: THREE.Vector3;
    let target: THREE.Vector3;
    let fov = 55;

    if (this.cameraMode === "gunner") {
      desired = new THREE.Vector3(
        origin.x - Math.sin(gunHeading) * 1.2,
        2.35,
        origin.z - Math.cos(gunHeading) * 1.2
      );
      target = new THREE.Vector3(origin.x + Math.sin(gunHeading) * 42, 2.05, origin.z + Math.cos(gunHeading) * 42);
      fov = 42;
    } else if (this.cameraMode === "driver") {
      desired = new THREE.Vector3(
        origin.x + Math.sin(hullHeading) * 2.1,
        1.55,
        origin.z + Math.cos(hullHeading) * 2.1
      );
      target = new THREE.Vector3(origin.x + Math.sin(hullHeading) * 28, 1.2, origin.z + Math.cos(hullHeading) * 28);
      fov = 58;
    } else if (this.cameraMode === "tactical") {
      desired = new THREE.Vector3(origin.x, 66, origin.z + 0.1);
      target = new THREE.Vector3(origin.x, 0, origin.z);
      fov = 56;
    } else {
      desired = new THREE.Vector3(
        origin.x - Math.sin(hullHeading) * 18,
        18,
        origin.z - Math.cos(hullHeading) * 18
      );
      target = new THREE.Vector3(origin.x, 1.6, origin.z);
    }

    this.cameraKick = Math.max(0, this.cameraKick - dt * 2.8);
    if (this.cameraKick > 0) {
      const kick = this.cameraKick * this.cameraKick;
      desired.x += Math.sin(performance.now() * 0.026) * kick * 0.34;
      desired.y += kick * 0.42;
      desired.z += Math.cos(performance.now() * 0.021) * kick * 0.34;
    }

    this.camera.position.lerp(desired, dt * (this.cameraMode === "tactical" ? 2.2 : 4.5));
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, fov, dt * 4);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(target);
  }

  private updateTurretTarget(event: PointerEvent): void {
    const rect = this.dom.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(ground, hit)) {
      this.player.turretYaw = Math.atan2(hit.x - this.player.group.position.x, hit.z - this.player.group.position.z);
    }
  }

  private fire(tank: TankEntity, broadcast: boolean): void {
    if (tank.reloadMs > 0 || tank.health <= 0) {
      return;
    }
    tank.reloadMs = tank.kind === "bot" ? 950 : 520;
    const heading = tank.turretYaw;
    tank.physics = applyTankRecoil(tank.physics, heading);
    if (tank.kind === "player") {
      this.cameraKick = Math.min(1, this.cameraKick + 0.75);
    }
    const mesh = new THREE.Mesh(
      shellGeometry,
      new THREE.MeshStandardMaterial({ color: tank.kind === "player" ? 0xd8ff4f : 0xff744f, emissive: 0x442000 })
    );
    mesh.position.set(tank.group.position.x + Math.sin(heading) * 3, 1.55, tank.group.position.z + Math.cos(heading) * 3);
    this.scene.add(mesh);
    this.shells.push({
      ownerId: tank.id,
      mesh,
      velocity: new THREE.Vector3(Math.sin(heading) * tankShellSpeed, tankShellMuzzleLift, Math.cos(heading) * tankShellSpeed),
      ttl: 2.8,
      age: 0
    });
    if (broadcast && this.mode === "multiplayer") {
      this.channel?.postMessage({
        type: "shot",
        senderId: tank.id,
        x: tank.group.position.x,
        z: tank.group.position.z,
        heading
      } satisfies RemoteShotPacket);
    }
  }

  private receivePacket(packet: RemotePacket): void {
    if (!packet || packet.senderId === playerId || this.mode !== "multiplayer") {
      return;
    }
    if (packet.type === "shot") {
      const peer = this.tanks.get(packet.senderId);
      if (peer) {
        peer.turretYaw = packet.heading;
        this.fire(peer, false);
      }
      return;
    }

    let peer = this.tanks.get(packet.senderId);
    if (!peer) {
      peer = this.createTank(packet.senderId, packet.callsign, "peer", 0x45d8ff, { x: packet.x, z: packet.z });
    }
    peer.callsign = packet.callsign;
    peer.physics = {
      position: { x: packet.x, z: packet.z },
      heading: packet.heading,
      linearVelocity: 0,
      angularVelocity: 0
    };
    peer.turretYaw = packet.turretYaw;
    peer.health = packet.health;
    peer.score = packet.score;
    peer.lastSeen = performance.now();
    peer.surface = terrainSurfaceForPoint(peer.physics.position);
    peer.group.position.set(packet.x, 0, packet.z);
    peer.group.rotation.set(0, peer.physics.heading, 0);
    peer.turret.rotation.y = peer.turretYaw - peer.physics.heading;
  }

  private broadcastState(force: boolean): void {
    if (this.mode !== "multiplayer" || !this.channel) {
      return;
    }
    const now = performance.now();
    if (!force && now - this.lastBroadcast < 90) {
      return;
    }
    this.lastBroadcast = now;
    this.channel.postMessage({
      type: "state",
      senderId: playerId,
      callsign: playerCallsign,
      x: this.player.group.position.x,
      z: this.player.group.position.z,
      heading: this.player.physics.heading,
      turretYaw: this.player.turretYaw,
      health: this.player.health,
      score: this.player.score
    } satisfies RemoteStatePacket);
  }

  private findShellHit(shell: ShellEntity): TankEntity | null {
    for (const tank of this.tanks.values()) {
      if (tank.id === shell.ownerId || tank.health <= 0) {
        continue;
      }
      const distance = tank.group.position.distanceTo(shell.mesh.position);
      if (shellDamageForDistance(distance) > 0) {
        return tank;
      }
    }
    return null;
  }

  private damageTank(tank: TankEntity, ownerId: string, damage: number, armorZone: ArmorZone): void {
    tank.lastArmorZone = armorZone;
    tank.health = Math.max(0, tank.health - damage);
    if (tank.health > 0) {
      return;
    }
    const owner = this.tanks.get(ownerId);
    if (owner) {
      owner.score += 1;
    }
    window.setTimeout(() => this.respawnTank(tank), tank.kind === "player" ? 1200 : 1800);
  }

  private respawnTank(tank: TankEntity): void {
    const spawn = tank.kind === "player" ? { x: 0, z: 30 } : { x: 34 - Math.random() * 68, z: -34 + Math.random() * 28 };
    tank.health = 100;
    tank.physics = {
      position: spawn,
      heading: 0,
      linearVelocity: 0,
      angularVelocity: 0
    };
    tank.surface = terrainSurfaceForPoint(spawn);
    tank.lastArmorZone = null;
    tank.turretYaw = 0;
    tank.group.position.set(spawn.x, 0, spawn.z);
    tank.group.rotation.set(0, 0, 0);
    tank.turret.rotation.y = 0;
  }

  private removeShell(index: number): void {
    const [shell] = this.shells.splice(index, 1);
    if (shell) {
      this.scene.remove(shell.mesh);
      const material = shell.mesh.material;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material.dispose();
      }
    }
  }

  private hitsObstacle(point: ArenaPoint): boolean {
    const probe = new THREE.Vector3(point.x, 1, point.z);
    return this.obstacles.some((box) => box.containsPoint(probe));
  }

  private findCityBuildingAtPoint(point: ArenaPoint): CityBuildingEntity | null {
    const probe = new THREE.Vector3(point.x, 1.4, point.z);
    return this.cityBuildings.find((building) => building.box.containsPoint(probe)) ?? null;
  }

  private hasAction(action: string): boolean {
    for (const key of this.input) {
      if (actionForTankKey(key) === action) {
        return true;
      }
    }
    return false;
  }

  private updateHud(force: boolean): void {
    const now = performance.now();
    if (!force && now - this.lastHudUpdate < 160) {
      return;
    }
    this.lastHudUpdate = now;
    const peerCount = Array.from(this.tanks.values()).filter((tank) => tank.kind === "peer").length;
    this.dom.health.textContent = String(Math.round(this.player.health));
    this.dom.score.textContent = String(this.player.score);
    this.dom.status.textContent = this.mode === "single" ? "单人" : `${this.roomCode} / ${peerCount + 1}`;
    this.dom.speed.textContent = `${Math.abs(this.player.physics.linearVelocity).toFixed(1)} m/s`;
    this.dom.surface.textContent = terrainSurfaceProfiles[this.player.surface].label;
    this.dom.heading.textContent = headingDegrees(this.player.physics.heading);
    this.dom.camera.textContent = cameraModeLabels[this.cameraMode];
    this.dom.assets.textContent = this.assetStatus;
    this.dom.map.textContent = germanCityMapLabel;
    this.dom.material.textContent = this.materialStatus;
    this.dom.cityDamage.textContent = this.cityDamageStatus;
    this.dom.reload.textContent = this.player.reloadMs > 0 ? `${Math.ceil(this.player.reloadMs)} ms` : "就绪";
    this.dom.armorZone.textContent = this.player.lastArmorZone ? armorZoneLabels[this.player.lastArmorZone] : "完整";
    this.dom.roster.innerHTML = sortScoreboard(this.scoreboard())
      .map(
        (entry) => `
          <span class="${entry.kind}">
            <b>${entry.callsign}</b>
            <em>${entry.health}% / ${entry.score}</em>
          </span>
        `
      )
      .join("");
    this.dom.prompt.textContent =
      this.mode === "single"
        ? "物理：地形牵引、方向装甲、爆炸冲击、抛物线炮弹、开炮后坐、扬尘。"
        : "联机：同源 BroadcastChannel 房间；两个浏览器标签输入同一房间码即可同步。";
  }

  private scoreboard(): ScoreboardEntry[] {
    return Array.from(this.tanks.values()).map((tank) => ({
      id: tank.id,
      callsign: tank.callsign,
      health: Math.round(tank.health),
      score: tank.score,
      kind: tank.kind
    }));
  }
}

function angleDelta(a: number, b: number): number {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function headingDegrees(radians: number): string {
  const degrees = (THREE.MathUtils.radToDeg(radians) % 360 + 360) % 360;
  return String(Math.round(degrees)).padStart(3, "0");
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function distanceToBoxXZ(point: THREE.Vector3, box: THREE.Box3): number {
  const dx = Math.max(box.min.x - point.x, 0, point.x - box.max.x);
  const dz = Math.max(box.min.z - point.z, 0, point.z - box.max.z);
  return Math.hypot(dx, dz);
}

function createGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }
  context.fillStyle = "#242719";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < 900; index += 1) {
    const shade = 24 + Math.floor(Math.random() * 42);
    context.fillStyle = `rgba(${shade + 18}, ${shade + 14}, ${shade}, ${0.13 + Math.random() * 0.2})`;
    context.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 4, 1 + Math.random() * 4);
  }
  for (let index = 0; index < 34; index += 1) {
    context.strokeStyle = `rgba(76, 66, 42, ${0.1 + Math.random() * 0.18})`;
    context.beginPath();
    context.moveTo(Math.random() * 256, Math.random() * 256);
    context.lineTo(Math.random() * 256, Math.random() * 256);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createPbrMaterialKit(loader: THREE.TextureLoader): PbrMaterialKit {
  return {
    tankArmor: createPbrMaterial(loader, pbrTextureSets.tankMetal, {
      repeat: [2.4, 2.4],
      color: 0x687454,
      metalness: 0.58,
      roughness: 0.84,
      normalScale: 0.5
    }),
    tankTrack: createPbrMaterial(loader, pbrTextureSets.tankMetal, {
      repeat: [3.2, 1.8],
      color: 0x171a16,
      metalness: 0.72,
      roughness: 0.88,
      normalScale: 0.82
    }),
    cobblestone: createPbrMaterial(loader, pbrTextureSets.cobblestone, {
      repeat: [7, 7],
      color: 0xb3aaa0,
      metalness: 0.02,
      roughness: 0.96,
      normalScale: 0.78,
      displacementScale: 0.012
    }),
    brick: createPbrMaterial(loader, pbrTextureSets.brick, {
      repeat: [2.4, 2.8],
      color: 0x9a7561,
      metalness: 0.01,
      roughness: 0.94,
      normalScale: 0.68,
      displacementScale: 0.01
    }),
    plaster: createPbrMaterial(loader, pbrTextureSets.plaster, {
      repeat: [2.1, 2.5],
      color: 0xada48f,
      metalness: 0.01,
      roughness: 0.97,
      normalScale: 0.54,
      displacementScale: 0.006
    }),
    damagedBrick: createPbrMaterial(loader, pbrTextureSets.brick, {
      repeat: [2.2, 2.6],
      color: 0x6f6255,
      metalness: 0.01,
      roughness: 0.98,
      normalScale: 0.86,
      displacementScale: 0.014
    }),
    roof: createPbrMaterial(loader, pbrTextureSets.brick, {
      repeat: [3, 1.4],
      color: 0x4d2f25,
      metalness: 0.02,
      roughness: 0.91,
      normalScale: 0.42
    }),
    rail: createPbrMaterial(loader, pbrTextureSets.tankMetal, {
      repeat: [8, 1],
      color: 0x3e433d,
      metalness: 0.8,
      roughness: 0.68,
      normalScale: 0.6
    }),
    window: new THREE.MeshStandardMaterial({
      color: 0x141b1d,
      roughness: 0.42,
      metalness: 0.08
    }),
    windowGlow: new THREE.MeshStandardMaterial({
      color: 0xffd49a,
      emissive: 0xff9f45,
      emissiveIntensity: 0.9,
      roughness: 0.5,
      metalness: 0.02
    })
  };
}

function createPbrMaterial(
  loader: THREE.TextureLoader,
  textureSet: PbrTextureSet,
  options: {
    repeat: [number, number];
    color: number;
    metalness: number;
    roughness: number;
    normalScale: number;
    displacementScale?: number;
  }
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: options.color,
    map: loadPbrTexture(loader, textureSet.color, options.repeat, true),
    normalMap: loadPbrTexture(loader, textureSet.normal, options.repeat, false),
    roughnessMap: loadPbrTexture(loader, textureSet.roughness, options.repeat, false),
    aoMap: textureSet.ao ? loadPbrTexture(loader, textureSet.ao, options.repeat, false) : undefined,
    displacementMap:
      textureSet.displacement && options.displacementScale
        ? loadPbrTexture(loader, textureSet.displacement, options.repeat, false)
        : undefined,
    displacementScale: options.displacementScale ?? 0,
    metalness: options.metalness,
    roughness: options.roughness
  });
  material.normalScale.setScalar(options.normalScale);
  return material;
}

function loadPbrTexture(
  loader: THREE.TextureLoader,
  url: string,
  repeat: [number, number],
  colorTexture: boolean
): THREE.Texture {
  const texture = loader.load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 8;
  if (colorTexture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  return texture;
}

function ensureGeometryUv2(geometry: THREE.BufferGeometry): void {
  const uv = geometry.getAttribute("uv");
  if (!uv || geometry.getAttribute("uv2")) {
    return;
  }
  geometry.setAttribute("uv2", new THREE.BufferAttribute(new Float32Array(uv.array as ArrayLike<number>), uv.itemSize));
}

function createGabledRoofGeometry(width: number, depth: number, height: number): THREE.BufferGeometry {
  const leftFront = [-width / 2, 0, depth / 2];
  const peakFront = [0, height, depth / 2];
  const rightFront = [width / 2, 0, depth / 2];
  const leftBack = [-width / 2, 0, -depth / 2];
  const peakBack = [0, height, -depth / 2];
  const rightBack = [width / 2, 0, -depth / 2];
  const triangles = [
    [leftFront, peakFront, rightFront],
    [leftBack, rightBack, peakBack],
    [leftFront, leftBack, peakBack],
    [leftFront, peakBack, peakFront],
    [rightFront, peakFront, peakBack],
    [rightFront, peakBack, rightBack],
    [leftFront, rightFront, rightBack],
    [leftFront, rightBack, leftBack]
  ];
  const positions = triangles.flat(2);
  const uvs = triangles.flatMap(() => [0, 0, 0.5, 1, 1, 0]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function prepareAssetScene(root: THREE.Object3D): void {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) {
      return;
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const material = mesh.material;
    const materials = Array.isArray(material) ? material : [material];
    for (const item of materials) {
      const roughMaterial = item as THREE.MeshStandardMaterial;
      if (typeof roughMaterial.roughness === "number") {
        roughMaterial.roughness = Math.max(0.72, roughMaterial.roughness);
      }
    }
  });
}

function normalizeAssetModel(source: THREE.Object3D, footprint: number, groundLift = 0, yaw = 0): THREE.Group {
  const clone = source.clone(true);
  const wrapper = new THREE.Group();
  wrapper.add(clone);
  wrapper.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(wrapper);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const base = Math.max(size.x, size.z, 0.001);
  const scale = footprint / base;

  clone.position.sub(center);
  wrapper.scale.setScalar(scale);
  wrapper.rotation.y = yaw;
  wrapper.position.y = groundLift + (size.y * scale) / 2;
  return wrapper;
}

function createCylinderBetween(start: THREE.Vector3, end: THREE.Vector3, material: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(wireGeometry, material);
  const direction = end.clone().sub(start);
  const length = direction.length();
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.scale.y = length;
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
