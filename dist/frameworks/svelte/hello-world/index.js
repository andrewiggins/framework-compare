(function () {
  'use strict';

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function noop() {}

  function run(fn) {
    return fn();
  }

  function blank_object() {
    return Object.create(null);
  }

  function run_all(fns) {
    fns.forEach(run);
  }

  function is_function(thing) {
    return typeof thing === 'function';
  }

  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a && typeof a === 'object' || typeof a === 'function';
  }

  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }

  function detach(node) {
    node.parentNode.removeChild(node);
  }

  function element(name) {
    return document.createElement(name);
  }

  function children(element) {
    return Array.from(element.childNodes);
  }

  var current_component;

  function set_current_component(component) {
    current_component = component;
  }

  var dirty_components = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];

  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }

  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }

  function flush() {
    var seen_callbacks = new Set();

    do {
      // first, call beforeUpdate functions
      // and update components
      while (dirty_components.length) {
        var component = dirty_components.shift();
        set_current_component(component);
        update(component.$$);
      }

      while (binding_callbacks.length) {
        binding_callbacks.shift()();
      } // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...


      while (render_callbacks.length) {
        var callback = render_callbacks.pop();

        if (!seen_callbacks.has(callback)) {
          callback(); // ...so guard against infinite loops

          seen_callbacks.add(callback);
        }
      }
    } while (dirty_components.length);

    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }

    update_scheduled = false;
  }

  function update($$) {
    if ($$.fragment) {
      $$.update($$.dirty);
      run_all($$.before_render);
      $$.fragment.p($$.dirty, $$.ctx);
      $$.dirty = null;
      $$.after_render.forEach(add_render_callback);
    }
  }

  var outroing = new Set();

  function transition_in(block, local) {
    if (block && block.i) {
      outroing["delete"](block);
      block.i(local);
    }
  }

  function mount_component(component, target, anchor) {
    var _component$$$ = component.$$,
        fragment = _component$$$.fragment,
        on_mount = _component$$$.on_mount,
        on_destroy = _component$$$.on_destroy,
        after_render = _component$$$.after_render;
    fragment.m(target, anchor); // onMount happens after the initial afterUpdate. Because
    // afterUpdate callbacks happen in reverse order (inner first)
    // we schedule onMount callbacks before afterUpdate callbacks

    add_render_callback(function () {
      var new_on_destroy = on_mount.map(run).filter(is_function);

      if (on_destroy) {
        on_destroy.push.apply(on_destroy, new_on_destroy);
      } else {
        // Edge case - component was destroyed immediately,
        // most likely as a result of a binding initialising
        run_all(new_on_destroy);
      }

      component.$$.on_mount = [];
    });
    after_render.forEach(add_render_callback);
  }

  function destroy_component(component, detaching) {
    if (component.$$.fragment) {
      run_all(component.$$.on_destroy);
      component.$$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
      // preserve final state?)

      component.$$.on_destroy = component.$$.fragment = null;
      component.$$.ctx = {};
    }
  }

  function make_dirty(component, key) {
    if (!component.$$.dirty) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty = blank_object();
    }

    component.$$.dirty[key] = true;
  }

  function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
    var parent_component = current_component;
    set_current_component(component);
    var props = options.props || {};
    var $$ = component.$$ = {
      fragment: null,
      ctx: null,
      // state
      props: prop_names,
      update: noop,
      not_equal: not_equal$$1,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      before_render: [],
      after_render: [],
      context: new Map(parent_component ? parent_component.$$.context : []),
      // everything else
      callbacks: blank_object(),
      dirty: null
    };
    var ready = false;
    $$.ctx = instance ? instance(component, props, function (key, value) {
      if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
        if ($$.bound[key]) $$.bound[key](value);
        if (ready) make_dirty(component, key);
      }
    }) : props;
    $$.update();
    ready = true;
    run_all($$.before_render);
    $$.fragment = create_fragment($$.ctx);

    if (options.target) {
      if (options.hydrate) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment.l(children(options.target));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment.c();
      }

      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor);
      flush();
    }

    set_current_component(parent_component);
  }

  var SvelteElement;

  if (typeof HTMLElement !== 'undefined') {
    SvelteElement =
    /*#__PURE__*/
    function (_HTMLElement) {
      _inheritsLoose(SvelteElement, _HTMLElement);

      function SvelteElement() {
        var _this;

        _this = _HTMLElement.call(this) || this;

        _this.attachShadow({
          mode: 'open'
        });

        return _this;
      }

      var _proto = SvelteElement.prototype;

      _proto.connectedCallback = function connectedCallback() {
        // @ts-ignore todo: improve typings
        for (var key in this.$$.slotted) {
          // @ts-ignore todo: improve typings
          this.appendChild(this.$$.slotted[key]);
        }
      };

      _proto.attributeChangedCallback = function attributeChangedCallback(attr$$1, _oldValue, newValue) {
        this[attr$$1] = newValue;
      };

      _proto.$destroy = function $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      };

      _proto.$on = function $on(type, callback) {
        // TODO should this delegate to addEventListener?
        var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      };

      _proto.$set = function $set() {// overridden by instance, if it has props
      };

      return SvelteElement;
    }(_wrapNativeSuper(HTMLElement));
  }

  var SvelteComponent =
  /*#__PURE__*/
  function () {
    function SvelteComponent() {}

    var _proto2 = SvelteComponent.prototype;

    _proto2.$destroy = function $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    };

    _proto2.$on = function $on(type, callback) {
      var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return function () {
        var index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      };
    };

    _proto2.$set = function $set() {// overridden by instance, if it has props
    };

    return SvelteComponent;
  }();

  function create_fragment(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        div.textContent = "Hello World!";
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) {
          detach(div);
        }
      }
    };
  }

  var App =
  /*#__PURE__*/
  function (_SvelteComponent) {
    _inheritsLoose(App, _SvelteComponent);

    function App(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, null, create_fragment, safe_not_equal, []);
      return _this;
    }

    return App;
  }(SvelteComponent);

  new App({
    target: document.getElementById("app")
  });

}());
