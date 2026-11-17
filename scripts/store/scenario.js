/**
 * Drives the real popup UI for deterministic screenshots.
 *
 * The popup build is loaded unchanged; query params select a UI state:
 *   scenario=main|emoji|icon|text|upload
 *   theme=dark|light
 *   scope=page|host|domain
 */
(function () {
  var params = new URLSearchParams(location.search);
  var scenario = params.get('scenario') || 'main';
  var labels = { emoji: 'Emoji', icon: 'Icon', text: 'Text', upload: 'Upload' };

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function waitFor(getValue, timeout) {
    var deadline = Date.now() + (timeout || 8000);
    return new Promise(function (resolve) {
      function tick() {
        var value = getValue();
        if (value) {
          resolve(value);
          return;
        }
        if (Date.now() > deadline) {
          resolve(null);
          return;
        }
        setTimeout(tick, 60);
      }
      tick();
    });
  }

  function trigger(label) {
    var nodes = document.querySelectorAll('[data-slot="popover-trigger"]');
    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i].textContent.trim() === label) return nodes[i];
    }
    return null;
  }

  function setInputValue(input, value) {
    var setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    ).set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function chooseFakeFile(input, name) {
    var bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    var file = new File([bytes], name, { type: 'image/png' });
    var transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function run() {
    await waitFor(function () {
      return document.querySelector('#root > *');
    });

    var label = labels[scenario];
    if (!label) {
      finish();
      return;
    }

    var button = await waitFor(function () {
      return trigger(label);
    });
    if (!button) {
      finish();
      return;
    }
    button.click();

    await waitFor(function () {
      return document.querySelector('[data-slot="popover-content"]');
    });

    if (scenario === 'icon') {
      var search = await waitFor(function () {
        return document.querySelector('input[aria-label="Search icons"]');
      });
      if (search) setInputValue(search, params.get('query') || 'arrow');
    }

    if (scenario === 'text') {
      var text = await waitFor(function () {
        return document.querySelector('input[aria-label="Icon text"]');
      });
      if (text) setInputValue(text, params.get('value') || 'YT');
    }

    if (scenario === 'upload') {
      var fileInput = await waitFor(function () {
        return document.querySelector('#picture');
      });
      if (fileInput) chooseFakeFile(fileInput, params.get('file') || 'sunset.png');
    }

    await sleep(1600);
    finish();
  }

  function finish() {
    document.documentElement.setAttribute('data-demo-ready', '1');
    document.title = 'READY';
  }

  run();
})();
