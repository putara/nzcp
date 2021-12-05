document.addEventListener('DOMContentLoaded', _ => {
  if (!['#home', '#scan', '#about', '#manual'].includes(location.hash)) {
    location.hash = '#home';
  }
});

document.body.addEventListener('click', e => {
  const el = e.target.closest('[data-target]');
  if (el) {
    e.preventDefault();
    location.hash = el.getAttribute('data-target');
  }
});

function $(s) {
  return document.querySelector(s);
}

async function verify(qrcode) {
  function info(data) {
    const {claims} = data;
    const val = path => {
      path = path.split('.');
      let obj = claims;
      for (let i = 0; obj != null && i < path.length; obj = obj[path[i++]]);
      return obj;
    };
    Array.from(document.querySelectorAll('[data-path]')).forEach(e => {
      let x = val(e.getAttribute('data-path'));
      const f = e.getAttribute('data-date');
      if (x && f) {
        const d = new Date(x);
        e.innerHTML = f.replace('$Y', d.getFullYear()).replace('$M', String(d.getMonth() + 101).substring(1)).replace('$D', String(d.getDate() + 100).substring(1));
      } else {
        e.textContent = x || '?';
      }
    });
  }
  function result(status, title, message) {
    const el = $('#result');
    el.classList.remove('error');
    el.classList.remove('pass');
    if (status) {
      el.classList.add(status);
      location.hash = '#result';
    }
    $('#status').textContent = title || '';
    $('#error').textContent = message || '';
  }
  result();
  try {
    const data = decode(qrcode);
    console.log(data);
    info(data);
    await validate(data);
    result('pass', 'Valid', '');
  } catch (e) {
    if (e instanceof VerificationError) {
      result('error', 'Fail', e.message);
    } else {
      console.error(e);
      result('error', 'Error', 'Catastrophic error');
    }
  }
}

$('#verify').addEventListener('click', e => {
  e.preventDefault();
  verify($('#qrcode').value);
});
