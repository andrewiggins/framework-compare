!function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function r(t){t.forEach(n)}function o(t){return"function"==typeof t}function c(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}let u;function f(t){u=t}const s=[],a=Promise.resolve();let i=!1;const l=[],d=[],$=[];function p(t){d.push(t)}function h(){const t=new Set;do{for(;s.length;){const t=s.shift();f(t),m(t.$$)}for(;l.length;)l.shift()();for(;d.length;){const n=d.pop();t.has(n)||(n(),t.add(n))}}while(s.length);for(;$.length;)$.pop()();i=!1}function m(t){t.fragment&&(t.update(t.dirty),r(t.before_render),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_render.forEach(p))}const g=new Set;function y(t,n){t.$$.dirty||(s.push(t),i||(i=!0,a.then(h)),t.$$.dirty=e()),t.$$.dirty[n]=!0}function _(c,s,a,i,l,d){const $=u;f(c);const m=s.props||{},_=c.$$={fragment:null,ctx:null,props:d,update:t,not_equal:l,bound:e(),on_mount:[],on_destroy:[],before_render:[],after_render:[],context:new Map($?$.$$.context:[]),callbacks:e(),dirty:null};let x=!1;var b,v;_.ctx=a?a(c,m,(t,n)=>{_.ctx&&l(_.ctx[t],_.ctx[t]=n)&&(_.bound[t]&&_.bound[t](n),x&&y(c,t))}):m,_.update(),x=!0,r(_.before_render),_.fragment=i(_.ctx),s.target&&(s.hydrate?_.fragment.l(function(t){return Array.from(t.childNodes)}(s.target)):_.fragment.c(),s.intro&&((b=c.$$.fragment)&&b.i&&(g.delete(b),b.i(v))),function(t,e,c){const{fragment:u,on_mount:f,on_destroy:s,after_render:a}=t.$$;u.m(e,c),p(()=>{const e=f.map(n).filter(o);s?s.push(...e):r(e),t.$$.on_mount=[]}),a.forEach(p)}(c,s.target,s.anchor),h()),f($)}class x{$destroy(){var n,e;e=1,(n=this).$$.fragment&&(r(n.$$.on_destroy),n.$$.fragment.d(e),n.$$.on_destroy=n.$$.fragment=null,n.$$.ctx={}),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(){}}function b(n){var e;return{c(){var t;t="div",(e=document.createElement(t)).textContent="Hello World!"},m(t,n){!function(t,n,e){t.insertBefore(n,e||null)}(t,e,n)},p:t,i:t,o:t,d(t){var n;t&&(n=e).parentNode.removeChild(n)}}}new class extends x{constructor(t){super(),_(this,t,null,b,c,[])}}({target:document.getElementById("app")})}();