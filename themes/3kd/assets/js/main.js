const $sections = document.querySelectorAll('.page-section');
const $background = document.querySelector('#background');
const $container = document.querySelector(".page-wrapper");
const $loader = document.querySelector(".loader");

document.body.classList.add("has-js");

const sections = [];
let currentSection = -1;
const imageRatio = 1.576;
let img1;
let img2;

let app, resources, background, width, height;

const easeInQuart = (x) => {
  return x * x * x * x; // easeInQuart
};

const easeOutQuint = (x) => {
  return 1 - Math.pow(1 - x, 5);
};

const uniforms = {
  u_resolution: null,
  u_mouse: [0, 0],
  u_offset: 0,
  u_progress: 0,
  u_time: 0,
  u_tex1: null,
  u_tex2: null,
  u_hasTex1: 0,
  u_hasTex2: 0,
};

function init() {
  app = new PIXI.Application();
  app.renderer.autoDensity = true;

  $background.appendChild(app.view);

  $sections.forEach((section, key) => {
    const url = section.getAttribute("data-cover");
    const id = "section-" + key;

    const sectionObj = {
      url,
      elmt: section,
      id
    };

    if (url) {
      app.loader.add(id, url);
    }

    sections.push(sectionObj);
  });

  app.loader.add('shader', '/shaders/image_mix.frag');

  app.loader.onProgress.add(onLoadProgress);

  app.loader.load(onAssetsLoaded);
}

function onLoadProgress(context) {
  $loader.style.setProperty('--progress', context.progress / 100);
}

function onAssetsLoaded(loader, _resources) {
  resources = _resources;

  document.body.classList.add("is-ready");

  background = new PIXI.Sprite();

  setDimensions();

  const backgroundFragmentShader = resources['shader'].data;

  const backgroundFilter = new PIXI.Filter(undefined, backgroundFragmentShader, uniforms);
  background.filters = [backgroundFilter];

  app.stage.addChild(background);
}

function tick() {
  app.ticker.add(() => {
    if (!resources)
      return;

    const currentScrollPos = $container.scrollTop;
    const i = parseInt(currentScrollPos / height);
    const progress = (currentScrollPos % height) / height;

    if (currentSection !== i) {
      currentSection = i;
      if (!!sections[i] && !!sections[i].url) {
        img1 = resources["section-" + i].texture;
      } else {
        img1 = null;
      }
      if (!!sections[i + 1] && !!sections[i + 1].url) {
        img2 = resources["section-" + (i + 1)].texture;
      } else {
        img2 = null;
      }
    }

    uniforms.u_time = performance.now() / 1000.0;
    uniforms.u_progress = progress;


    if (img1) {
      uniforms.u_tex1 = img1;
      uniforms.u_hasTex1 = true;
    } else {
      uniforms.u_hasTex1 = false;
    }

    if (img2) {
      uniforms.u_tex2 = img2;
      uniforms.u_hasTex2 = true;
    } else {
      uniforms.u_hasTex2 = false;
    }


    $sections[i].style.setProperty('--progress', 1 - progress);
    if ($sections[i + 1]) {
      $sections[i + 1].style.setProperty('--progress', progress);
    }
  });
}

init();
tick();

function setDimensions () {
  width = $background.clientWidth;
  height = $background.clientHeight;

  const viewportRatio = width / height;

  app.renderer.resize(width, height);

  if (viewportRatio > imageRatio) {
    background.width = width;
    background.height = width / imageRatio;
  } else {
    background.width = height * imageRatio;
    background.height = height;
  }

  background.x = parseInt(app.renderer.width / 2 - background.width / 2);
  background.y = parseInt(app.renderer.height / 2 - background.height / 2);

  uniforms.u_resolution = [background.width, background.height];
  uniforms.u_offset = background.x;
}

function onMouseMove(e) {
  uniforms.u_mouse = [e.clientX, e.clientY];
}

window.addEventListener('resize', setDimensions);
window.addEventListener('mousemove', onMouseMove);
