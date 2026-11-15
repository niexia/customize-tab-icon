/**
 * Chrome extension API mock for the store-screenshot harness.
 *
 * The real popup bundle is loaded unchanged; this script only supplies the
 * handful of extension APIs it talks to. Nothing here ships in the extension.
 */
(function () {
  var params = new URLSearchParams(location.search);
  var theme = params.get('theme') === 'light' ? 'light' : 'dark';
  var scope = params.get('scope') === 'domain' ? 'domain' : 'page';

  localStorage.setItem('changicon-theme', theme);

  var ICON =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">' +
        '<rect width="128" height="128" rx="28" fill="#ffffff"/>' +
        '<g fill="none" stroke="#111" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="38" cy="38" r="17"/><circle cx="38" cy="38" r="5" fill="#111"/>' +
        '<path d="M26 40c3 7 21 7 24 0"/><circle cx="90" cy="38" r="17"/><circle cx="90" cy="38" r="8"/>' +
        '<rect x="24" y="70" width="36" height="28" rx="4"/><path d="M32 78h.01M40 78h.01M48 78h.01M32 86h.01M40 86h.01M48 86h.01M32 92h20"/>' +
        '<rect x="72" y="70" width="32" height="28" rx="4"/><circle cx="82" cy="79" r="4"/><path d="M72 94l10-10 8 8 6-6 8 8"/></g></svg>',
    );

  var ORIGINAL_ICON =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">' +
        '<rect width="32" height="32" rx="8" fill="#6366f1"/>' +
        '<path d="M16 7a9 9 0 100 18 9 9 0 000-18zm0 3a6 6 0 016 6c0 2-1 3-2.5 4.3-.8.7-1 1.2-1 2.2h-3c0-2 .6-3 2-4.2 1-.8 1.5-1.4 1.5-2.3a3 3 0 10-6 0h-3a6 6 0 016-6z" fill="#fff"/>' +
        '</svg>',
    );

  var initial = {
    'changicon-theme': theme,
    'changicon-background': 'white',
    'changicon-scope': scope,
  };

  // The popup shows the effective icon for https://example.com/.
  if (scope === 'domain') {
    initial['icon-domain:example.com'] = ICON;
    initial['icon-original-domain:example.com'] = ORIGINAL_ICON;
  } else {
    initial['icon:example.com/'] = ICON;
    initial['icon-original:example.com/'] = ORIGINAL_ICON;
  }

  var data = new Map(Object.entries(initial));
  var storageListeners = [];

  function pick(keys) {
    if (keys === null || keys === undefined) {
      var all = {};
      data.forEach(function (value, key) {
        all[key] = value;
      });
      return all;
    }

    if (typeof keys === 'string') {
      var one = {};
      if (data.has(keys)) one[keys] = data.get(keys);
      return one;
    }

    if (Array.isArray(keys)) {
      var many = {};
      keys.forEach(function (key) {
        if (data.has(key)) many[key] = data.get(key);
      });
      return many;
    }

    var merged = {};
    Object.keys(keys).forEach(function (key) {
      merged[key] = data.has(key) ? data.get(key) : keys[key];
    });
    return merged;
  }

  function emit(changes) {
    storageListeners.forEach(function (listener) {
      listener(changes, 'local');
    });
  }

  function finish(result, callback) {
    if (typeof callback === 'function') {
      callback(result);
      return undefined;
    }
    return Promise.resolve(result);
  }

  function makeEventTarget() {
    var listeners = [];
    return {
      addListener: function (listener) {
        listeners.push(listener);
      },
      removeListener: function (listener) {
        var index = listeners.indexOf(listener);
        if (index !== -1) listeners.splice(index, 1);
      },
      hasListener: function (listener) {
        return listeners.indexOf(listener) !== -1;
      },
    };
  }

  var area = {
    get: function (keys, callback) {
      if (typeof keys === 'function') {
        callback = keys;
        keys = null;
      }
      return finish(pick(keys), callback);
    },
    set: function (items, callback) {
      var changes = {};
      Object.keys(items).forEach(function (key) {
        var oldValue = data.get(key);
        data.set(key, items[key]);
        changes[key] =
          oldValue === undefined
            ? { newValue: items[key] }
            : { oldValue: oldValue, newValue: items[key] };
      });
      emit(changes);
      return finish(undefined, callback);
    },
    remove: function (keys, callback) {
      var list = Array.isArray(keys) ? keys : [keys];
      var changes = {};
      list.forEach(function (key) {
        if (data.has(key)) {
          changes[key] = { oldValue: data.get(key) };
          data.delete(key);
        }
      });
      emit(changes);
      return finish(undefined, callback);
    },
    clear: function (callback) {
      var changes = {};
      data.forEach(function (value, key) {
        changes[key] = { oldValue: value };
      });
      data.clear();
      emit(changes);
      return finish(undefined, callback);
    },
    onChanged: makeEventTarget(),
  };

  var tabs = [
    {
      id: 1,
      active: true,
      url: 'https://example.com/',
      title: 'Example',
      favIconUrl: ORIGINAL_ICON,
    },
  ];

  window.chrome = {
    runtime: {
      id: 'mock-changicon',
      getManifest: function () {
        return {
          manifest_version: 3,
          name: 'Changicon',
          content_scripts: [{ matches: ['*://*/*'], js: ['content-scripts/content.js'] }],
        };
      },
      getURL: function (path) {
        return path;
      },
      sendMessage: function (message, callback) {
        if (typeof callback === 'function') {
          callback(true);
          return undefined;
        }
        return Promise.resolve(true);
      },
      onMessage: makeEventTarget(),
      lastError: undefined,
    },
    tabs: {
      query: function () {
        return Promise.resolve(tabs.slice());
      },
      sendMessage: function () {
        return Promise.resolve(true);
      },
    },
    scripting: {
      executeScript: function () {
        return Promise.resolve([]);
      },
    },
    storage: {
      local: area,
      session: area,
      onChanged: makeEventTarget(),
    },
  };
})();
