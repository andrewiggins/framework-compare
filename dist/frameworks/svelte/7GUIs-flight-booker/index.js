(function () {
  'use strict';

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
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

  function is_empty(obj) {
    return Object.keys(obj).length === 0;
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
    if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }

  function children(element) {
    return Array.from(element.childNodes);
  }

  function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data) text.data = data;
  }

  function set_input_value(input, value) {
    input.value = value == null ? '' : value;
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

  function add_flush_callback(fn) {
    flush_callbacks.push(fn);
  }

  var flushing = false;
  var seen_callbacks = new Set();

  function flush() {
    if (flushing) return;
    flushing = true;

    do {
      // first, call beforeUpdate functions
      // and update components
      for (var i = 0; i < dirty_components.length; i += 1) {
        var component = dirty_components[i];
        set_current_component(component);
        update(component.$$);
      }

      set_current_component(null);
      dirty_components.length = 0;

      while (binding_callbacks.length) {
        binding_callbacks.pop()();
      } // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...


      for (var _i = 0; _i < render_callbacks.length; _i += 1) {
        var callback = render_callbacks[_i];

        if (!seen_callbacks.has(callback)) {
          // ...so guard against infinite loops
          seen_callbacks.add(callback);
          callback();
        }
      }

      render_callbacks.length = 0;
    } while (dirty_components.length);

    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }

    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
  }

  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      var dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
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

  function transition_out(block, local, detach, callback) {
    if (block && block.o) {
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.c.push(function () {
        outroing["delete"](block);

        if (callback) {
          if (detach) block.d(1);
          callback();
        }
      });
      block.o(local);
    }
  }

  function bind(component, name, callback) {
    var index = component.$$.props[name];

    if (index !== undefined) {
      component.$$.bound[index] = callback;
      callback(component.$$.ctx[index]);
    }
  }

  function create_component(block) {
    block && block.c();
  }

  function mount_component(component, target, anchor) {
    var _component$$$ = component.$$,
        fragment = _component$$$.fragment,
        on_mount = _component$$$.on_mount,
        on_destroy = _component$$$.on_destroy,
        after_update = _component$$$.after_update;
    fragment && fragment.m(target, anchor); // onMount happens before the initial afterUpdate

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
    var $$ = component.$$;

    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
      // preserve final state?)

      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }

  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }

    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }

  function init(component, options, instance, create_fragment, not_equal, props, dirty) {
    if (dirty === void 0) {
      dirty = [-1];
    }

    var parent_component = current_component;
    set_current_component(component);
    var prop_values = options.props || {};
    var $$ = component.$$ = {
      fragment: null,
      ctx: null,
      // state
      props: props,
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
      dirty: dirty,
      skip_bound: false
    };
    var ready = false;
    $$.ctx = instance ? instance(component, prop_values, function (i, ret) {
      var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;

      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }

      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update); // `false` as a special case of no DOM component

    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

    if (options.target) {
      if (options.hydrate) {
        var nodes = children(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }

      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor);
      flush();
    }

    set_current_component(parent_component);
  }
  /**
   * Base class for Svelte components. Used when dev=false.
   */


  var SvelteComponent = /*#__PURE__*/function () {
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

    _proto3.$set = function $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
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
    var div;
    var label;
    var select;
    var option0;
    var t1;
    var option1;
    var t2;
    var mounted;
    var dispose;
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
        attr(select, "id", "trip-type");
        attr(select, "class", "form-select");
        if (
        /*tripType*/
        ctx[0] === void 0) add_render_callback(function () {
          return (
            /*select_change_handler*/
            ctx[1].call(select)
          );
        });
        attr(div, "class", "form-group");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, label);
        append(div, select);
        append(select, option0);
        append(option0, t1);
        append(select, option1);
        append(option1, t2);
        select_option(select,
        /*tripType*/
        ctx[0]);

        if (!mounted) {
          dispose = listen(select, "change",
          /*select_change_handler*/
          ctx[1]);
          mounted = true;
        }
      },
      p: function p(ctx, _ref) {
        var dirty = _ref[0];

        if (dirty &
        /*tripType, returnFlight, oneWayFlight*/
        1) {
          select_option(select,
          /*tripType*/
          ctx[0]);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
        mounted = false;
        dispose();
      }
    };
  }

  function instance($$self, $$props, $$invalidate) {
    var tripType = $$props.tripType;

    function select_change_handler() {
      tripType = select_value(this);
      $$invalidate(0, tripType);
    }

    $$self.$$set = function ($$props) {
      if ("tripType" in $$props) $$invalidate(0, tripType = $$props.tripType);
    };

    return [tripType, select_change_handler];
  }

  var TripType = /*#__PURE__*/function (_SvelteComponent) {
    _inheritsLoose(TripType, _SvelteComponent);

    function TripType(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, instance, create_fragment, safe_not_equal, {
        tripType: 0
      });
      return _this;
    }

    return TripType;
  }(SvelteComponent);

  function create_if_block(ctx) {
    var p;
    var t;
    return {
      c: function c() {
        p = element("p");
        t = text(
        /*errorMsg*/
        ctx[2]);
        attr(p, "class", "form-input-hint");
      },
      m: function m(target, anchor) {
        insert(target, p, anchor);
        append(p, t);
      },
      p: function p(ctx, dirty) {
        if (dirty &
        /*errorMsg*/
        4) set_data(t,
        /*errorMsg*/
        ctx[2]);
      },
      d: function d(detaching) {
        if (detaching) detach(p);
      }
    };
  }

  function create_fragment$1(ctx) {
    var div;
    var label_1;
    var t0;
    var input;
    var t1;
    var div_class_value;
    var mounted;
    var dispose;
    var if_block =
    /*errorMsg*/
    ctx[2] && create_if_block(ctx);
    return {
      c: function c() {
        div = element("div");
        label_1 = element("label");
        t0 = text(
        /*label*/
        ctx[1]);
        input = element("input");
        t1 = space();
        if (if_block) if_block.c();
        attr(label_1, "class", "form-label");
        attr(label_1, "for",
        /*inputId*/
        ctx[4]);
        attr(input, "id",
        /*inputId*/
        ctx[4]);
        attr(input, "class", "form-input");
        attr(input, "type", "text");
        input.disabled =
        /*disabled*/
        ctx[3];
        attr(div, "class", div_class_value = "form-group " + (
        /*errorMsg*/
        ctx[2] ? "has-error" : ""));
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, label_1);
        append(label_1, t0);
        append(div, input);
        set_input_value(input,
        /*date*/
        ctx[0]);
        append(div, t1);
        if (if_block) if_block.m(div, null);

        if (!mounted) {
          dispose = listen(input, "input",
          /*input_input_handler*/
          ctx[5]);
          mounted = true;
        }
      },
      p: function p(ctx, _ref) {
        var dirty = _ref[0];
        if (dirty &
        /*label*/
        2) set_data(t0,
        /*label*/
        ctx[1]);

        if (dirty &
        /*disabled*/
        8) {
          input.disabled =
          /*disabled*/
          ctx[3];
        }

        if (dirty &
        /*date*/
        1 && input.value !==
        /*date*/
        ctx[0]) {
          set_input_value(input,
          /*date*/
          ctx[0]);
        }

        if (
        /*errorMsg*/
        ctx[2]) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block(ctx);
            if_block.c();
            if_block.m(div, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }

        if (dirty &
        /*errorMsg*/
        4 && div_class_value !== (div_class_value = "form-group " + (
        /*errorMsg*/
        ctx[2] ? "has-error" : ""))) {
          attr(div, "class", div_class_value);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
        if (if_block) if_block.d();
        mounted = false;
        dispose();
      }
    };
  }

  function instance$1($$self, $$props, $$invalidate) {
    var label = $$props.label;
    var date = $$props.date;
    var errorMsg = $$props.errorMsg;
    var _$$props$disabled = $$props.disabled,
        disabled = _$$props$disabled === void 0 ? false : _$$props$disabled;
    var inputId = label + "-date";

    function input_input_handler() {
      date = this.value;
      $$invalidate(0, date);
    }

    $$self.$$set = function ($$props) {
      if ("label" in $$props) $$invalidate(1, label = $$props.label);
      if ("date" in $$props) $$invalidate(0, date = $$props.date);
      if ("errorMsg" in $$props) $$invalidate(2, errorMsg = $$props.errorMsg);
      if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
    };

    return [date, label, errorMsg, disabled, inputId, input_input_handler];
  }

  var DateEntry = /*#__PURE__*/function (_SvelteComponent) {
    _inheritsLoose(DateEntry, _SvelteComponent);

    function DateEntry(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, instance$1, create_fragment$1, safe_not_equal, {
        label: 1,
        date: 0,
        errorMsg: 2,
        disabled: 3
      });
      return _this;
    }

    return DateEntry;
  }(SvelteComponent);

  function create_fragment$2(ctx) {
    var triptype;
    var updating_tripType;
    var t0;
    var dateentry0;
    var updating_date;
    var t1;
    var dateentry1;
    var updating_date_1;
    var t2;
    var div;
    var button;
    var t3;
    var current;
    var mounted;
    var dispose;

    function triptype_tripType_binding(value) {
      /*triptype_tripType_binding*/
      ctx[7].call(null, value);
    }

    var triptype_props = {};

    if (
    /*tripType*/
    ctx[2] !== void 0) {
      triptype_props.tripType =
      /*tripType*/
      ctx[2];
    }

    triptype = new TripType({
      props: triptype_props
    });
    binding_callbacks.push(function () {
      return bind(triptype, "tripType", triptype_tripType_binding);
    });

    function dateentry0_date_binding(value) {
      /*dateentry0_date_binding*/
      ctx[8].call(null, value);
    }

    var dateentry0_props = {
      label: "Departing",
      errorMsg:
      /*departingError*/
      ctx[3]
    };

    if (
    /*departing*/
    ctx[0] !== void 0) {
      dateentry0_props.date =
      /*departing*/
      ctx[0];
    }

    dateentry0 = new DateEntry({
      props: dateentry0_props
    });
    binding_callbacks.push(function () {
      return bind(dateentry0, "date", dateentry0_date_binding);
    });

    function dateentry1_date_binding(value) {
      /*dateentry1_date_binding*/
      ctx[9].call(null, value);
    }

    var dateentry1_props = {
      label: "Returning",
      errorMsg:
      /*returningError*/
      ctx[4],
      disabled:
      /*tripType*/
      ctx[2] == oneWayFlight$1
    };

    if (
    /*returning*/
    ctx[1] !== void 0) {
      dateentry1_props.date =
      /*returning*/
      ctx[1];
    }

    dateentry1 = new DateEntry({
      props: dateentry1_props
    });
    binding_callbacks.push(function () {
      return bind(dateentry1, "date", dateentry1_date_binding);
    });
    return {
      c: function c() {
        create_component(triptype.$$.fragment);
        t0 = space();
        create_component(dateentry0.$$.fragment);
        t1 = space();
        create_component(dateentry1.$$.fragment);
        t2 = space();
        div = element("div");
        button = element("button");
        t3 = text("book");
        attr(button, "class", "btn btn-primary");
        button.disabled =
        /*isBookDisabled*/
        ctx[5];
        attr(div, "class", "form-group");
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

        if (!mounted) {
          dispose = listen(button, "click",
          /*bookFlight*/
          ctx[6]);
          mounted = true;
        }
      },
      p: function p(ctx, _ref) {
        var dirty = _ref[0];
        var triptype_changes = {};

        if (!updating_tripType && dirty &
        /*tripType*/
        4) {
          updating_tripType = true;
          triptype_changes.tripType =
          /*tripType*/
          ctx[2];
          add_flush_callback(function () {
            return updating_tripType = false;
          });
        }

        triptype.$set(triptype_changes);
        var dateentry0_changes = {};
        if (dirty &
        /*departingError*/
        8) dateentry0_changes.errorMsg =
        /*departingError*/
        ctx[3];

        if (!updating_date && dirty &
        /*departing*/
        1) {
          updating_date = true;
          dateentry0_changes.date =
          /*departing*/
          ctx[0];
          add_flush_callback(function () {
            return updating_date = false;
          });
        }

        dateentry0.$set(dateentry0_changes);
        var dateentry1_changes = {};
        if (dirty &
        /*returningError*/
        16) dateentry1_changes.errorMsg =
        /*returningError*/
        ctx[4];
        if (dirty &
        /*tripType*/
        4) dateentry1_changes.disabled =
        /*tripType*/
        ctx[2] == oneWayFlight$1;

        if (!updating_date_1 && dirty &
        /*returning*/
        2) {
          updating_date_1 = true;
          dateentry1_changes.date =
          /*returning*/
          ctx[1];
          add_flush_callback(function () {
            return updating_date_1 = false;
          });
        }

        dateentry1.$set(dateentry1_changes);

        if (!current || dirty &
        /*isBookDisabled*/
        32) {
          button.disabled =
          /*isBookDisabled*/
          ctx[5];
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
        if (detaching) detach(t0);
        destroy_component(dateentry0, detaching);
        if (detaching) detach(t1);
        destroy_component(dateentry1, detaching);
        if (detaching) detach(t2);
        if (detaching) detach(div);
        mounted = false;
        dispose();
      }
    };
  }

  var oneWayFlight$1 = "one-way";
  var returnFlight$1 = "return";

  function instance$2($$self, $$props, $$invalidate) {
    var departing = today();
    var returning = departing;
    var tripType = oneWayFlight$1;

    function getErrorMessage(date) {
      try {
        validateDate(date);
        return null;
      } catch (error) {
        return error.message;
      }
    }

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
      $$invalidate(2, tripType);
    }

    function dateentry0_date_binding(value) {
      departing = value;
      $$invalidate(0, departing);
    }

    function dateentry1_date_binding(value) {
      returning = value;
      $$invalidate(1, returning);
    }

    var departingError;
    var returningError;
    var isBookDisabled;

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*departing*/
      1) {
         $$invalidate(3, departingError = getErrorMessage(departing));
      }

      if ($$self.$$.dirty &
      /*returning*/
      2) {
         $$invalidate(4, returningError = getErrorMessage(returning));
      }

      if ($$self.$$.dirty &
      /*departingError, returningError, tripType, returning, departing*/
      31) {
         if (departingError == null && returningError == null && tripType == returnFlight$1 && returning < departing) {
          $$invalidate(4, returningError = "Returning date must be on or after departing date.");
        }
      }

      if ($$self.$$.dirty &
      /*departingError, returningError*/
      24) {
         $$invalidate(5, isBookDisabled = departingError || returningError);
      }
    };

    return [departing, returning, tripType, departingError, returningError, isBookDisabled, bookFlight, triptype_tripType_binding, dateentry0_date_binding, dateentry1_date_binding];
  }

  var FlightBooker = /*#__PURE__*/function (_SvelteComponent) {
    _inheritsLoose(FlightBooker, _SvelteComponent);

    function FlightBooker(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, instance$2, create_fragment$2, safe_not_equal, {});
      return _this;
    }

    return FlightBooker;
  }(SvelteComponent);

  new FlightBooker({
    target: document.getElementById("app")
  });

}());
