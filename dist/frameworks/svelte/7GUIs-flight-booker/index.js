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

  function add_binding_callback(fn) {
    binding_callbacks.push(fn);
  }

  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }

  function add_flush_callback(fn) {
    flush_callbacks.push(fn);
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
  var outros;

  function transition_in(block, local) {
    if (block && block.i) {
      outroing["delete"](block);
      block.i(local);
    }
  }

  function transition_out(block, local, callback) {
    if (block && block.o) {
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.callbacks.push(function () {
        outroing["delete"](block);

        if (callback) {
          block.d(1);
          callback();
        }
      });
      block.o(local);
    }
  }

  function bind(component, name, callback) {
    if (component.$$.props.indexOf(name) === -1) return;
    component.$$.bound[name] = callback;
    callback(component.$$.ctx[name]);
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

  var oneWayFlight = "one-way";
  var returnFlight = "return";

  function create_fragment(ctx) {
    var div, label, select, option0, t1, option1, t2, dispose;
    return {
      c: function c() {
        div = element("div");
        label = element("label");
        label.textContent = "Trip type";
        select = element("select");
        option0 = element("option");
        t1 = text("one-way flight");
        option1 = element("option");
        t2 = text("return flight");
        attr(label, "class", "form-label");
        attr(label, "for", "trip-type");
        option0.__value = oneWayFlight;
        option0.value = option0.__value;
        option1.__value = returnFlight;
        option1.value = option1.__value;
        if (ctx.tripType === void 0) add_render_callback(function () {
          return ctx.select_change_handler.call(select);
        });
        attr(select, "id", "trip-type");
        attr(select, "class", "form-select");
        attr(div, "class", "form-group");
        dispose = listen(select, "change", ctx.select_change_handler);
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, label);
        append(div, select);
        append(select, option0);
        append(option0, t1);
        append(select, option1);
        append(option1, t2);
        select_option(select, ctx.tripType);
      },
      p: function p(changed, ctx) {
        option0.value = option0.__value;
        option1.value = option1.__value;
        if (changed.tripType) select_option(select, ctx.tripType);
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) {
          detach(div);
        }

        dispose();
      }
    };
  }

  function instance($$self, $$props, $$invalidate) {
    var tripType = $$props.tripType;

    function select_change_handler() {
      tripType = select_value(this);
      $$invalidate('tripType', tripType);
      $$invalidate('returnFlight', returnFlight);
      $$invalidate('oneWayFlight', oneWayFlight);
    }

    $$self.$set = function ($$props) {
      if ('tripType' in $$props) $$invalidate('tripType', tripType = $$props.tripType);
    };

    return {
      tripType: tripType,
      select_change_handler: select_change_handler
    };
  }

  var TripType =
  /*#__PURE__*/
  function (_SvelteComponent) {
    _inheritsLoose(TripType, _SvelteComponent);

    function TripType(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, instance, create_fragment, safe_not_equal, ["tripType"]);
      return _this;
    }

    return TripType;
  }(SvelteComponent);

  function create_if_block(ctx) {
    var p, t;
    return {
      c: function c() {
        p = element("p");
        t = text(ctx.errorMsg);
        attr(p, "class", "form-input-hint");
      },
      m: function m(target, anchor) {
        insert(target, p, anchor);
        append(p, t);
      },
      p: function p(changed, ctx) {
        if (changed.errorMsg) {
          set_data(t, ctx.errorMsg);
        }
      },
      d: function d(detaching) {
        if (detaching) {
          detach(p);
        }
      }
    };
  }

  function create_fragment$1(ctx) {
    var div, label_1, t0, input, t1, div_class_value, dispose;
    var if_block = ctx.errorMsg && create_if_block(ctx);
    return {
      c: function c() {
        div = element("div");
        label_1 = element("label");
        t0 = text(ctx.label);
        input = element("input");
        t1 = space();
        if (if_block) if_block.c();
        attr(label_1, "class", "form-label");
        attr(label_1, "for", ctx.inputId);
        attr(input, "id", ctx.inputId);
        attr(input, "class", "form-input");
        attr(input, "type", "text");
        input.disabled = ctx.disabled;
        attr(div, "class", div_class_value = "form-group " + (ctx.errorMsg ? 'has-error' : ''));
        dispose = listen(input, "input", ctx.input_input_handler);
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, label_1);
        append(label_1, t0);
        append(div, input);
        input.value = ctx.date;
        append(div, t1);
        if (if_block) if_block.m(div, null);
      },
      p: function p(changed, ctx) {
        if (changed.label) {
          set_data(t0, ctx.label);
        }

        if (changed.date && input.value !== ctx.date) input.value = ctx.date;

        if (changed.disabled) {
          input.disabled = ctx.disabled;
        }

        if (ctx.errorMsg) {
          if (if_block) {
            if_block.p(changed, ctx);
          } else {
            if_block = create_if_block(ctx);
            if_block.c();
            if_block.m(div, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }

        if (changed.errorMsg && div_class_value !== (div_class_value = "form-group " + (ctx.errorMsg ? 'has-error' : ''))) {
          attr(div, "class", div_class_value);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) {
          detach(div);
        }

        if (if_block) if_block.d();
        dispose();
      }
    };
  }

  function instance$1($$self, $$props, $$invalidate) {
    var label = $$props.label,
        date = $$props.date,
        errorMsg = $$props.errorMsg,
        _$$props$disabled = $$props.disabled,
        disabled = _$$props$disabled === void 0 ? false : _$$props$disabled;
    var inputId = label + "-date";

    function input_input_handler() {
      date = this.value;
      $$invalidate('date', date);
    }

    $$self.$set = function ($$props) {
      if ('label' in $$props) $$invalidate('label', label = $$props.label);
      if ('date' in $$props) $$invalidate('date', date = $$props.date);
      if ('errorMsg' in $$props) $$invalidate('errorMsg', errorMsg = $$props.errorMsg);
      if ('disabled' in $$props) $$invalidate('disabled', disabled = $$props.disabled);
    };

    return {
      label: label,
      date: date,
      errorMsg: errorMsg,
      disabled: disabled,
      inputId: inputId,
      input_input_handler: input_input_handler
    };
  }

  var DateEntry =
  /*#__PURE__*/
  function (_SvelteComponent) {
    _inheritsLoose(DateEntry, _SvelteComponent);

    function DateEntry(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, instance$1, create_fragment$1, safe_not_equal, ["label", "date", "errorMsg", "disabled"]);
      return _this;
    }

    return DateEntry;
  }(SvelteComponent);

  function create_fragment$2(ctx) {
    var updating_tripType, t0, updating_date, t1, updating_date_1, t2, div, button, t3, current, dispose;

    function triptype_tripType_binding(value) {
      ctx.triptype_tripType_binding.call(null, value);
      updating_tripType = true;
      add_flush_callback(function () {
        return updating_tripType = false;
      });
    }

    var triptype_props = {};

    if (ctx.tripType !== void 0) {
      triptype_props.tripType = ctx.tripType;
    }

    var triptype = new TripType({
      props: triptype_props
    });
    add_binding_callback(function () {
      return bind(triptype, 'tripType', triptype_tripType_binding);
    });

    function dateentry0_date_binding(value_1) {
      ctx.dateentry0_date_binding.call(null, value_1);
      updating_date = true;
      add_flush_callback(function () {
        return updating_date = false;
      });
    }

    var dateentry0_props = {
      label: "Departing",
      errorMsg: ctx.departingError
    };

    if (ctx.departing !== void 0) {
      dateentry0_props.date = ctx.departing;
    }

    var dateentry0 = new DateEntry({
      props: dateentry0_props
    });
    add_binding_callback(function () {
      return bind(dateentry0, 'date', dateentry0_date_binding);
    });

    function dateentry1_date_binding(value_2) {
      ctx.dateentry1_date_binding.call(null, value_2);
      updating_date_1 = true;
      add_flush_callback(function () {
        return updating_date_1 = false;
      });
    }

    var dateentry1_props = {
      label: "Returning",
      errorMsg: ctx.returningError,
      disabled: ctx.tripType == oneWayFlight$1
    };

    if (ctx.returning !== void 0) {
      dateentry1_props.date = ctx.returning;
    }

    var dateentry1 = new DateEntry({
      props: dateentry1_props
    });
    add_binding_callback(function () {
      return bind(dateentry1, 'date', dateentry1_date_binding);
    });
    return {
      c: function c() {
        triptype.$$.fragment.c();
        t0 = space();
        dateentry0.$$.fragment.c();
        t1 = space();
        dateentry1.$$.fragment.c();
        t2 = space();
        div = element("div");
        button = element("button");
        t3 = text("book");
        attr(button, "class", "btn btn-primary");
        button.disabled = ctx.isBookDisabled;
        attr(div, "class", "form-group");
        dispose = listen(button, "click", ctx.bookFlight);
      },
      m: function m(target, anchor) {
        mount_component(triptype, target, anchor);
        insert(target, t0, anchor);
        mount_component(dateentry0, target, anchor);
        insert(target, t1, anchor);
        mount_component(dateentry1, target, anchor);
        insert(target, t2, anchor);
        insert(target, div, anchor);
        append(div, button);
        append(button, t3);
        current = true;
      },
      p: function p(changed, ctx) {
        var triptype_changes = {};

        if (!updating_tripType && changed.tripType) {
          triptype_changes.tripType = ctx.tripType;
        }

        triptype.$set(triptype_changes);
        var dateentry0_changes = {};
        if (changed.departingError) dateentry0_changes.errorMsg = ctx.departingError;

        if (!updating_date && changed.departing) {
          dateentry0_changes.date = ctx.departing;
        }

        dateentry0.$set(dateentry0_changes);
        var dateentry1_changes = {};
        if (changed.returningError) dateentry1_changes.errorMsg = ctx.returningError;
        if (changed.tripType || changed.oneWayFlight) dateentry1_changes.disabled = ctx.tripType == oneWayFlight$1;

        if (!updating_date_1 && changed.returning) {
          dateentry1_changes.date = ctx.returning;
        }

        dateentry1.$set(dateentry1_changes);

        if (!current || changed.isBookDisabled) {
          button.disabled = ctx.isBookDisabled;
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(triptype.$$.fragment, local);
        transition_in(dateentry0.$$.fragment, local);
        transition_in(dateentry1.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(triptype.$$.fragment, local);
        transition_out(dateentry0.$$.fragment, local);
        transition_out(dateentry1.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(triptype, detaching);

        if (detaching) {
          detach(t0);
        }

        destroy_component(dateentry0, detaching);

        if (detaching) {
          detach(t1);
        }

        destroy_component(dateentry1, detaching);

        if (detaching) {
          detach(t2);
          detach(div);
        }

        dispose();
      }
    };
  }

  var oneWayFlight$1 = "one-way";
  var returnFlight$1 = "return";

  function getErrorMessage(date) {
    try {
      validateDate(date);
      return null;
    } catch (error) {
      return error.message;
    }
  }

  function instance$2($$self, $$props, $$invalidate) {
    var departing = today();
    var returning = departing;
    var tripType = oneWayFlight$1;

    function bookFlight() {
      var type = tripType == returnFlight$1 ? "return" : "one-way";
      var message = "You have booked a " + type + " flight, leaving " + departing;

      if (type === "return") {
        message += " and returning " + returning;
      }

      alert(message);
    }

    function triptype_tripType_binding(value) {
      tripType = value;
      $$invalidate('tripType', tripType);
    }

    function dateentry0_date_binding(value_1) {
      departing = value_1;
      $$invalidate('departing', departing);
    }

    function dateentry1_date_binding(value_2) {
      returning = value_2;
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
        if (departingError == null && returningError == null && tripType == returnFlight$1 && returning < departing) {
          $$invalidate('returningError', returningError = "Returning date must be on or after departing date.");
        }
      }

      if ($$dirty.departingError || $$dirty.returningError) {
        $$invalidate('isBookDisabled', isBookDisabled = departingError || returningError);
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
      triptype_tripType_binding: triptype_tripType_binding,
      dateentry0_date_binding: dateentry0_date_binding,
      dateentry1_date_binding: dateentry1_date_binding
    };
  }

  var FlightBooker =
  /*#__PURE__*/
  function (_SvelteComponent) {
    _inheritsLoose(FlightBooker, _SvelteComponent);

    function FlightBooker(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, instance$2, create_fragment$2, safe_not_equal, []);
      return _this;
    }

    return FlightBooker;
  }(SvelteComponent);

  new FlightBooker({
    target: document.getElementById("app")
  });

}());
