import "./tankWorld.css";
import * as THREE from "three";
import {
  actionForTankKey,
  buildCallsign,
  clampArenaPoint,
  defaultTankRoom,
  multiplayerRoomStorageKey,
  normalizeRoomCode,
  shellDamageForDistance,
  sortScoreboard,
  stepTankPhysics,
  tankArenaSize,
  tankShellSpeed,
  type ArenaPoint,
  type ScoreboardEntry,
  type TankMode,
  type TankPhysicsState
} from "./tankWorldModel";

type TankKind = "player" | "bot" | "peer";

interface TankEntity {
  id: string;
  callsign: string;
  kind: TankKind;
  group: THREE.Group;
  turret: THREE.Group;
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
  roomInput: HTMLInputElement;
  roomApply: HTMLButtonElement;
  status: HTMLElement;
  health: HTMLElement;
  score: HTMLElement;
  roster: HTMLElement;
  prompt: HTMLElement;
}

const playerId = crypto.randomUUID();
const playerCallsign = buildCallsign(playerId);
const shellGeometry = new THREE.SphereGeometry(0.34, 12, 8);
const tankBodyGeometry = new THREE.BoxGeometry(3.2, 1.25, 4.2);
const tankTurretGeometry = new THREE.CylinderGeometry(0.95, 1.05, 0.74, 18);
const tankBarrelGeometry = new THREE.BoxGeometry(0.36, 0.34, 3);
const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);

export function mountTankWorld(root: HTMLElement): void {
  root.innerHTML = `
    <main class="tank-app" data-mode="single">
      <canvas class="tank-canvas" aria-label="Iron Ridge 3D tank battlefield"></canvas>
      <section class="tank-hud" aria-label="Tank battle controls and status">
        <div class="tank-brand">
          <p>Iron Ridge</p>
          <h1>3D Tank World</h1>
          <span>Three.js physics arena</span>
        </div>
        <div class="tank-toolbar" role="group" aria-label="Battle mode">
          <button class="tank-mode-button active" data-mode="single" type="button">Single Player</button>
          <button class="tank-mode-button" data-mode="multiplayer" type="button">Multiplayer Room</button>
        </div>
        <div class="tank-room">
          <label>
            Room
            <input name="tank-room" value="${defaultTankRoom}" maxlength="12" />
          </label>
          <button data-room-apply type="button">Join</button>
        </div>
        <div class="tank-status-grid">
          <span><b data-health>100</b>Armor</span>
          <span><b data-score>0</b>Kills</span>
          <span><b data-status>Single</b>Status</span>
        </div>
        <div class="tank-roster" data-roster></div>
        <p class="tank-prompt" data-prompt>WASD / arrows drive, Q/E rotate turret, Space or mouse click fires.</p>
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
  const roster = root.querySelector<HTMLElement>("[data-roster]");
  const prompt = root.querySelector<HTMLElement>("[data-prompt]");

  if (!canvas || !roomInput || !roomApply || !status || !health || !score || !roster || !prompt) {
    throw new Error("Missing tank world UI nodes.");
  }

  return {
    canvas,
    modeButtons: Array.from(root.querySelectorAll<HTMLButtonElement>(".tank-mode-button[data-mode]")),
    roomInput,
    roomApply,
    status,
    health,
    score,
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
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
  private renderer: THREE.WebGLRenderer | null = null;
  private animationFrame = 0;
  private channel: BroadcastChannel | null = null;
  private mode: TankMode = "single";
  private roomCode = defaultTankRoom;
  private player!: TankEntity;
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
      this.resize();
    } catch {
      this.dom.prompt.textContent = "WebGL is unavailable in this browser.";
    }
  }

  private buildScene(): void {
    this.scene.background = new THREE.Color(0x070907);
    this.scene.fog = new THREE.Fog(0x070907, 54, 150);
    this.camera.position.set(0, 30, 34);

    const hemi = new THREE.HemisphereLight(0xd8ffb2, 0x162013, 1.6);
    const sun = new THREE.DirectionalLight(0xfff1c1, 2.4);
    sun.position.set(-18, 42, 12);
    this.scene.add(hemi, sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(tankArenaSize, tankArenaSize, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x1b2419, roughness: 0.92, metalness: 0.04 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(tankArenaSize, 24, 0x93ad4d, 0x2e3c24);
    grid.position.y = 0.02;
    this.scene.add(grid);

    this.createWalls();
    this.createObstacles();
    this.player = this.createTank(playerId, playerCallsign, "player", 0xdefc5a, { x: 0, z: 30 });
  }

  private createWalls(): void {
    const material = new THREE.MeshStandardMaterial({ color: 0x455437, roughness: 0.88 });
    const walls = [
      { x: 0, z: -tankArenaSize / 2, sx: tankArenaSize, sz: 1.2 },
      { x: 0, z: tankArenaSize / 2, sx: tankArenaSize, sz: 1.2 },
      { x: -tankArenaSize / 2, z: 0, sx: 1.2, sz: tankArenaSize },
      { x: tankArenaSize / 2, z: 0, sx: 1.2, sz: tankArenaSize }
    ];

    for (const wall of walls) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(wall.sx, 2.8, wall.sz), material);
      mesh.position.set(wall.x, 1.4, wall.z);
      this.scene.add(mesh);
    }
  }

  private createObstacles(): void {
    const material = new THREE.MeshStandardMaterial({ color: 0x56604a, roughness: 0.96 });
    const placements = [
      { x: -24, z: -16, sx: 10, sz: 6 },
      { x: 18, z: -22, sx: 7, sz: 12 },
      { x: 28, z: 20, sx: 12, sz: 7 },
      { x: -18, z: 18, sx: 8, sz: 11 },
      { x: 0, z: 0, sx: 7, sz: 7 }
    ];

    for (const item of placements) {
      const mesh = new THREE.Mesh(obstacleGeometry, material);
      mesh.scale.set(item.sx, 2.4, item.sz);
      mesh.position.set(item.x, 1.2, item.z);
      this.scene.add(mesh);
      this.obstacles.push(new THREE.Box3().setFromObject(mesh).expandByScalar(1.2));
    }
  }

  private createTank(id: string, callsign: string, kind: TankKind, color: number, point: ArenaPoint): TankEntity {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.74, metalness: 0.18 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x111710, roughness: 0.9 });
    const body = new THREE.Mesh(tankBodyGeometry, material);
    body.position.y = 0.85;
    const leftTrack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 4.55), darkMaterial);
    leftTrack.position.set(-1.86, 0.42, 0);
    const rightTrack = leftTrack.clone();
    rightTrack.position.x = 1.86;
    const turret = new THREE.Group();
    const turretBase = new THREE.Mesh(tankTurretGeometry, material);
    turretBase.position.y = 1.65;
    turretBase.rotation.y = Math.PI / 2;
    const barrel = new THREE.Mesh(tankBarrelGeometry, material);
    barrel.position.set(0, 1.68, -1.94);
    turret.add(turretBase, barrel);
    group.add(body, leftTrack, rightTrack, turret);
    group.position.set(point.x, 0, point.z);
    this.scene.add(group);

    const tank: TankEntity = {
      id,
      callsign,
      kind,
      group,
      turret,
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
    return tank;
  }

  private bindEvents(): void {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("keydown", (event) => {
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
    this.dom.roomApply.addEventListener("click", () => this.joinRoom(this.dom.roomInput.value));
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
    const next = stepTankPhysics(tank.physics, { throttle, turn }, dt);
    const blocked = this.hitsObstacle(next.position);
    tank.physics = blocked ? stepTankPhysics(tank.physics, { throttle, turn, blocked: true }, dt) : next;
    tank.physics.position = clampArenaPoint(tank.physics.position);
    tank.group.position.set(tank.physics.position.x, 0, tank.physics.position.z);
    tank.group.rotation.y = tank.physics.heading;
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
    const offset = new THREE.Vector3(
      -Math.sin(this.player.physics.heading) * 18,
      20,
      -Math.cos(this.player.physics.heading) * 18
    );
    const desired = this.player.group.position.clone().add(offset);
    this.camera.position.lerp(desired, dt * 3.5);
    this.camera.lookAt(this.player.group.position.x, 1.4, this.player.group.position.z);
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
    peer.group.position.set(packet.x, 0, packet.z);
    peer.group.rotation.y = peer.physics.heading;
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
    tank.turretYaw = 0;
    tank.group.position.set(spawn.x, 0, spawn.z);
    tank.group.rotation.y = 0;
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
    this.dom.status.textContent = this.mode === "single" ? "Single" : `${this.roomCode} / ${peerCount + 1}`;
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
        ? "Physics: mass, engine force, drag, rebound collisions, turret aiming, shell velocity."
        : "Multiplayer uses BroadcastChannel for same-origin tabs. Use one room code in two tabs.";
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
