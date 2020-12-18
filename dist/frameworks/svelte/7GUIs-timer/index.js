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

  function to_number(value) {
    return value === '' ? null : +value;
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

  var current_component;

  function set_current_component(component) {
    current_component = component;
  }

  function get_current_component() {
    if (!current_component) throw new Error('Function called outside component initialization');
    return current_component;
  }

  function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
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

  function create_fragment(ctx) {
    var label0;
    var t0;
    var progress;
    var progress_value_value;
    var t1;
    var div0;
    var t2_value = (
    /*elapsed*/
    ctx[0] / 1000).toFixed(1) + "";
    var t2;
    var t3;
    var t4;
    var label1;
    var t5;
    var input;
    var t6;
    var div1;
    var button;
    var mounted;
    var dispose;
    return {
      c: function c() {
        label0 = element("label");
        t0 = text("Elapsed time: ");
        progress = element("progress");
        t1 = space();
        div0 = element("div");
        t2 = text(t2_value);
        t3 = text("s");
        t4 = space();
        label1 = element("label");
        t5 = text("Duration:\n\t");
        input = element("input");
        t6 = space();
        div1 = element("div");
        button = element("button");
        button.textContent = "Reset";
        progress.value = progress_value_value =
        /*elapsed*/
        ctx[0] /
        /*duration*/
        ctx[1];
        attr(div0, "class", "elapsed");
        attr(input, "type", "range");
        attr(input, "min", "1");
        attr(input, "max", "20000");
        attr(button, "class", "btn btn-primary");
      },
      m: function m(target, anchor) {
        insert(target, label0, anchor);
        append(label0, t0);
        append(label0, progress);
        insert(target, t1, anchor);
        insert(target, div0, anchor);
        append(div0, t2);
        append(div0, t3);
        insert(target, t4, anchor);
        insert(target, label1, anchor);
        append(label1, t5);
        append(label1, input);
        set_input_value(input,
        /*duration*/
        ctx[1]);
        insert(target, t6, anchor);
        insert(target, div1, anchor);
        append(div1, button);

        if (!mounted) {
          dispose = [listen(input, "change",
          /*input_change_input_handler*/
          ctx[4]), listen(input, "input",
          /*input_change_input_handler*/
          ctx[4]), listen(button, "click",
          /*reset*/
          ctx[2])];
          mounted = true;
        }
      },
      p: function p(ctx, _ref) {
        var dirty = _ref[0];

        if (dirty &
        /*elapsed, duration*/
        3 && progress_value_value !== (progress_value_value =
        /*elapsed*/
        ctx[0] /
        /*duration*/
        ctx[1])) {
          progress.value = progress_value_value;
        }

        if (dirty &
        /*elapsed*/
        1 && t2_value !== (t2_value = (
        /*elapsed*/
        ctx[0] / 1000).toFixed(1) + "")) set_data(t2, t2_value);

        if (dirty &
        /*duration*/
        2) {
          set_input_value(input,
          /*duration*/
          ctx[1]);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(label0);
        if (detaching) detach(t1);
        if (detaching) detach(div0);
        if (detaching) detach(t4);
        if (detaching) detach(label1);
        if (detaching) detach(t6);
        if (detaching) detach(div1);
        mounted = false;
        run_all(dispose);
      }
    };
  }

  function instance($$self, $$props, $$invalidate) {
    var elapsed = 0;
    var duration = 5000;
    var last_time = performance.now();
    var frame;

    function reset() {
      $$invalidate(0, elapsed = 0);
      $$invalidate(3, last_time = performance.now());
    }

    onDestroy(function () {
      return cancelAnimationFrame(frame);
    });

    function input_change_input_handler() {
      duration = to_number(this.value);
      $$invalidate(1, duration);
    }

    $$self.$$.update = function () {
      if ($$self.$$.dirty &
      /*elapsed, duration, last_time*/
      11) {
         if (elapsed < duration) {
          frame = requestAnimationFrame(function (time) {
            $$invalidate(0, elapsed += Math.min(time - last_time, duration - elapsed));
            $$invalidate(3, last_time = time);
          });
        }
      }
    };

    return [elapsed, duration, reset, last_time, input_change_input_handler];
  }

  var Timer = /*#__PURE__*/function (_SvelteComponent) {
    _inheritsLoose(Timer, _SvelteComponent);

    function Timer(options) {
      var _this;

      _this = _SvelteComponent.call(this) || this;
      init(_assertThisInitialized(_this), options, instance, create_fragment, safe_not_equal, {});
      return _this;
    }

    return Timer;
  }(SvelteComponent);

  new Timer({
    target: document.getElementById("app")
  });

}());
