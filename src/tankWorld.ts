import "./tankWorld.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  actionForTankKey,
  buildCallsign,
  clampArenaPoint,
  defaultTankCameraMode,
  defaultTankRoom,
  multiplayerRoomStorageKey,
  normalizeTankCameraMode,
  normalizeRoomCode,
  shellDamageForDistance,
  sortScoreboard,
  stepTankPhysics,
  tankCameraModes,
  tankArenaSize,
  tankShellSpeed,
  terrainSurfaceForPoint,
  terrainSurfaceProfiles,
  type ArenaPoint,
  type ScoreboardEntry,
  type TankCameraMode,
  type TankMode,
  type TankPhysicsState,
  type TerrainSurface
} from "./tankWorldModel";

type TankKind = "player" | "bot" | "peer";
type WorldAssetKey = "tank" | "bags" | "trench" | "ruins";

interface TankEntity {
  id: string;
  callsign: string;
  kind: TankKind;
  group: THREE.Group;
  hull: THREE.Group;
  turret: THREE.Group;
  skin: THREE.Object3D | null;
  surface: TerrainSurface;
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

const playerId = crypto.randomUUID();
const playerCallsign = buildCallsign(playerId);
const shellGeometry = new THREE.SphereGeometry(0.34, 12, 8);
const tankBodyGeometry = new THREE.BoxGeometry(3.2, 1.25, 4.2);
const tankTurretGeometry = new THREE.CylinderGeometry(0.95, 1.05, 0.74, 18);
const tankBarrelGeometry = new THREE.BoxGeometry(0.36, 0.34, 3);
const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
const craterGeometry = new THREE.CircleGeometry(1, 28);
const roadGeometry = new THREE.PlaneGeometry(1, 1);
const cameraModeLabels: Record<TankCameraMode, string> = {
  commander: "车长",
  gunner: "炮手",
  driver: "驾驶",
  tactical: "战术"
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
  }
];
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
  { key: "bags", x: 5, z: -5, footprint: 6.5, yaw: -0.42 }
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
    roster,
    prompt
  };
}

class TankWorldGame {
  private readonly dom: TankDom;
  private readonly input = new Set<string>();
  private readonly shells: ShellEntity[] = [];
  private readonly tanks = new Map<string, TankEntity>();
  private readonly obstacles: THREE.Box3[] = [];
  private readonly assetLoader = new GLTFLoader();
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
  private assetStatus = "0/4";
  private sceneryApplied = false;
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

    const hemi = new THREE.HemisphereLight(0xe5f5cf, 0x12160e, 1.35);
    const sun = new THREE.DirectionalLight(0xffe4a6, 3.1);
    sun.position.set(-18, 42, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    this.scene.add(hemi, sun);

    this.createTerrain();
    this.createCratersAndRoads();

    this.createWalls();
    this.createObstacles();
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
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x3c3423,
      roughness: 0.94,
      transparent: true,
      opacity: 0.88
    });
    const verticalRoad = new THREE.Mesh(roadGeometry, roadMaterial);
    verticalRoad.scale.set(10.6, tankArenaSize, 1);
    verticalRoad.rotation.x = -Math.PI / 2;
    verticalRoad.position.y = 0.09;
    this.scene.add(verticalRoad);

    const horizontalRoad = verticalRoad.clone();
    horizontalRoad.scale.set(tankArenaSize, 10.6, 1);
    horizontalRoad.position.z = -7;
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

  private createTank(id: string, callsign: string, kind: TankKind, color: number, point: ArenaPoint): TankEntity {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.74, metalness: 0.18 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x111710, roughness: 0.9 });
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
      this.assetStatus = `${this.assetLibrary.size}/${worldAssets.length} CC0 GLB`;
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
    tank.hull.visible = false;
    tank.group.add(skin);
    tank.skin = skin;
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
  }

  private updateShells(dt: number): void {
    for (let index = this.shells.length - 1; index >= 0; index -= 1) {
      const shell = this.shells[index];
      shell.ttl -= dt;
      shell.mesh.position.addScaledVector(shell.velocity, dt);
      const point = { x: shell.mesh.position.x, z: shell.mesh.position.z };
      if (
        shell.ttl <= 0 ||
        Math.abs(point.x) > tankArenaSize / 2 ||
        Math.abs(point.z) > tankArenaSize / 2 ||
        this.hitsObstacle(point)
      ) {
        this.removeShell(index);
        continue;
      }
      const hit = this.findShellHit(shell);
      if (hit) {
        this.damageTank(hit, shell);
        this.removeShell(index);
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
      desired = new THREE.Vector3(origin.x, 46, origin.z + 0.1);
      target = new THREE.Vector3(origin.x, 0, origin.z);
      fov = 48;
    } else {
      desired = new THREE.Vector3(
        origin.x - Math.sin(hullHeading) * 18,
        18,
        origin.z - Math.cos(hullHeading) * 18
      );
      target = new THREE.Vector3(origin.x, 1.6, origin.z);
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
    const mesh = new THREE.Mesh(
      shellGeometry,
      new THREE.MeshStandardMaterial({ color: tank.kind === "player" ? 0xd8ff4f : 0xff744f, emissive: 0x442000 })
    );
    mesh.position.set(tank.group.position.x + Math.sin(heading) * 3, 1.25, tank.group.position.z + Math.cos(heading) * 3);
    this.scene.add(mesh);
    this.shells.push({
      ownerId: tank.id,
      mesh,
      velocity: new THREE.Vector3(Math.sin(heading) * tankShellSpeed, 0, Math.cos(heading) * tankShellSpeed),
      ttl: 2.4
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

  private damageTank(tank: TankEntity, shell: ShellEntity): void {
    tank.health = Math.max(0, tank.health - shellDamageForDistance(tank.group.position.distanceTo(shell.mesh.position)));
    if (tank.health > 0) {
      return;
    }
    const owner = this.tanks.get(shell.ownerId);
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
    tank.turretYaw = 0;
    tank.group.position.set(spawn.x, 0, spawn.z);
    tank.group.rotation.set(0, 0, 0);
    tank.turret.rotation.y = 0;
  }

  private removeShell(index: number): void {
    const [shell] = this.shells.splice(index, 1);
    if (shell) {
      this.scene.remove(shell.mesh);
    }
  }

  private hitsObstacle(point: ArenaPoint): boolean {
    const probe = new THREE.Vector3(point.x, 1, point.z);
    return this.obstacles.some((box) => box.containsPoint(probe));
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
        ? "物理：质量、引擎力、地形牵引、履带阻力、碰撞反弹、炮弹初速。"
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
