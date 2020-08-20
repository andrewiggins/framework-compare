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

  var n,u,i,t,o,r,f,e={},c=[],a=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function s(n,l){for(var u in l)n[u]=l[u];return n}function v(n){var l=n.parentNode;l&&l.removeChild(n);}function h(n,l,u){var i,t=arguments,o={};for(i in l)"key"!==i&&"ref"!==i&&(o[i]=l[i]);if(arguments.length>3)for(u=[u],i=3;i<arguments.length;i++)u.push(t[i]);if(null!=u&&(o.children=u),"function"==typeof n&&null!=n.defaultProps)for(i in n.defaultProps)void 0===o[i]&&(o[i]=n.defaultProps[i]);return y(n,o,l&&l.key,l&&l.ref,null)}function y(l,u,i,t,o){var r={type:l,props:u,key:i,ref:t,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,constructor:void 0,__v:o};return null==o&&(r.__v=r),n.vnode&&n.vnode(r),r}function d(n){return n.children}function m(n,l){this.props=n,this.context=l;}function w(n,l){if(null==l)return n.__?w(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return "function"==typeof n.type?w(n):null}function k(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return k(n)}}function g(l){(!l.__d&&(l.__d=!0)&&u.push(l)&&!i++||o!==n.debounceRendering)&&((o=n.debounceRendering)||t)(_);}function _(){for(var n;i=u.length;)n=u.sort(function(n,l){return n.__v.__b-l.__v.__b}),u=[],n.some(function(n){var l,u,i,t,o,r,f;n.__d&&(r=(o=(l=n).__v).__e,(f=l.__P)&&(u=[],(i=s({},o)).__v=i,t=z(f,o,i,l.__n,void 0!==f.ownerSVGElement,null,u,null==r?w(o):r),T(u,o),t!=r&&k(o)));});}function b(n,l,u,i,t,o,r,f,a,s){var h,p,m,k,g,_,b,x,A,P=i&&i.__k||c,C=P.length;for(a==e&&(a=null!=r?r[0]:C?w(i,0):null),u.__k=[],h=0;h<l.length;h++)if(null!=(k=u.__k[h]=null==(k=l[h])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k?y(null,k,null,null,k):Array.isArray(k)?y(d,{children:k},null,null,null):null!=k.__e||null!=k.__c?y(k.type,k.props,k.key,null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(m=P[h])||m&&k.key==m.key&&k.type===m.type)P[h]=void 0;else for(p=0;p<C;p++){if((m=P[p])&&k.key==m.key&&k.type===m.type){P[p]=void 0;break}m=null;}if(g=z(n,k,m=m||e,t,o,r,f,a,s),(p=k.ref)&&m.ref!=p&&(x||(x=[]),m.ref&&x.push(m.ref,null,k),x.push(p,k.__c||g,k)),null!=g){if(null==b&&(b=g),A=void 0,void 0!==k.__d)A=k.__d,k.__d=void 0;else if(r==m||g!=a||null==g.parentNode){n:if(null==a||a.parentNode!==n)n.appendChild(g),A=null;else {for(_=a,p=0;(_=_.nextSibling)&&p<C;p+=2)if(_==g)break n;n.insertBefore(g,a),A=a;}"option"==u.type&&(n.value="");}a=void 0!==A?A:g.nextSibling,"function"==typeof u.type&&(u.__d=a);}else a&&m.__e==a&&a.parentNode!=n&&(a=w(m));}if(u.__e=b,null!=r&&"function"!=typeof u.type)for(h=r.length;h--;)null!=r[h]&&v(r[h]);for(h=C;h--;)null!=P[h]&&D(P[h],P[h]);if(x)for(h=0;h<x.length;h++)j(x[h],x[++h],x[++h]);}function A(n,l,u,i,t){var o;for(o in u)"children"===o||"key"===o||o in l||C(n,o,null,u[o],i);for(o in l)t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||C(n,o,l[o],u[o],i);}function P(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]="number"==typeof u&&!1===a.test(l)?u+"px":null==u?"":u;}function C(n,l,u,i,t){var o,r,f,e,c;if(t?"className"===l&&(l="class"):"class"===l&&(l="className"),"style"===l)if(o=n.style,"string"==typeof u)o.cssText=u;else {if("string"==typeof i&&(o.cssText="",i=null),i)for(e in i)u&&e in u||P(o,e,"");if(u)for(c in u)i&&u[c]===i[c]||P(o,c,u[c]);}else "o"===l[0]&&"n"===l[1]?(r=l!==(l=l.replace(/Capture$/,"")),f=l.toLowerCase(),l=(f in n?f:l).slice(2),u?(i||n.addEventListener(l,N,r),(n.l||(n.l={}))[l]=u):n.removeEventListener(l,N,r)):"list"!==l&&"tagName"!==l&&"form"!==l&&"type"!==l&&"size"!==l&&!t&&l in n?n[l]=null==u?"":u:"function"!=typeof u&&"dangerouslySetInnerHTML"!==l&&(l!==(l=l.replace(/^xlink:?/,""))?null==u||!1===u?n.removeAttributeNS("http://www.w3.org/1999/xlink",l.toLowerCase()):n.setAttributeNS("http://www.w3.org/1999/xlink",l.toLowerCase(),u):null==u||!1===u&&!/^ar/.test(l)?n.removeAttribute(l):n.setAttribute(l,u));}function N(l){this.l[l.type](n.event?n.event(l):l);}function z(l,u,i,t,o,r,f,e,c){var a,v,h,y,p,w,k,g,_,x,A,P=u.type;if(void 0!==u.constructor)return null;(a=n.__b)&&a(u);try{n:if("function"==typeof P){if(g=u.props,_=(a=P.contextType)&&t[a.__c],x=a?_?_.props.value:a.__:t,i.__c?k=(v=u.__c=i.__c).__=v.__E:("prototype"in P&&P.prototype.render?u.__c=v=new P(g,x):(u.__c=v=new m(g,x),v.constructor=P,v.render=E),_&&_.sub(v),v.props=g,v.state||(v.state={}),v.context=x,v.__n=t,h=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=P.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=s({},v.__s)),s(v.__s,P.getDerivedStateFromProps(g,v.__s))),y=v.props,p=v.state,h)null==P.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else {if(null==P.getDerivedStateFromProps&&g!==y&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(g,x),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(g,v.__s,x)||u.__v===i.__v){for(v.props=g,v.state=v.__s,u.__v!==i.__v&&(v.__d=!1),v.__v=u,u.__e=i.__e,u.__k=i.__k,v.__h.length&&f.push(v),a=0;a<u.__k.length;a++)u.__k[a]&&(u.__k[a].__=u);break n}null!=v.componentWillUpdate&&v.componentWillUpdate(g,v.__s,x),null!=v.componentDidUpdate&&v.__h.push(function(){v.componentDidUpdate(y,p,w);});}v.context=x,v.props=g,v.state=v.__s,(a=n.__r)&&a(u),v.__d=!1,v.__v=u,v.__P=l,a=v.render(v.props,v.state,v.context),null!=v.getChildContext&&(t=s(s({},t),v.getChildContext())),h||null==v.getSnapshotBeforeUpdate||(w=v.getSnapshotBeforeUpdate(y,p)),A=null!=a&&a.type==d&&null==a.key?a.props.children:a,b(l,Array.isArray(A)?A:[A],u,i,t,o,r,f,e,c),v.base=u.__e,v.__h.length&&f.push(v),k&&(v.__E=v.__=null),v.__e=!1;}else null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=$(i.__e,u,i,t,o,r,f,c);(a=n.diffed)&&a(u);}catch(l){u.__v=null,n.__e(l,u,i);}return u.__e}function T(l,u){n.__c&&n.__c(u,l),l.some(function(u){try{l=u.__h,u.__h=[],l.some(function(n){n.call(u);});}catch(l){n.__e(l,u.__v);}});}function $(n,l,u,i,t,o,r,f){var a,s,v,h,y,p=u.props,d=l.props;if(t="svg"===l.type||t,null!=o)for(a=0;a<o.length;a++)if(null!=(s=o[a])&&((null===l.type?3===s.nodeType:s.localName===l.type)||n==s)){n=s,o[a]=null;break}if(null==n){if(null===l.type)return document.createTextNode(d);n=t?document.createElementNS("http://www.w3.org/2000/svg",l.type):document.createElement(l.type,d.is&&{is:d.is}),o=null,f=!1;}if(null===l.type)p!==d&&n.data!=d&&(n.data=d);else {if(null!=o&&(o=c.slice.call(n.childNodes)),v=(p=u.props||e).dangerouslySetInnerHTML,h=d.dangerouslySetInnerHTML,!f){if(null!=o)for(p={},y=0;y<n.attributes.length;y++)p[n.attributes[y].name]=n.attributes[y].value;(h||v)&&(h&&v&&h.__html==v.__html||(n.innerHTML=h&&h.__html||""));}A(n,d,p,t,f),h?l.__k=[]:(a=l.props.children,b(n,Array.isArray(a)?a:[a],l,u,i,"foreignObject"!==l.type&&t,o,r,e,f)),f||("value"in d&&void 0!==(a=d.value)&&a!==n.value&&C(n,"value",a,p.value,!1),"checked"in d&&void 0!==(a=d.checked)&&a!==n.checked&&C(n,"checked",a,p.checked,!1));}return n}function j(l,u,i){try{"function"==typeof l?l(u):l.current=u;}catch(l){n.__e(l,i);}}function D(l,u,i){var t,o,r;if(n.unmount&&n.unmount(l),(t=l.ref)&&(t.current&&t.current!==l.__e||j(t,null,u)),i||"function"==typeof l.type||(i=null!=(o=l.__e)),l.__e=l.__d=void 0,null!=(t=l.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount();}catch(l){n.__e(l,u);}t.base=t.__P=null;}if(t=l.__k)for(r=0;r<t.length;r++)t[r]&&D(t[r],u,i);null!=o&&v(o);}function E(n,l,u){return this.constructor(n,u)}function H(l,u,i){var t,o,f;n.__&&n.__(l,u),o=(t=i===r)?null:i&&i.__k||u.__k,l=h(d,null,[l]),f=[],z(u,(t?u:i||u).__k=l,o||e,e,void 0!==u.ownerSVGElement,i&&!t?[i]:o?null:u.childNodes.length?c.slice.call(u.childNodes):null,f,i||e,t),T(f,l);}n={__e:function(n,l){for(var u,i;l=l.__;)if((u=l.__c)&&!u.__)try{if(u.constructor&&null!=u.constructor.getDerivedStateFromError&&(i=!0,u.setState(u.constructor.getDerivedStateFromError(n))),null!=u.componentDidCatch&&(i=!0,u.componentDidCatch(n)),i)return g(u.__E=u)}catch(l){n=l;}throw n}},m.prototype.setState=function(n,l){var u;u=this.__s!==this.state?this.__s:this.__s=s({},this.state),"function"==typeof n&&(n=n(u,this.props)),n&&s(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),g(this));},m.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),g(this));},m.prototype.render=d,u=[],i=0,t="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,r=e,f=0;

  let id = 3;
  /** @type {(url: string, options?: RequestInit) => Promise<any>} */

  const mockFetch = window.mockFetch;
  /**
   * @typedef {{ id: number; name: string; surname: string; }} Person
   * @param {Person} person
   * @returns {Person}
   */

  function copyPerson(person) {
    return {
      id: person.id,
      name: person.name,
      surname: person.surname
    };
  }

  function getInitialState() {
    return [{
      id: 0,
      name: "Hans",
      surname: "Emil"
    }, {
      id: 1,
      name: "Max",
      surname: "Mustermann"
    }, {
      id: 2,
      name: "Roman",
      surname: "Tisch"
    }];
  }
  function createApi() {
    /**
     * @type {Person[]}}
     */
    const store = getInitialState();

    function getPersonById(id) {
      for (let person of store) {
        if (person.id == id) {
          return person;
        }
      }

      return null;
    }

    return {
      /**
       * @param {string} name
       * @param {string} surname
       * @returns {Promise<Person>}
       */
      create(name, surname) {
        /** @type {Person} */
        const person = {
          id: id++,
          name,
          surname
        };
        return mockFetch("/persons", {
          method: "PUT",
          body: JSON.stringify(person)
        }).then(() => {
          store.push(person);
          return copyPerson(person);
        });
      },

      /**
       * @returns {Promise<Person[]>}
       */
      listAll() {
        return mockFetch("/persons").then(() => store.map(copyPerson));
      },

      /**
       * @param {number} id
       * @returns {Promise<Person>}
       */
      read(id) {
        return mockFetch(`/persons/${id}`).then(() => copyPerson(getPersonById(id)));
      },

      /**
       * @param {number} id
       * @param {string} name
       * @param {string} surname
       * @returns {Promise<Person>}
       */
      update(id, name, surname) {
        const body = JSON.stringify({
          name,
          surname
        });
        return mockFetch(`/persons/${id}`, {
          method: "POST",
          body
        }).then(() => {
          const person = getPersonById(id);

          if (person == null) {
            throw new Error(`Could not find person with id "${id}".`);
          }

          person.name = name;
          person.surname = surname;
          return copyPerson(person);
        });
      },

      /**
       * @param {number} id
       * @returns {Promise<Person>}
       */
      remove(id) {
        return mockFetch(`/persons/${id}`, {
          method: "DELETE"
        }).then(() => {
          const person = getPersonById(id);

          if (person == null) {
            throw new Error(`Could not find person with id "${id}".`);
          }

          store.splice(store.indexOf(person), 1);
          return copyPerson(person);
        });
      }

    };
  }

  /**
   * @param {{ id: string; value: string; onInput: (e: InputEvent) => void; label: string; required?: boolean; }} props
   */

  function NameInput(_ref) {
    var id = _ref.id,
        value = _ref.value,
        onInput = _ref.onInput,
        label = _ref.label,
        _ref$required = _ref.required,
        required = _ref$required === void 0 ? false : _ref$required;
    // TODO: Show error message if required == true but value == ""
    return h("div", {
      "class": "form-group"
    }, h("label", {
      "for": id,
      "class": "form-label"
    }, label, " "), h("input", {
      id: id,
      "class": "form-input",
      type: "text",
      value: value,
      onInput: onInput,
      required: required
    }));
  }

  /**
   * @param {{ value: string; onInput: (e: InputEvent) => void; }} props
   */

  function FilterInput(_ref) {
    var value = _ref.value,
        onInput = _ref.onInput;
    return h("div", {
      "class": "form-group"
    }, h("label", {
      "class": "form-label"
    }, "Filter prefix: "), h("input", {
      type: "text",
      "class": "form-input",
      value: value,
      onInput: onInput
    }));
  }

  /**
   * @param {import('./index').Person} person
   */
  function getDisplayName(person) {
    return person.surname + ", " + person.name;
  }
  var EMPTY_PERSON = Object.freeze({
    id: null,
    name: "",
    surname: ""
  });

  /**
   * @param {{ persons: import('./index').Person[]; selectedId: number; onChange: (e: Event) => void;}} props
   */

  function PersonSelect(_ref) {
    var persons = _ref.persons,
        selectedId = _ref.selectedId,
        onChange = _ref.onChange;
    return h("div", {
      "class": "form-group"
    }, h("label", {
      "class": "form-label"
    }, "Select a person to edit:"), h("select", {
      size: 5,
      onChange: onChange,
      "class": "form-select"
    }, persons.map(function (person) {
      return h("option", {
        key: person.id,
        value: person.id,
        selected: person.id == selectedId
      }, getDisplayName(person));
    })));
  }

  var _createApi = createApi(),
      listAll = _createApi.listAll,
      create = _createApi.create,
      update = _createApi.update,
      remove = _createApi.remove;

  function Loading() {
    return h("div", null, "Loading...");
  }
  /**
   * @typedef {{ id: number; name: string; surname: string; }} Person
   * @typedef { "initial" | "create" | "update" | "delete" | null } LoadingState;
   * @typedef {{ filter: string; name: string; surname: string; selectedPersonId: number; persons: Person[]; loading: LoadingState; }} State
   * @returns {State}
   */


  function getInitialState$1() {
    return {
      filter: "",
      name: "",
      surname: "",
      selectedPersonId: null,
      persons: [],
      loading: "initial"
    };
  }

  var App = /*#__PURE__*/function (_Component) {
    _inheritsLoose(App, _Component);

    function App(props, context) {
      var _this;

      _this = _Component.call(this, props, context) || this;
      /** @type {State} */

      _this.state = getInitialState$1();
      _this.onNameInput = _this.onNameInput.bind(_assertThisInitialized(_this));
      _this.onSurnameInput = _this.onSurnameInput.bind(_assertThisInitialized(_this));
      _this.onFilterInput = _this.onFilterInput.bind(_assertThisInitialized(_this));
      _this.onPersonSelect = _this.onPersonSelect.bind(_assertThisInitialized(_this));
      _this.onCreate = _this.onCreate.bind(_assertThisInitialized(_this));
      _this.onUpdate = _this.onUpdate.bind(_assertThisInitialized(_this));
      _this.onDelete = _this.onDelete.bind(_assertThisInitialized(_this));
      return _this;
    }

    var _proto = App.prototype;

    _proto.componentDidMount = function componentDidMount() {
      var _this2 = this;

      // TODO: Cancel request if unmounted
      // TODO: handle rejections
      listAll().then(function (persons) {
        var person = persons.length ? persons[0] : EMPTY_PERSON;

        _this2.setState({
          persons: persons,
          name: person.name,
          surname: person.surname,
          selectedPersonId: person.id,
          loading: null
        });
      });
    };

    _proto.onNameInput = function onNameInput(e) {
      this.setState({
        name: e.target.value
      });
    };

    _proto.onSurnameInput = function onSurnameInput(e) {
      this.setState({
        surname: e.target.value
      });
    };

    _proto.onFilterInput = function onFilterInput(e) {
      this.setState({
        filter: e.target.value
      });
    };

    _proto.onPersonSelect = function onPersonSelect(e) {
      var selectedId = e.target.value;
      var selectedPerson = this.state.persons.filter(function (person) {
        return person.id == selectedId;
      })[0] || EMPTY_PERSON;
      this.setState({
        name: selectedPerson.name,
        surname: selectedPerson.surname,
        selectedPersonId: selectedPerson.id
      });
    };

    _proto.onCreate = function onCreate() {
      var _this3 = this;

      var _this$state = this.state,
          name = _this$state.name,
          surname = _this$state.surname;
      this.setState({
        loading: "create"
      }); // TODO: cancel this request if the component is unmounted
      // TODO: handle rejections

      create(name, surname).then(function (person) {
        _this3.setState({
          // TODO: Which inputs do we disable? If not all, then we need to handle
          // one of the inputs changing while the request happens
          selectedPersonId: person.id,
          persons: _this3.state.persons.concat(person),
          loading: null
        });
      });
    };

    _proto.onUpdate = function onUpdate() {
      var _this4 = this;

      var _this$state2 = this.state,
          selectedPersonId = _this$state2.selectedPersonId,
          name = _this$state2.name,
          surname = _this$state2.surname;
      this.setState({
        loading: "update"
      }); // TODO: cancel this request if the component is unmounted
      // TODO: handle rejections

      update(selectedPersonId, name, surname).then(function (person) {
        var persons = _this4.state.persons.map(function (p) {
          return p.id == person.id ? person : p;
        });

        _this4.setState({
          // TODO: Which inputs do we disable? If not all, then we need to handle
          // one of the inputs changing while the request happens
          selectedPersonId: person.id,
          persons: persons,
          loading: null
        });
      });
    };

    _proto.onDelete = function onDelete() {
      var _this5 = this;

      var _this$state3 = this.state,
          selectedPersonId = _this$state3.selectedPersonId,
          name = _this$state3.name,
          surname = _this$state3.surname;
      this.setState({
        loading: "delete"
      }); // TODO: cancel this request if the component is unmounted
      // TODO: handle rejections

      remove(selectedPersonId).then(function (deletedPerson) {
        /** @type {number} */
        var oldIndex;

        var persons = _this5.state.persons.filter(function (p, i) {
          if (p.id == deletedPerson.id) {
            oldIndex = i;
            return false;
          } else {
            return true;
          }
        });

        var newSelectedPerson = oldIndex < persons.length ? persons[oldIndex] : persons[oldIndex - 1];

        _this5.setState({
          // TODO: Which inputs do we disable? If not all, then we need to handle
          // one of the inputs changing while the request happens
          selectedPersonId: newSelectedPerson.id,
          name: newSelectedPerson.name,
          surname: newSelectedPerson.surname,
          persons: persons,
          loading: null
        });
      });
    }
    /**
     * @param {{}} props
     * @param {State} state
     */
    ;

    _proto.render = function render(props, state) {
      if (state.loading == "initial") {
        return h(Loading, null);
      }

      var selectedPerson = EMPTY_PERSON;
      var isUpdated = false;

      if (state.selectedPersonId != null) {
        selectedPerson = state.persons.find(function (p) {
          return p.id == state.selectedPersonId;
        });
        isUpdated = state.name != selectedPerson.name || state.surname != selectedPerson.surname;
      } // TODO: Consider if filteredPersons should be state so that the
      // value of the options can be the index in the filteredPersons array
      // and the selectedPerson is just the index in the filteredPersons array


      var filteredPersons = state.persons;

      if (state.filter) {
        filteredPersons = state.persons.filter(function (person) {
          return getDisplayName(person).toLowerCase().startsWith(state.filter.toLowerCase());
        });
      }

      return h("fieldset", {
        "class": "crud-wrapper",
        disabled: state.loading != null
      }, h("legend", null, "People manager"), h(FilterInput, {
        value: state.filter,
        onInput: this.onFilterInput
      }), h(PersonSelect, {
        persons: filteredPersons,
        selectedId: state.selectedPersonId,
        onChange: this.onPersonSelect
      }), h(NameInput, {
        id: "name",
        value: state.name,
        onInput: this.onNameInput,
        label: "Name:",
        required: true
      }), h(NameInput, {
        id: "surname",
        value: state.surname,
        onInput: this.onSurnameInput,
        label: "Surname:"
      }), h("div", {
        "class": "form-group btn-group btn-group-block"
      }, h("button", {
        type: "button",
        "class": "btn",
        onClick: this.onCreate,
        disabled: state.name == ""
      }, "Create"), h("button", {
        type: "button",
        "class": "btn",
        onClick: this.onUpdate,
        disabled: state.name == "" || !isUpdated
      }, "Update"), h("button", {
        type: "button",
        "class": "btn",
        onClick: this.onDelete,
        disabled: state.selectedPersonId == null
      }, "Delete")));
    };

    return App;
  }(m);

  H(h(App, null), document.getElementById("app")); // Tests:
  // - list all works (loading is shown, list is shown)
  // - list all rejects
  // - filter includes selection (list is updated, still selected, inputs show right value)
  // - filter removes selection (list is updated, select next valid item, inputs shows new selection)
  // - inputs show validation error if name input is empty (create & updated are disabled, error message under name is shown)
  // - create works (form disabled, form re-enabled, added to list, selected in list, inputs show name)
  // - create rejects
  // - update works (form disabled, form re-enabled, updated name in list, selected in list, input shows updated name)
  // - update is disabled if names are the same
  // - update rejects
  // - delete works (form disabled, form re-enabled, removed from list, next item selected, input shows new selection)
  // - delete rejects
  // - All deletes: should update the text fields
  // - All deletes: verify filter + delete work (next selected person shouldn't be filtered)
  // - Delete all people from top
  // - Delete all people from bottom
  // - Delete first person (n)
  // - Delete middle person (5?)
  // - Delete second to last person (4 total)
  // - Delete last person (n)

}());
