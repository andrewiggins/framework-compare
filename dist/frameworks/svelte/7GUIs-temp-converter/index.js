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

  function text(data) {
    return document.createTextNode(data);
  }

  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return function () {
      return node.removeEventListener(event, handler, options);
    };
  }

  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);else node.setAttribute(attribute, value);
  }

  function children(element) {
    return Array.from(element.childNodes);
  }

  var current_component;

  function set_current_component(component) {
    current_component = component;
  }

  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;

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
        binding_callbacks.pop()();
      } // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...


      for (var i = 0; i < render_callbacks.length; i += 1) {
        var callback = render_callbacks[i];

        if (!seen_callbacks.has(callback)) {
          callback(); // ...so guard against infinite loops

          seen_callbacks.add(callback);
        }
      }

      render_callbacks.length = 0;
    } while (dirty_components.length);

    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }

    update_scheduled = false;
  }

  function update($$) {
    if ($$.fragment) {
      $$.update($$.dirty);
      run_all($$.before_update);
      $$.fragment.p($$.dirty, $$.ctx);
      $$.dirty = null;
      $$.after_update.forEach(add_render_callback);
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
        after_update = _component$$$.after_update;
    fragment.m(target, anchor); // onMount happens before the initial afterUpdate

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
    after_update.forEach(add_render_callback);
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

  function init(component, options, instance, create_fragment, not_equal, prop_names) {
    var parent_component = current_component;
    set_current_component(component);
    var props = options.props || {};
    var $$ = component.$$ = {
      fragment: null,
      ctx: null,
      // state
      props: prop_names,
      update: noop,
      not_equal: not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      before_update: [],
      after_update: [],
      context: new Map(parent_component ? parent_component.$$.context : []),
      // everything else
      callbacks: blank_object(),
      dirty: null
    };
    var ready = false;
    $$.ctx = instance ? instance(component, props, function (key, ret, value) {
      if (value === void 0) {
        value = ret;
      }

      if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
        if ($$.bound[key]) $$.bound[key](value);
        if (ready) make_dirty(component, key);
      }

      return ret;
    }) : props;
    $$.update();
    ready = true;
    run_all($$.before_update);
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

      var _proto2 = SvelteElement.prototype;

      _proto2.connectedCallback = function connectedCallback() {
        // @ts-ignore todo: improve typings
        for (var key in this.$$.slotted) {
          // @ts-ignore todo: improve typings
          this.appendChild(this.$$.slotted[key]);
        }
      };

      _proto2.attributeChangedCallback = function attributeChangedCallback(attr, _oldValue, newValue) {
        this[attr] = newValue;
      };

      _proto2.$destroy = function $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      };

      _proto2.$on = function $on(type, callback) {
        // TODO should this delegate to addEventListener?
        var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      };

      _proto2.$set = function $set() {// overridden by instance, if it has props
      };

      return SvelteElement;
    }(_wrapNativeSuper(HTMLElement));
  }

  var SvelteComponent =
  /*#__PURE__*/
  function () {
    function SvelteComponent() {}

    var _proto3 = SvelteComponent.prototype;

    _proto3.$destroy = function $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    };

    _proto3.$on = function $on(type, callback) {
      var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return function () {
        var index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      };
    };

    _proto3.$set = function $set() {// overridden by instance, if it has props
    };

    return SvelteComponent;
  }();

  function create_fragment(ctx) {
    var input0, t0, input1, t1, dispose;
    return {
      c: function c() {
        input0 = element("input");
        t0 = text("\r\n°c =\r\n");
        input1 = element("input");
        t1 = text("\r\n°f");
        input0.value = ctx.c;
        attr(input0, "type", "number");
        input1.value = ctx.f;
        attr(input1, "type", "number");
        dispose = [listen(input0, "input", ctx.input_handler), listen(input1, "input", ctx.input_handler_1)];
      },
      m: function m(target, anchor) {
        insert(target, input0, anchor);
        insert(target, t0, anchor);
        insert(target, input1, anchor);
        insert(target, t1, anchor);
      },
      p: function p(changed, ctx) {
        if (changed.c) {
          input0.value = ctx.c;
        }

        if (changed.f) {
          input1.value = ctx.f;
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) {
          detach(input0);
          detach(t0);
          detach(input1);
          detach(t1);
        }

        run_all(dispose);
      }
    };
  }

  function instance($$self, $$props, $$invalidate) {
    var c = null;
    var f = null;

    function setBothFromC(value) {
      $$invalidate('c', c = +value);
      $$invalidate('f', f = +(32 + 9 / 5 * c).toFixed(1));
    }

    function setBothFromF(value) {
      $$invalidate('f', f = +value);
      $$invalidate('c', c = +(5 / 9 * (f - 32)).toFixed(1));
    }

    var input_handler = function input_handler(e) {
      return setBothFromC(e.target.value);
    };

    var input_handler_1 = function input_handler_1(e) {
      return setBothFromF(e.target.value);
    };

    return {
      c: c,
      f: f,
      setBothFromC: setBothFromC,
      setBothFromF: setBothFromF,
      input_handler: input_handler,
      input_handler_1: input_handler_1
    };
  }

  var TempConv =
  /*#__PURE__*/
  function (_SvelteComponent) {
    _inheritsLoose(TempConv, _SvelteComponent);

    function TempConv(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, instance, create_fragment, safe_not_equal, []);
      return _this;
    }

    return TempConv;
  }(SvelteComponent);

  new TempConv({
    target: document.getElementById("app")
  });

}());
