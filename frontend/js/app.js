const designState = {
  top: 'basic',
  bottom: 'skirt',
  sleeves: 'short',
  collar: 'round',
  colour: '#b96b61',
  fabric: 'cotton',
  pattern: 'solid',
  croquis: 'female',
  view: 'front'
};

const croquisAssets = {
  female: 'assets/croquis/female-croquis.webp',
  male: 'assets/croquis/male-croquis.avif'
};

const garmentAssets = {
  top: 'assets/svg/tops/top-{value}.svg',
  bottom: 'assets/svg/bottoms/bottom-{value}.svg',
  sleeves: 'assets/svg/sleeves/sleeve-{value}.svg',
  collar: 'assets/svg/collars/collar-{value}.svg'
};

function getSelectedLabel(control) {
  return control.options[control.selectedIndex].textContent;
}

function updateCroquis() {
  const croquis = document.querySelector('#croquis-base');
  if (croquis) {
    croquis.setAttribute('href', croquisAssets[designState.croquis]);
  }
}

function applyAppearance(preview) {
  preview.setAttribute('class', `costume-preview fabric-${designState.fabric}`);
  preview.style.setProperty('--garment-color', designState.colour);
  preview.style.setProperty('--pattern-detail', designState.colour);

  const fill = designState.pattern === 'solid'
    ? designState.colour
    : `url(#pattern-${designState.pattern})`;

  preview.querySelectorAll('.garment-layer [fill]').forEach((shape) => {
    if (shape.getAttribute('fill') !== 'none') {
      shape.setAttribute('fill', fill);
    }
    shape.setAttribute('stroke', '#5e5752');
  });
}

async function updateGarmentLayer(layerName, value, renderNumber) {
  const layer = document.querySelector(`[data-layer="${layerName}"]`);
  const assetPath = garmentAssets[layerName].replace('{value}', value);

  try {
    const response = await fetch(assetPath);
    if (!response.ok) {
      throw new Error(`Unable to load ${assetPath}`);
    }

    const svgText = await response.text();
    const svgDocument = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const sourceSvg = svgDocument.documentElement;

    if (!sourceSvg || sourceSvg.nodeName.toLowerCase() !== 'svg') {
      throw new Error(`Invalid SVG asset: ${assetPath}`);
    }

    const fragment = document.createDocumentFragment();
    Array.from(sourceSvg.childNodes).forEach((node) => {
      fragment.appendChild(document.importNode(node, true));
    });

    if (renderNumber !== previewRenderNumber) {
      return;
    }

    layer.replaceChildren(fragment);
  } catch (error) {
    if (renderNumber === previewRenderNumber) {
      layer.replaceChildren();
      const message = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      message.setAttribute('x', '120');
      message.setAttribute('y', '180');
      message.setAttribute('text-anchor', 'middle');
      message.setAttribute('class', 'layer-error');
      message.textContent = 'Layer unavailable';
      layer.appendChild(message);
    }
    console.error(error);
  }
}

function updatePreviewStatus(controls) {
  const status = document.querySelector('#preview-status');
  if (!status) {
    return;
  }

  const values = [
    `Top: ${getSelectedLabel(controls.top)}`,
    `Bottom: ${getSelectedLabel(controls.bottom)}`,
    `Sleeves: ${getSelectedLabel(controls.sleeves)}`,
    `Collar: ${getSelectedLabel(controls.collar)}`
  ];

  status.replaceChildren(...values.map((value) => {
    const item = document.createElement('span');
    item.textContent = value;
    return item;
  }));
}

async function updatePreview(controls) {
  const preview = document.querySelector('#costume-preview');
  if (!preview) {
    return;
  }

  const renderNumber = ++previewRenderNumber;
  applyAppearance(preview);
  updatePreviewStatus(controls);

  await Promise.all([
    updateGarmentLayer('bottom', designState.bottom, renderNumber),
    updateGarmentLayer('top', designState.top, renderNumber),
    updateGarmentLayer('sleeves', designState.sleeves, renderNumber),
    updateGarmentLayer('collar', designState.collar, renderNumber)
  ]);

  if (renderNumber === previewRenderNumber) {
    applyAppearance(preview);
  }
}

function handleSelectionChange(event, controls) {
  const { name, value } = event.target;
  designState[name] = value;

  if (name === 'croquis') {
    updateCroquis();
    return;
  }

  if (name === 'colour') {
    applyAppearance(document.querySelector('#costume-preview'));
    updatePreviewStatus(controls);
    return;
  }

  if (name === 'fabric' || name === 'pattern') {
    applyAppearance(document.querySelector('#costume-preview'));
    updatePreviewStatus(controls);
    return;
  }

  updatePreview(controls);
}

let previewRenderNumber = 0;

document.addEventListener('DOMContentLoaded', () => {
  const frontendStatus = document.querySelector('#frontend-status');
  if (frontendStatus) {
    frontendStatus.textContent = 'Frontend JavaScript loaded.';
  }

  const controlsForm = document.querySelector('#design-controls');
  if (!controlsForm) {
    return;
  }

  const controls = {
    top: controlsForm.elements.top,
    bottom: controlsForm.elements.bottom,
    sleeves: controlsForm.elements.sleeves,
    collar: controlsForm.elements.collar,
    colour: controlsForm.elements.colour,
    fabric: controlsForm.elements.fabric,
    pattern: controlsForm.elements.pattern,
    croquis: controlsForm.elements.croquis
  };

  Object.entries(controls).forEach(([name, control]) => {
    control.value = designState[name];
    control.addEventListener('change', (event) => handleSelectionChange(event, controls));
  });

  updateCroquis();
  updatePreview(controls);
});