import * as THREE from './vendor/three.module.js';
import { createInterior } from './interior-scene.js';
import { createEntrance } from './entrance-scene.js';
import { findEntrance } from './entrance-anchor.js';

const $ = (id) => document.getElementById(id);
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, t) => { const v = clamp((t - a) / (b - a)); return v * v * (3 - 2 * v); };
const stage = $('stage'), layer = $('scene-layer'), card = $('student-card');
const campusUI = $('campus-ui'), details = $('detail-view'), quick = $('quick-view');
const scale = .065;
const FLIGHT_DURATION_MS = 500;
const ORBIT_DURATION_MS = 500;
const locations = {
  research: {
    drawing: '01 / LABORATORY', sceneTitle: '可视化实验室', sceneCaption: 'LABORATORY / RESEARCH',
    venue: '校园 / 工学院南楼 / 科研经历', kicker: 'RESEARCH LOG / 01',
    title: '马昱欣<br>实验室', subtitle: '可视化方向',
    body: `<section><h3>让数据，变得可见。</h3><p>围绕数据可视化与可视分析，探索信息如何被理解、表达与使用。</p></section><section><h3>研究记录</h3><p>具体项目、参与时间与个人贡献将在这里补充。</p><p class="detail-meta">RESEARCH NOTES — TO BE CONTINUED</p></section><a href="https://www.sustech.edu.cn/zh/faculties/mayuxin.html" target="_blank" rel="noopener noreferrer">了解实验室研究方向 ↗</a>`,
  },
  college: {
    drawing: '02 / READING ATRIUM', sceneTitle: '树仁书院', sceneCaption: 'READING ATRIUM / COLLEGE',
    venue: '校园 / 学生宿舍 15 栋 / 树仁书院', kicker: 'COLLEGE LOG / 02',
    title: '树仁书院<br>成长记录', subtitle: '学生宿舍 15 栋',
    body: `<section><h3><span>01</span>树仁书院学生会秘书处</h3><p class="detail-meta">STUDENT UNION / SECRETARIAT</p></section><section><h3><span>02</span>学生发展与指导中心</h3><p>服务同学的成长与发展。</p></section>`,
  },
  campus: {
    drawing: '03 / OPEN FORUM', sceneTitle: '校园提案与竞赛', sceneCaption: 'OPEN FORUM / CAMPUS',
    venue: '校园 / 南科大中心 / 校园经历', kicker: 'CAMPUS LOG / 03',
    title: '把想法<br>带进校园', subtitle: '协作 · 表达 · 落地',
    body: `<section><h3><span>01</span>校园提案一等奖</h3><p>从校园里的问题出发，把观察变成可以讨论的提案。</p></section><section><h3><span>02</span>国创比赛</h3><p class="detail-meta">INNOVATION / COMPETITION</p></section><a href="../../education.html">查看教育经历 ↗</a>`,
  },
};

let data, renderer, campusScene, campusGroup, camera, roomScene, roomCamera, room;
let width = 1, height = 1, startRect, cardCenter, viewport, progress = 0, yaw = -.38, elevation = .88;
let campusOrbitRadius=1, orbitTween=null;
let mode = 'campus', selected = null, flight = null, frame = 0, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let entrance, assembly, hiddenBuilding, queuedLocation=null, ready = false, fallback = false, dragging = null;
const buildingMeshes = new Map(), landmarkPoints = new Map();
const campusFadeMaterials = new Map();
const flightControls=document.createElement('div');
flightControls.id='flight-controls'; flightControls.hidden=true;
flightControls.innerHTML='<button id="cancel-flight" class="text-button" type="button">← 返回校园</button><div><p id="flight-caption" role="status" aria-live="polite"></p><span class="flight-track" aria-hidden="true"><i></i></span></div><button id="skip-flight" class="text-button" type="button">跳过运镜 ↗</button>';
document.body.append(flightControls);

function requestRender() { if (!frame) frame = requestAnimationFrame(render); }
function getProgress() { return clamp((scrollY - $('journey').offsetTop) / Math.max(1, $('journey').offsetHeight - stage.offsetHeight)); }
function setUIVisible(visible) {
  campusUI.style.opacity = visible ? '1' : '0';
  campusUI.style.visibility = visible ? 'visible' : 'hidden';
  campusUI.inert = !visible;
}
function drawIdentityLines() {
  const s = stage.getBoundingClientRect(), c = card.getBoundingClientRect();
  const p = $('personal-note').getBoundingClientRect(), u = $('school-note').getBoundingClientRect();
  const svg = $('identity-lines');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const paths = width > 760 ? [
    [[c.left-s.left+c.width*.08,c.top-s.top+c.height*.85],[c.left-s.left-28,c.top-s.top+c.height*.85],[p.right-s.left-20,p.top-s.top+56]],
    [[c.right-s.left-17,c.top-s.top+c.height*.09],[c.right-s.left+34,c.top-s.top+c.height*.09],[u.left-s.left-20,u.top-s.top+48],[u.left-s.left-2,u.top-s.top+48]],
  ] : [
    [[c.left-s.left+10,c.bottom-s.top-12],[p.left-s.left+8,c.bottom-s.top+22],[p.left-s.left+8,p.top-s.top-12]],
    [[c.right-s.left-10,c.bottom-s.top-12],[u.left-s.left+12,c.bottom-s.top+22],[u.left-s.left+12,u.top-s.top-12]],
  ];
  svg.innerHTML = paths.map(points => `<polyline points="${points.map(p=>p.join(',')).join(' ')}"/><circle cx="${points[0][0]}" cy="${points[0][1]}" r="2.5"/>`).join('');
}
function resize() {
  const preserveProgress=ready && !!startRect && mode==='campus';
  const previousProgress=progress;
  width = stage.clientWidth; height = stage.clientHeight;
  const oldTransform = card.style.transform;
  card.style.transform = '';
  const r = $('card-map').getBoundingClientRect(), s = stage.getBoundingClientRect();
  // Use the painted SVG rectangle, excluding the letterbox of object-fit:contain.
  const mapFit=Math.min(r.width/1522,r.height/1914), mapW=1522*mapFit, mapH=1914*mapFit;
  startRect = {x:r.left-s.left+(r.width-mapW)*.5,y:r.top-s.top+(r.height-mapH)*.49,w:mapW,h:mapH};
  const c=card.getBoundingClientRect();
  cardCenter={x:c.left-s.left+c.width/2,y:c.top-s.top+c.height/2};
  drawIdentityLines();
  card.style.transform = oldTransform;
  renderer?.setSize(width, height, false);
  if (roomCamera) { roomCamera.aspect = width/height; roomCamera.updateProjectionMatrix(); }
  if(flight && data){flight.from=targetView(1);if(mode==='interior')flightPose(1);}
  if(preserveProgress)window.scrollTo({top:$('journey').offsetTop+previousProgress*Math.max(1,$('journey').offsetHeight-height),behavior:'instant'});
  requestRender();
}
function makeShape(outline, holes = []) {
  const pts = outline.map(([x,z]) => new THREE.Vector2(x*scale,-z*scale));
  const shape = new THREE.Shape(pts);
  for (const hole of holes) shape.holes.push(new THREE.Path(hole.map(([x,z]) => new THREE.Vector2(x*scale,-z*scale))));
  return shape;
}
function createCampus() {
  campusScene = new THREE.Scene();
  campusGroup = new THREE.Group(); campusScene.add(campusGroup);
  const cx=(data.bounds.minX+data.bounds.maxX)/2, cz=(data.bounds.minZ+data.bounds.maxZ)/2;
  let radiusSquared=0;
  function includePoint([x,z],height=0){radiusSquared=Math.max(radiusSquared,(x-cx)**2+(z-cz)**2+height**2);}
  for(const b of data.buildings)for(const point of b.outline)includePoint(point,b.height);
  for(const road of data.roads)for(const point of road.points)includePoint(point);
  for(const water of data.waters)for(const point of water.outline)includePoint(point);
  campusOrbitRadius=Math.sqrt(radiusSquared)*scale;
  const roof = new THREE.MeshBasicMaterial({color:0x164db5,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  const wall = new THREE.MeshBasicMaterial({color:0x073091,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  const wire = new THREE.LineBasicMaterial({color:0xe0efff,transparent:true,opacity:.66});
  for (const b of data.buildings) {
    const geometry = new THREE.ExtrudeGeometry(makeShape(b.outline,b.holes),{depth:b.height*scale,bevelEnabled:false,steps:1,curveSegments:1});
    geometry.rotateX(-Math.PI/2);
    const mesh = new THREE.Mesh(geometry,[roof,wall]);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry,25),wire);
    campusGroup.add(mesh,edge); buildingMeshes.set(b.id,{mesh,edge,height:b.height*scale});
  }
  const roads = [];
  for (const r of data.roads) for (let i=1;i<r.points.length;i++) roads.push(r.points[i-1][0]*scale,.025,r.points[i-1][1]*scale,r.points[i][0]*scale,.025,r.points[i][1]*scale);
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.Float32BufferAttribute(roads,3));
  campusGroup.add(new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xc4e0ff,transparent:true,opacity:.25})));
  const waterMaterial = new THREE.MeshBasicMaterial({color:0x1857c1,side:THREE.DoubleSide});
  for (const w of data.waters) {
    const g = new THREE.ShapeGeometry(makeShape(w.outline,w.holes)); g.rotateX(-Math.PI/2); g.translate(0,.015,0);
    campusGroup.add(new THREE.Mesh(g,waterMaterial));
    const points = [...w.outline,w.outline[0]].map(([x,z]) => new THREE.Vector3(x*scale,.03,z*scale));
    campusGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xb1d4ff,transparent:true,opacity:.28})));
  }
  for (const [key,l] of Object.entries(data.landmarks)) {
    const h = buildingMeshes.get(l.buildingId)?.height ?? 1;
    landmarkPoints.set(key,new THREE.Vector3(l.x*scale,h+.45,l.z*scale));
    const ring = new THREE.Mesh(new THREE.RingGeometry(1,1.12,48),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2; ring.position.set(l.x*scale,h+.1,l.z*scale); campusGroup.add(ring);
  }
  camera = new THREE.OrthographicCamera(-100,100,100,-100,.1,1600);
  camera.up.set(0,1,0);
}
// First zoom the original card artwork until it fills the screen. Only then
// replace that crop with the same top-down geometry and unfold its height.
function zoomScale() { return Math.max(width/startRect.w,height/startRect.h)*1.04; }
function targetView(p) {
  const t = smooth(.53,1,p);
  const end = width>760 ? {x:width*.18,y:height*.115,w:width*.80,h:height*.76} : {x:0,y:height*.28,w:width,h:height*.53};
  viewport = {x:end.x*t,y:end.y*t,w:mix(width,end.w,t),h:mix(height,end.h,t)};
  const b=data.bounds, mapWidth=b.maxX-b.minX, mapHeight=b.maxZ-b.minZ;
  // startRect already matches the actual contained SVG drawing.
  const fit=Math.max(startRect.w/mapWidth,startRect.h/mapHeight);
  const cropX=(startRect.w-mapWidth*fit)*.5, cropY=(startRect.h-mapHeight*fit)*.49;
  const focus=new THREE.Vector3((b.minX+(startRect.w/2-cropX)/fit)*scale,0,(b.minZ+(startRect.h/2-cropY)/fit)*scale);
  const center=focus.lerp(new THREE.Vector3((b.minX+b.maxX)*scale/2,0,(b.minZ+b.maxZ)*scale/2),t);
  const angle=mix(0,yaw,t), elev=mix(Math.PI/2-.00001,elevation,t);
  const direction = new THREE.Vector3(Math.sin(angle)*Math.cos(elev),Math.sin(elev),Math.cos(angle)*Math.cos(elev));
  const asp=viewport.w/viewport.h;
  const closeSpan=height/(fit*zoomScale())*scale;
  // Fit one fixed world-space sphere, not a changing projected rectangle.
  // Rotation only changes direction; screen scale and pivot stay constant.
  const contain=2*campusOrbitRadius*1.06/Math.min(1,asp);
  return {center,direction,span:mix(closeSpan,contain,t),viewport:{...viewport}};
}
function applyView(v) {
  const asp=viewport.w/viewport.h;
  camera.left=-v.span*asp/2; camera.right=v.span*asp/2; camera.top=v.span/2; camera.bottom=-v.span/2;
  camera.position.copy(v.center).addScaledVector(v.direction,300); camera.lookAt(v.center); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
}
function render(now) {
  frame=0;
  if(orbitTween){
    const t=clamp((now-orbitTween.start)/ORBIT_DURATION_MS), eased=smooth(0,1,t);
    yaw=mix(orbitTween.fromYaw,orbitTween.toYaw,eased);
    elevation=mix(orbitTween.fromElevation,orbitTween.toElevation,eased);
    if(t<1)requestRender();else orbitTween=null;
  }
  progress=getProgress();
  const visualProgress=mode!=='campus'?1:reduced ? (progress>.12?1:0) : progress;
  const identityOpacity=1-smooth(.43,.53,visualProgress);
  $('identity-area').style.opacity=identityOpacity;
  $('identity-area').style.visibility=identityOpacity>0?'visible':'hidden';
  const zoomT=smooth(0,.43,visualProgress), zoom=mix(1,zoomScale(),zoomT);
  const focusX=startRect.x+startRect.w/2, focusY=startRect.y+startRect.h/2;
  const targetX=mix(focusX,width/2,zoomT), targetY=mix(focusY,height/2,zoomT);
  const dx=targetX-cardCenter.x-zoom*(focusX-cardCenter.x), dy=targetY-cardCenter.y-zoom*(focusY-cardCenter.y);
  card.style.transform=`translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${zoom})`;
  const annotationOpacity=1-smooth(.025,.13,visualProgress);
  for(const el of [$('personal-note'),$('school-note'),$('identity-lines'),document.querySelector('.identity-eyebrow')]) el.style.opacity=annotationOpacity;
  document.querySelectorAll('.card-inner-border,.card-node').forEach(el=>el.style.opacity=annotationOpacity);
  card.style.setProperty('--plan-grid-opacity',annotationOpacity);
  document.querySelector('.card-student-type').style.opacity=1-smooth(.02,.12,visualProgress);
  $('scroll-cue').style.opacity=1-smooth(.01,.10,visualProgress);
  $('scroll-cue').style.visibility=visualProgress<.12?'visible':'hidden';
  const visible=visualProgress>.94 && mode==='campus' && ready;
  setUIVisible(visible);
  $('chapter-label').innerHTML = visualProgress>.94?'02 <span>/</span> 校园漫游':visualProgress>.53?'02 <span>/</span> 校园展开':visualProgress>.04?'01 <span>/</span> 走近校园图案':'01 <span>/</span> 身份档案';
  if (fallback) {
    layer.style.opacity=String(smooth(.43,.53,visualProgress));
    const bounds=data?.bounds || {minX:-454,maxX:1068,minZ:-1057,maxZ:857};
    const marks=data?.landmarks || {research:{x:-298.03,z:-86.83},college:{x:132.49,z:-282.95},campus:{x:-171.16,z:279.67}};
    const factor=Math.min(width*.84/(bounds.maxX-bounds.minX),height*.64/(bounds.maxZ-bounds.minZ));
    for (const [key,pos] of Object.entries(marks)) {
      $(`pin-${key}`).style.left=`${width*.5+(pos.x-(bounds.minX+bounds.maxX)/2)*factor}px`;
      $(`pin-${key}`).style.top=`${height*.54+(pos.z-(bounds.minZ+bounds.maxZ)/2)*factor}px`;
    }
    return;
  }
  if (!renderer || !data) return;
  renderer.setScissorTest(false); renderer.setViewport(0,0,width,height); renderer.clear();
  layer.style.opacity=mode==='campus'?String(smooth(.43,.53,visualProgress)):'1';
  if(mode==='interior') {
    renderer.render(roomScene,roomCamera); return;
  }
  if(flight && (mode==='entering'||mode==='leaving')) {
    advanceFlight(now); return;
  }
  let v=targetView(visualProgress);
  campusGroup.scale.y=mix(.001,1,smooth(.53,.98,visualProgress));
  applyView(v);
  renderer.setViewport(viewport.x,height-viewport.y-viewport.h,viewport.w,viewport.h);
  renderer.setScissor(viewport.x,height-viewport.y-viewport.h,viewport.w,viewport.h); renderer.setScissorTest(true);
  renderer.render(campusScene,camera);
  for (const [key,point] of landmarkPoints) {
    const p=point.clone(); p.y*=campusGroup.scale.y; p.project(camera);
    const pin=$(`pin-${key}`);
    pin.style.left=`${viewport.x+(p.x+1)*viewport.w/2}px`; pin.style.top=`${viewport.y+(1-p.y)*viewport.h/2}px`;
  }
}

function scrollCampus() { window.scrollTo({top:$('journey').offsetTop+$('journey').offsetHeight-stage.offsetHeight,behavior:'instant'}); progress=1; }
function roomContent(key) {
  const content=locations[key];
  details.dataset.scene=key;
  $('detail-drawing').textContent=content.drawing;
  $('scene-register-number').textContent=content.drawing.slice(0,2);
  $('scene-register-title').textContent=content.sceneTitle;
  $('scene-register-caption').textContent=content.sceneCaption;
  $('detail-venue').textContent=content.venue; $('detail-kicker').textContent=content.kicker;
  $('detail-title').innerHTML=content.title; $('detail-subtitle').textContent=content.subtitle; $('detail-body').innerHTML=content.body;
  details.querySelectorAll('[data-location]').forEach(el=>el.setAttribute('aria-current',String(el.dataset.location===key)));
  details.hidden=false; details.inert=false; details.style.opacity='1'; details.scrollTop=0; document.body.style.overflow='hidden';
  details.classList.remove('room-arrived'); void details.offsetWidth; details.classList.add('room-arrived');
  $('journey').inert=true;
  $('back-campus').focus({preventScroll:true});
}

// The entire approach, corridor and room share one world and one camera.
// An almost-orthographic perspective at the start matches the campus atlas;
// opening its field of view lets the same camera descend to eye level.
function prepareRoom(key) {
  const source=data.buildings.find(b=>b.id===data.landmarks[key].buildingId);
  const anchor=findEntrance(source,{x:Math.sin(yaw),z:Math.cos(yaw)});
  room=createInterior(THREE,key); entrance=createEntrance(THREE,key);
  assembly=new THREE.Group(); assembly.add(room.group,entrance.group);
  roomScene=new THREE.Scene(); roomScene.add(assembly);
  roomCamera=new THREE.PerspectiveCamera(1,width/height,.006,50000);
  if(!anchor) {
    // A malformed footprint must not invent a door position on the real map.
    entrance.group.visible=false;
    roomCamera.fov=width>760?48:60;
    roomCamera.position.copy(room.cameraPosition); roomCamera.lookAt(room.lookAt); roomCamera.updateProjectionMatrix();
    return false;
  }
  assembly.scale.setScalar(.075);
  // Point sprites use camera distance but do not inherit the group's scale.
  const pointMaterials=new Set();
  room.group.traverse(object=>{if(object.isPoints)pointMaterials.add(object.material);});
  pointMaterials.forEach(material=>material.size*=.075);
  assembly.rotation.y=Math.atan2(anchor.nx,anchor.nz);
  const entry=new THREE.Vector3(10,0,48).multiplyScalar(.075).applyAxisAngle(new THREE.Vector3(0,1,0),assembly.rotation.y);
  assembly.position.set(anchor.x*scale+anchor.nx*.04-entry.x,.025,anchor.z*scale+anchor.nz*.04-entry.z);
  assembly.updateMatrixWorld(true);
  campusGroup.scale.y=1; roomScene.add(campusGroup);
  const building=buildingMeshes.get(source.id);
  hiddenBuilding={...building,materials:building.mesh.material,edgeMaterial:building.edge.material};
  // Cut an actual opening in the illustrative mass, so the original facade
  // cannot seal the corridor while the camera approaches it.
  const opening=[
    new THREE.Plane(new THREE.Vector3(-1,0,0),5),new THREE.Plane(new THREE.Vector3(1,0,0),-15),
    new THREE.Plane(new THREE.Vector3(0,-1,0),-.1),new THREE.Plane(new THREE.Vector3(0,1,0),-9),
    new THREE.Plane(new THREE.Vector3(0,0,-1),-14),new THREE.Plane(new THREE.Vector3(0,0,1),-49),
  ].map(plane=>plane.applyMatrix4(assembly.matrixWorld));
  function entranceMaterial(material){const m=material.clone();m.transparent=true;m.clippingPlanes=opening;m.clipIntersection=true;return m;}
  building.mesh.material=building.mesh.material.map(entranceMaterial);
  building.edge.material=entranceMaterial(building.edge.material);
  const facadeMaterials=new Set([...building.mesh.material,building.edge.material]);
  campusGroup.traverse(object=>{
    if(!object.material)return;
    for(const material of Array.isArray(object.material)?object.material:[object.material]) {
      if(facadeMaterials.has(material)||campusFadeMaterials.has(material))continue;
      campusFadeMaterials.set(material,{opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite});
      material.transparent=true;material.needsUpdate=true;
    }
  });
  flight={t:0,last:performance.now(),direction:1,duration:FLIGHT_DURATION_MS,from:targetView(1),anchor};
  renderer.compile(roomScene,roomCamera);
  flight.last=performance.now();
  return true;
}
function disposeRoom() {
  campusFadeMaterials.forEach((saved,material)=>{Object.assign(material,saved);material.needsUpdate=true;});
  campusFadeMaterials.clear();
  if(campusGroup) {campusScene.add(campusGroup);campusGroup.visible=true;}
  if(hiddenBuilding) {
    hiddenBuilding.mesh.material.forEach(m=>m.dispose()); hiddenBuilding.edge.material.dispose();
    hiddenBuilding.mesh.material=hiddenBuilding.materials; hiddenBuilding.edge.material=hiddenBuilding.edgeMaterial;
    hiddenBuilding=null;
  }
  room?.dispose(); entrance?.dispose(); room=null; entrance=null; assembly=null; roomScene=null; roomCamera=null; flight=null;
}
function flightPose(t) {
  const a=smooth(0,.38,t), whole=flight.from.viewport;
  viewport={x:whole.x*(1-a),y:whole.y*(1-a),w:mix(whole.w,width,a),h:mix(whole.h,height,a)};
  const arrivalFov=width>760?48:60;
  const endSpan=12*.075*2*Math.tan(THREE.MathUtils.degToRad(52/2));
  const logRatio=Math.log(endSpan/flight.from.span);
  if(t<=.38) {
    const target=assembly.localToWorld(new THREE.Vector3(10,4.5,48));
    // Align with the doorway while still outside the facade; a late lateral
    // correction would let the rapidly closing camera cut through a side wall.
    const alignment=smooth(0,.65,t/.38);
    const center=flight.from.center.clone().lerp(target,alignment);
    const outward=new THREE.Vector3(flight.anchor.nx,0,flight.anchor.nz);
    const direction=flight.from.direction.clone().lerp(outward,alignment).normalize();
    const fov=mix(.5,52,smooth(0,.8,a));
    // Hermite zoom leaves the approach with forward speed, so the camera
    // does not stop at the facade before starting down the corridor.
    const u=clamp(t/.38), zoom=(-1.5*u+2.5)*u*u;
    const span=Math.exp(Math.log(flight.from.span)+logRatio*zoom);
    const distance=span/(2*Math.tan(THREE.MathUtils.degToRad(fov/2)));
    roomCamera.position.copy(center).addScaledVector(direction,distance); roomCamera.lookAt(center); roomCamera.fov=fov;
  } else {
    const u=clamp((t-.38)/.62);
    const slope=(12*logRatio*.5/.38)*.62/(room.cameraPosition.z-60);
    const walk=((-2+slope)*u+(3-2*slope))*u*u+slope*u;
    const z=mix(60,room.cameraPosition.z,walk);
    // Stay centered through the door, then reveal each room's own composition.
    const settle=smooth(.62,1,t), lateral=smooth(25,18,z);
    const localPosition=new THREE.Vector3(mix(10,room.cameraPosition.x,lateral),mix(4.5,room.cameraPosition.y,lateral),z);
    roomCamera.position.copy(assembly.localToWorld(localPosition));
    const finalRotation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(room.cameraPosition,room.lookAt,new THREE.Vector3(0,1,0)));
    const localRotation=new THREE.Quaternion().slerp(finalRotation,settle);
    roomCamera.quaternion.copy(assembly.quaternion).multiply(localRotation);
    roomCamera.fov=mix(52,arrivalFov,settle);
  }
  roomCamera.aspect=viewport.w/viewport.h; roomCamera.updateProjectionMatrix(); roomCamera.updateMatrixWorld();
  entrance.setProgress(smooth(.43,.66,t));
  const opacity=1-smooth(.41,.57,t);
  // Isolate the selected building before descending through the surrounding
  // campus, then keep its facade continuous with the entrance section drawing.
  const campusOpacity=1-smooth(.08,.18,t);
  campusFadeMaterials.forEach((saved,material)=>{material.opacity=saved.opacity*campusOpacity;material.depthWrite=saved.depthWrite&&campusOpacity>.98;});
  hiddenBuilding?.mesh.material.forEach(m=>{m.opacity=opacity;m.depthWrite=opacity>.98;});
  if(hiddenBuilding) hiddenBuilding.edge.material.opacity=opacity*.66;
  campusGroup.visible=t<.57;
  if(mode==='leaving') {
    details.style.opacity=String(smooth(.9,1,t));
    if(t<.9)details.hidden=true;
  }
  const caption=mode==='leaving'?'沿原路返回校园':t<.38?`走近${data.landmarks[selected].name}`:t<.57?'沿走廊向前':t<.81?'门正在打开':'走进这段经历';
  if($('flight-caption').textContent!==caption)$('flight-caption').textContent=caption;
  flightControls.querySelector('.flight-track i').style.transform=`scaleX(${t})`;
}
function advanceFlight(now) {
  const elapsed=Math.min(Math.max(now-flight.last,0),80); flight.last=now;
  flight.t=clamp(flight.t+flight.direction*elapsed/flight.duration);
  flightPose(flight.t);
  renderer.setViewport(viewport.x,height-viewport.y-viewport.h,viewport.w,viewport.h);
  renderer.setScissor(viewport.x,height-viewport.y-viewport.h,viewport.w,viewport.h);renderer.setScissorTest(true);
  renderer.render(roomScene,roomCamera);
  if(flight.direction>0 && flight.t>=1) finishInside();
  else if(flight.direction<0 && flight.t<=0) finishCampus();
  else requestRender();
}
function finishInside() {
  mode='interior'; flightControls.hidden=true;
  roomContent(selected); $('scene-status').textContent=''; requestRender();
}
function finishCampus() {
  const lastKey=selected, next=queuedLocation;
  queuedLocation=null; details.hidden=true; details.inert=false; details.style.opacity='1';
  disposeRoom(); mode='campus';selected=null;flightControls.hidden=true;
  $('journey').inert=false;document.body.style.overflow='';
  if(lastKey || next)scrollCampus();
  resize();
  $('scene-status').textContent='';setUIVisible(true);
  if(next)enterLocation(next,true);else $(`pin-${lastKey}`)?.focus({preventScroll:true});
  requestRender();
}
function showRoom(key) {
  selected=key;
  if(!fallback) {
    const hasRoute=prepareRoom(key);
    if(hasRoute){flight.t=1;flightPose(1);}
  }
  finishInside();
}
function enterLocation(key,fromHistory=false) {
  if(!locations[key] || !ready) return;
  if(quick.open)quick.close();
  if(selected===key && (mode==='interior'||mode==='entering'))return;
  if(!fromHistory) {
    const url=new URL(location.href);url.hash=key;
    if(mode!=='campus')history.replaceState({blueprint:true},'',url);else history.pushState({blueprint:true},'',url);
  }
  if(mode!=='campus') {queuedLocation=key;returnCampus(true,true);return;}
  selected=key;scrollCampus();document.body.style.overflow='hidden';$('journey').inert=true;resize();
  if(reduced || fallback){showRoom(key);return;}
  if(!prepareRoom(key)){finishInside();return;}
  mode='entering';orbitTween=null;flightControls.hidden=false;setUIVisible(false);
  $('skip-flight').textContent='跳过运镜 ↗';
  $('cancel-flight').focus({preventScroll:true});requestRender();
}
function returnCampus(fromHistory=false,keepQueue=false) {
  if(mode==='campus')return;
  if(!keepQueue)queuedLocation=null;
  if(!fromHistory){const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);}
  if(reduced || fallback || !flight){finishCampus();return;}
  mode='leaving';details.inert=true;details.classList.remove('room-arrived');
  flight.direction=-1;flight.last=performance.now();flight.duration=FLIGHT_DURATION_MS;
  flightControls.hidden=false;$('skip-flight').textContent='直接回到校园 ↗';
  $('cancel-flight').focus({preventScroll:true});requestRender();
}
function skipFlight() {
  if(mode==='leaving'){finishCampus();return;}
  if(mode==='entering'&&flight){flight.t=1;flightPose(1);finishInside();}
}
function motionUI() {
  document.documentElement.dataset.reducedMotion=String(reduced);
  const button=$('motion-toggle'); button.setAttribute('aria-pressed',String(reduced));
  button.querySelector('.motion-label').textContent=reduced?'恢复动态':'减少动态';
  button.setAttribute('aria-label',reduced?'恢复页面动态效果':'减少页面动态效果');
  if(reduced && (mode==='entering'||mode==='leaving'))skipFlight();
  if(reduced && orbitTween){yaw=orbitTween.toYaw;elevation=orbitTween.toElevation;orbitTween=null;}
  requestRender();
}

document.querySelectorAll('[data-location]').forEach(button=>{
  button.addEventListener('click',()=>enterLocation(button.dataset.location));
  button.addEventListener('pointerenter',()=>{
    if(mode!=='campus')return;
    const target=data && buildingMeshes.get(data.landmarks[button.dataset.location].buildingId);
    if(target) { target.edge.material=new THREE.LineBasicMaterial({color:0xffffff}); requestRender(); }
  });
  button.addEventListener('pointerleave',()=>{
    if(mode!=='campus')return;
    const target=data && buildingMeshes.get(data.landmarks[button.dataset.location].buildingId);
    if(target && target.edge.material.opacity===1) { target.edge.material.dispose(); target.edge.material=new THREE.LineBasicMaterial({color:0xe0efff,transparent:true,opacity:.66}); requestRender(); }
  });
});
function rotateTo(toYaw,toElevation=elevation){
  if(reduced){yaw=toYaw;elevation=toElevation;orbitTween=null;}
  else orbitTween={fromYaw:yaw,toYaw,fromElevation:elevation,toElevation,start:performance.now()};
  requestRender();
}
document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
  const action=button.dataset.action;
  if(action==='explore') window.scrollTo({top:$('journey').offsetTop+$('journey').offsetHeight-stage.offsetHeight,behavior:reduced?'instant':'smooth'});
  if(action==='identity') window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});
  if(action==='rotate-left')rotateTo((orbitTween?.toYaw??yaw)-.22);
  if(action==='rotate-right')rotateTo((orbitTween?.toYaw??yaw)+.22);
  if(action==='plan')rotateTo(yaw,(orbitTween?.toElevation??elevation)>1.5?.88:Math.PI/2-.001);
  if(action==='reset')rotateTo(-.38,.88);
  requestRender();
}));
$('back-campus').addEventListener('click',()=>returnCampus());
$('cancel-flight').addEventListener('click',()=>returnCampus());
$('skip-flight').addEventListener('click',skipFlight);
$('open-summary').addEventListener('click',()=>quick.showModal());
$('close-summary').addEventListener('click',()=>quick.close());
quick.addEventListener('click',event=>{if(event.target===quick){const r=quick.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)quick.close();}});
$('motion-toggle').addEventListener('click',()=>{reduced=!reduced;motionUI();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches;motionUI();});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!quick.open&&mode!=='campus')returnCampus();});
window.addEventListener('popstate',()=>{const key=location.hash.slice(1);if(locations[key])enterLocation(key,true);else returnCampus(true);});
window.addEventListener('scroll',requestRender,{passive:true});
window.addEventListener('resize',resize);
layer.addEventListener('pointerdown',event=>{
  if((reduced ? progress<=.12 : progress<.9) || mode!=='campus' || event.button!==0) return;
  orbitTween=null;
  dragging={x:event.clientX,yaw,id:event.pointerId};layer.setPointerCapture(event.pointerId);
});
layer.addEventListener('pointermove',event=>{if(dragging){yaw=dragging.yaw+(event.clientX-dragging.x)*.005;requestRender();}});
function endDrag(){dragging=null;}
layer.addEventListener('pointerup',endDrag);layer.addEventListener('pointercancel',endDrag);

function useFallback(message) {
  const wasLeaving=mode==='leaving';
  const activeRoom=wasLeaving?queuedLocation:(selected && mode!=='campus'?selected:null);
  queuedLocation=null;
  disposeRoom();fallback=true; ready=true; mode='campus';flightControls.hidden=true;
  renderer?.dispose(); renderer=null;
  layer.innerHTML='<img src="./assets/campus-plan.svg" alt="校园平面图" style="position:absolute;inset:22% 8% 14%;width:84%;height:64%;object-fit:contain;opacity:.8">';
  $('map-controls').querySelectorAll('button').forEach(b=>{if(b.dataset.action!=='identity')b.disabled=true;});
  $('map-note').textContent=message;
  $('loading-note').hidden=true; resize();
  if(activeRoom)showRoom(activeRoom);else finishCampus();
}
async function init() {
  resize(); motionUI();
  try {
    const response=await fetch('./assets/campus-data.json'); if(!response.ok)throw new Error('Campus data unavailable');
    data=await response.json();
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.localClippingEnabled=true;
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75)); renderer.setClearColor(0x0738a5,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    layer.append(renderer.domElement); createCampus(); ready=true;
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();useFallback('已切换校园平面图，仍可点击标记查看经历。');});
    $('loading-note').hidden=true; resize();
  } catch(error) {
    console.warn('Blueprint campus: flat map fallback.',error.message);
    useFallback('当前使用校园平面图，可点击标记查看经历。');
  }
  const key=location.hash.slice(1); if(locations[key])enterLocation(key,true);
  Object.defineProperty(window,'blueprintDemo',{get:()=>({ready,fallback,mode,selected,progress,phase:progress<=.43?'card-zoom':progress<=.53?'plan-handoff':'campus-unfold',flightProgress:flight?.t,flightDurationMs:flight?.duration,doorAngle:entrance?.doorAngle,orbitYaw:yaw,cameraSpan:camera?camera.top-camera.bottom:null,orbitRadius:campusOrbitRadius,heightScale:campusGroup?.scale.y,buildings:data?.buildings.length,roads:data?.roads.length,drawCalls:renderer?.info.render.calls})});
}
init();
