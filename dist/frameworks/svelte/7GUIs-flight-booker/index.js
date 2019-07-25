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

  function append(target, node) {
    target.appendChild(node);
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

  function space() {
    return text(' ');
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

  function set_data(text, data) {
    data = '' + data;
    if (text.data !== data) text.data = data;
  }

  function select_option(select, value) {
    for (var i = 0; i < select.options.length; i += 1) {
      var option = select.options[i];

      if (option.__value === value) {
        option.selected = true;
        return;
      }
    }
  }

  function select_value(select) {
    var selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
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

  function today() {
    var fullDate = new Date();
    var month = fullDate.getMonth() + 1;
    var date = fullDate.getDate();
    return [fullDate.getFullYear(), month < 10 ? "0" + month : month, date < 10 ? "0" + date : date].join("-");
  }
  var validDate = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
  /**
   * @param {string} date
   */

  function validateDate(date) {
    if (date == null) {
      throw new Error("Invalid date. Date must be in the format of YYYY-MM-DD");
    }

    var match = date.match(validDate);

    if (match == null) {
      throw new Error("Invalid date. Date must be in the format of YYYY-MM-DD");
    }

    var year = parseInt(match[1]);
    var month = parseInt(match[2]);
    var day = parseInt(match[3]);

    if (day < 1 || day > 31) {
      throw new Error("Invalid date. Date must be between 1-31.");
    }

    if (month < 1 || month > 12) {
      throw new Error("Invalid month. Month must be between 1-12.");
    }

    var parsedDate = new Date(date);

    if (day !== parsedDate.getUTCDate()) {
      throw new Error("Invalid date. Date isn't correct.");
    }

    if (month !== parsedDate.getUTCMonth() + 1) {
      throw new Error("Invalid date. Month isn't correct.");
    }

    if (year !== parsedDate.getUTCFullYear()) {
      throw new Error("Invalid date. Year isn't correct.");
    }
  }

  function create_if_block_1(ctx) {
    var p, t;
    return {
      c: function c() {
        p = element("p");
        t = text(ctx.departingError);
        attr(p, "class", "form-input-hint");
      },
      m: function m(target, anchor) {
        insert(target, p, anchor);
        append(p, t);
      },
      p: function p(changed, ctx) {
        if (changed.departingError) {
          set_data(t, ctx.departingError);
        }
      },
      d: function d(detaching) {
        if (detaching) {
          detach(p);
        }
      }
    };
  } // (80:1) {#if returningError}


  function create_if_block(ctx) {
    var p, t;
    return {
      c: function c() {
        p = element("p");
        t = text(ctx.returningError);
        attr(p, "class", "form-input-hint");
      },
      m: function m(target, anchor) {
        insert(target, p, anchor);
        append(p, t);
      },
      p: function p(changed, ctx) {
        if (changed.returningError) {
          set_data(t, ctx.returningError);
        }
      },
      d: function d(detaching) {
        if (detaching) {
          detach(p);
        }
      }
    };
  }

  function create_fragment(ctx) {
    var div0, label0, select, option0, t1, option1, t2, t3, div1, label1, input0, t5, div1_class_value, t6, div2, label2, input1, input1_disabled_value, t8, div2_class_value, t9, div3, button, t10, dispose;
    var if_block0 = ctx.departingError && create_if_block_1(ctx);
    var if_block1 = ctx.returningError && create_if_block(ctx);
    return {
      c: function c() {
        div0 = element("div");
        label0 = element("label");
        label0.textContent = "Trip type";
        select = element("select");
        option0 = element("option");
        t1 = text("one-way flight");
        option1 = element("option");
        t2 = text("return flight");
        t3 = space();
        div1 = element("div");
        label1 = element("label");
        label1.textContent = "Departing";
        input0 = element("input");
        t5 = space();
        if (if_block0) if_block0.c();
        t6 = space();
        div2 = element("div");
        label2 = element("label");
        label2.textContent = "Returning";
        input1 = element("input");
        t8 = space();
        if (if_block1) if_block1.c();
        t9 = space();
        div3 = element("div");
        button = element("button");
        t10 = text("book");
        attr(label0, "class", "form-label");
        attr(label0, "for", "trip-type");
        option0.__value = oneWayFlight;
        option0.value = option0.__value;
        option1.__value = returnFlight;
        option1.value = option1.__value;
        if (ctx.tripType === void 0) add_render_callback(function () {
          return ctx.select_change_handler.call(select);
        });
        attr(select, "id", "trip-type");
        attr(select, "class", "form-select");
        attr(div0, "class", "form-group");
        attr(label1, "class", "form-label");
        attr(label1, "for", "departing-date");
        attr(input0, "id", "departing-date");
        attr(input0, "class", "form-input");
        attr(input0, "type", "text");
        attr(div1, "class", div1_class_value = "form-group " + (ctx.departingError ? 'has-error' : ''));
        attr(label2, "class", "form-label");
        attr(label2, "for", "returning-date");
        attr(input1, "id", "returning-date");
        attr(input1, "class", "form-input");
        attr(input1, "type", "text");
        input1.disabled = input1_disabled_value = ctx.tripType == oneWayFlight;
        attr(div2, "class", div2_class_value = "form-group " + (ctx.returningError ? 'has-error' : ''));
        attr(button, "class", "btn btn-primary");
        button.disabled = ctx.isBookDisabled;
        attr(div3, "class", "form-group");
        dispose = [listen(select, "change", ctx.select_change_handler), listen(input0, "input", ctx.input0_input_handler), listen(input1, "input", ctx.input1_input_handler), listen(button, "click", ctx.bookFlight)];
      },
      m: function m(target, anchor) {
        insert(target, div0, anchor);
        append(div0, label0);
        append(div0, select);
        append(select, option0);
        append(option0, t1);
        append(select, option1);
        append(option1, t2);
        select_option(select, ctx.tripType);
        insert(target, t3, anchor);
        insert(target, div1, anchor);
        append(div1, label1);
        append(div1, input0);
        input0.value = ctx.departing;
        append(div1, t5);
        if (if_block0) if_block0.m(div1, null);
        insert(target, t6, anchor);
        insert(target, div2, anchor);
        append(div2, label2);
        append(div2, input1);
        input1.value = ctx.returning;
        append(div2, t8);
        if (if_block1) if_block1.m(div2, null);
        insert(target, t9, anchor);
        insert(target, div3, anchor);
        append(div3, button);
        append(button, t10);
      },
      p: function p(changed, ctx) {
        option0.value = option0.__value;
        option1.value = option1.__value;
        if (changed.tripType) select_option(select, ctx.tripType);
        if (changed.departing && input0.value !== ctx.departing) input0.value = ctx.departing;

        if (ctx.departingError) {
          if (if_block0) {
            if_block0.p(changed, ctx);
          } else {
            if_block0 = create_if_block_1(ctx);
            if_block0.c();
            if_block0.m(div1, null);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (changed.departingError && div1_class_value !== (div1_class_value = "form-group " + (ctx.departingError ? 'has-error' : ''))) {
          attr(div1, "class", div1_class_value);
        }

        if (changed.returning && input1.value !== ctx.returning) input1.value = ctx.returning;

        if (changed.tripType && input1_disabled_value !== (input1_disabled_value = ctx.tripType == oneWayFlight)) {
          input1.disabled = input1_disabled_value;
        }

        if (ctx.returningError) {
          if (if_block1) {
            if_block1.p(changed, ctx);
          } else {
            if_block1 = create_if_block(ctx);
            if_block1.c();
            if_block1.m(div2, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        if (changed.returningError && div2_class_value !== (div2_class_value = "form-group " + (ctx.returningError ? 'has-error' : ''))) {
          attr(div2, "class", div2_class_value);
        }

        if (changed.isBookDisabled) {
          button.disabled = ctx.isBookDisabled;
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) {
          detach(div0);
          detach(t3);
          detach(div1);
        }

        if (if_block0) if_block0.d();

        if (detaching) {
          detach(t6);
          detach(div2);
        }

        if (if_block1) if_block1.d();

        if (detaching) {
          detach(t9);
          detach(div3);
        }

        run_all(dispose);
      }
    };
  }

  var oneWayFlight = "one-way";
  var returnFlight = "return";

  function getErrorMessage(date) {
    try {
      validateDate(date);
      return null;
    } catch (error) {
      return error.message;
    }
  }

  function instance($$self, $$props, $$invalidate) {
    var departing = today();
    var returning = departing;
    var tripType = oneWayFlight;

    function bookFlight() {
      var type = tripType == returnFlight ? "return" : "one-way";
      var message = "You have booked a " + type + " flight, leaving " + departing;

      if (type === "return") {
        message += " and returning " + returning;
      }

      alert(message);
    }

    function select_change_handler() {
      tripType = select_value(this);
      $$invalidate('tripType', tripType);
      $$invalidate('returnFlight', returnFlight);
      $$invalidate('oneWayFlight', oneWayFlight);
    }

    function input0_input_handler() {
      departing = this.value;
      $$invalidate('departing', departing);
    }

    function input1_input_handler() {
      returning = this.value;
      $$invalidate('returning', returning);
    }

    var departingError, returningError, isBookDisabled;

    $$self.$$.update = function ($$dirty) {
      if ($$dirty === void 0) {
        $$dirty = {
          departing: 1,
          returning: 1,
          departingError: 1,
          returningError: 1,
          tripType: 1
        };
      }

      if ($$dirty.departing) {
        $$invalidate('departingError', departingError = getErrorMessage(departing));
      }

      if ($$dirty.returning) {
        $$invalidate('returningError', returningError = getErrorMessage(returning));
      }

      if ($$dirty.departingError || $$dirty.returningError || $$dirty.tripType || $$dirty.returning || $$dirty.departing) {
        if (departingError == null && returningError == null && tripType == returnFlight && returning < departing) {
          $$invalidate('returningError', returningError = "Returning date must be on or after departing date.");
        }
      }

      if ($$dirty.departingError || $$dirty.returningError || $$dirty.tripType || $$dirty.returning || $$dirty.departing) {
        $$invalidate('isBookDisabled', isBookDisabled = departingError || returningError || tripType == returnFlight && returning < departing);
      }
    };

    return {
      departing: departing,
      returning: returning,
      tripType: tripType,
      bookFlight: bookFlight,
      departingError: departingError,
      returningError: returningError,
      isBookDisabled: isBookDisabled,
      select_change_handler: select_change_handler,
      input0_input_handler: input0_input_handler,
      input1_input_handler: input1_input_handler
    };
  }

  var FlightBooker =
  /*#__PURE__*/
  function (_SvelteComponent) {
    _inheritsLoose(FlightBooker, _SvelteComponent);

    function FlightBooker(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, instance, create_fragment, safe_not_equal, []);
      return _this;
    }

    return FlightBooker;
  }(SvelteComponent);

  new FlightBooker({
    target: document.getElementById("app")
  });

}());
