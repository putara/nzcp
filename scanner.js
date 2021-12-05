QrScanner.WORKER_PATH = './qr-scanner/qr-scanner-worker.min.js';

let scanner, qrCanvasEl, cameraPopulated = false;

async function updateFlashState() {
  const hasFlash = await scanner.hasFlash();
  $('#scan').classList.toggle('hasFlash', hasFlash);
}

async function startScanner() {
  function gotQrCode(result) {
    console.log(result);
    stopScanner();
    verify(result);
  }

  function gotError(error) {
  }

  const hasCamera = await QrScanner.hasCamera();
  if (!hasCamera) {
    $('#scan').classList.add('error');
    return;
  }

  if (!scanner) {
    scanner = new QrScanner($('#qr-video'), gotQrCode, gotError);
  }

  await scanner.start();
  updateFlashState();
  qrCanvasEl = scanner.$canvas;
  $('#preview').appendChild(scanner.$canvas);

  if (!cameraPopulated) {
    cameraPopulated = true;
    $('#scan').classList.add('available');
    const camerasEl = $('#cameras');
    const cameras = await QrScanner.listCameras(true);
    for (let camera of cameras) {
      const option = document.createElement('option');
      option.value = camera.id;
      option.text = camera.label;
      camerasEl.add(option);
    }
  }
}

async function stopScanner() {
  if (scanner) {
    scanner.stop();
    scanner = null;
  }
  if (qrCanvasEl) {
    qrCanvasEl.remove(qrCanvasEl);
    qrCanvasEl = null;
  }
}

async function pageChanged() {
  console.log(location.hash);
  if (location.hash == '#scan' && !$('#scan').classList.contains('error')) {
    startScanner();
  } else {
    stopScanner();
  }
}

pageChanged();
window.addEventListener('hashchange', pageChanged);

$('#flash').addEventListener('click', async e => {
  e.preventDefault();
  await scanner.toggleFlash();
  $('#scan').classList.toggle('flashOn', scanner.isFlashOn());
});

$('#cameras').addEventListener('change', async e => {
  await scanner.setCamera(e.target.value);
  updateFlashState();
});
