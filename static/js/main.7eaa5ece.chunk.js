(this.webpackJsonpscrapple=this.webpackJsonpscrapple||[]).push([[0],{35:function(e,t,n){"use strict";n.r(t);var r=n(16),c=n(13),a=n(34),s=n(9),o=n.n(s),l=n(14),u=n(4),i=n(0),p=n(29),j=n.n(p),b=n(6),f=n(33),h=n(31),d=n(17),O=n(32),x=n(25),v=n(12),m=n(15),g=function(){var e=Object(l.a)(o.a.mark((function e(t){var n;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch(t,{method:"GET"});case 2:return n=e.sent,e.next=5,n.json();case 5:return e.abrupt("return",e.sent);case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),y=function(){var e=Object(l.a)(o.a.mark((function e(t,n){var r;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:n?JSON.stringify(n):""});case 2:return r=e.sent,e.next=5,r.json();case 5:return e.abrupt("return",e.sent);case 6:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}(),w="otterspace.ca",k=3e3,D=function(e){return y("https://".concat(w,":").concat(k,"/players?game=").concat(e))},S=function(e,t){return g("https://".concat(w,":").concat(k,"/games/").concat(e,"?player=").concat(t))},A=function(e,t,n,r){return y("https://".concat(w,":").concat(k,"/moves/").concat(e,"?game=").concat(t,"&player=").concat(n),{placements:r})};function N(e){var t=e.style,n=e.value,r=Object(a.a)(e,["style","value"]);return Object(u.jsx)("div",Object(c.a)(Object(c.a)({},r),{},{style:Object(c.a)({width:"80px",height:"80px",lineHeight:"80px",display:"inline-block",cursor:"pointer",backgroundColor:"#eee",verticalAlign:"middle",textAlign:"center",margin:"2px"},t),children:n}))}j.a.render(Object(u.jsxs)(f.a,{children:[Object(u.jsx)("link",{rel:"stylesheet",href:"https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",integrity:"sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk",crossorigin:"anonymous"}),Object(u.jsxs)(b.c,{children:[Object(u.jsx)(b.a,{path:"/scrapple/games/:game",component:function(e){var t=Object(i.useState)(null),n=Object(r.a)(t,2),a=n[0],s=n[1],p=Object(i.useState)(null),j=Object(r.a)(p,2),f=j[0],h=j[1],d=Object(i.useState)(Array(7).fill(null)),O=Object(r.a)(d,2),v=O[0],g=O[1],y=Object(i.useState)(null),w=Object(r.a)(y,2),k=w[0],C=w[1],E=Object(i.useRef)(null),M=Object(b.g)(),T=f&&a&&f.nextPlayer===a.order;if(Object(i.useEffect)((function(){Object(l.a)(o.a.mark((function e(){return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a){e.next=8;break}return e.t0=s,e.next=4,D(M.game);case 4:e.t1=e.sent,(0,e.t0)(e.t1),e.next=14;break;case 8:if(f){e.next=14;break}return e.t2=h,e.next=12,S(M.game,a.id);case 12:e.t3=e.sent,(0,e.t2)(e.t3);case 14:case"end":return e.stop()}}),e)})))()}),[a,f]),function(e,t){var n=Object(i.useRef)();Object(i.useEffect)((function(){n.current=e}),[e]),Object(i.useEffect)((function(){if(null!==t){var e=setInterval((function(){n.current()}),t);return function(){return clearInterval(e)}}}),[t])}((function(){Object(l.a)(o.a.mark((function e(){return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=h,e.next=3,S(M.game,a.id);case 3:e.t1=e.sent,(0,e.t0)(e.t1);case 5:case"end":return e.stop()}}),e)})))()}),T?null:3e3),!f||!a)return Object(u.jsx)("div",{children:"Loading..."});var G=a.rack.split(","),P=f.board.split(",");function I(){return(I=Object(l.a)(o.a.mark((function e(t){var n,r,l;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:for(n=[],r=0;r<v.length;r++)null!==v[r]&&(n.push(v[r]),n.push(G[r]));return e.next=4,A(f.nextMove,M.game,a.id,n.join(","));case 4:l=e.sent,g(Array(7).fill(null)),s(Object(c.a)(Object(c.a)({},a),l.player)),h(Object(c.a)(Object(c.a)({},f),l.game)),E.current.scrollTo({left:E.current.scrollLeftMax/2,top:E.current.scrollTopMax/2,behavior:"smooth"});case 9:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var L=m.a.create({game:{display:"flex",flexFlow:"column",height:"100vh"},board:{overflow:"scroll",scrollbarWidth:"none",flexGrow:"1",flexShrink:"1",scrollSnapAlign:"center"},row:{whiteSpace:"nowrap"}}),F=Math.sqrt(P.length),J=function(e,t){var n=Math.sqrt(e.length),r=Array(e.length).fill(0),c=[];for(c.push(Math.floor(e.length/2));c.length>0;){var a=c.pop();" "!==e[a]||t.includes(a)?(r[a]=1,a-1>=0&&!r[a-1]&&c.push(a-1),a+1<e.length&&!r[a+1]&&c.push(a+1),a-n>=0&&!r[a-n]&&c.push(a-n),a+n<e.length&&!r[a+n]&&c.push(a+n)):r[a]=2}return r}(P,v),R=function(e){return Object(u.jsx)("div",{className:Object(m.b)(L.board),children:Array(F).fill(0).map((function(e,t){return Object(u.jsx)("div",{className:Object(m.b)(L.row),children:Array(F).fill(0).map((function(e,n){return v.includes(t*F+n)?Object(u.jsx)(N,{draggable:T,onDrag:function(e){e.preventDefault(),C(v.indexOf(t*F+n))},onDragOver:function(e){return e.preventDefault()},value:G[v.indexOf(t*F+n)]},t*F+n):Object(u.jsx)(N,{style:{opacity:0!==J[t*F+n]?1:.5},draggable:!1,onDragOver:function(e){return e.preventDefault()},onDrop:function(e){v[k]=t*F+n,g(v),C(null)},value:P[t*F+n]},t*F+n)}))})}))})};return Object(u.jsxs)("div",{className:Object(m.b)(L.game),children:[Object(u.jsx)(R,{board:P,placements:v,ref:E,isOurTurn:T}),Object(u.jsxs)("div",{className:Object(m.b)(L.row),children:[G.map((function(e,t){return Object(u.jsx)(N,{draggable:T,onDrag:function(e){e.preventDefault(),C(t)},onDragOver:function(e){return e.preventDefault()},onDrop:function(e){v[k]=null,g(v),C(null)},value:null===v[t]?e:" "},t)})),Object(u.jsx)(x.a,{disabled:!T,onClick:function(e){return I.apply(this,arguments)},children:"End Turn"})]})]})}}),Object(u.jsx)(b.a,{path:"/scrapple/",component:function(){var e=Object(b.f)(),t=function(){var t=Object(l.a)(o.a.mark((function t(n){var r;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n.preventDefault(),t.next=3,y("https://".concat(w,":").concat(k,"/games"),{size:15,maxPlayers:2});case 3:r=t.sent,e.push("/scrapple/games/".concat(r.id));case 5:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}();return Object(u.jsx)(h.a,{fluid:!0,children:Object(u.jsx)(O.a,{children:Object(u.jsx)(d.a,{children:Object(u.jsxs)(v.a,{onSubmit:t,children:[Object(u.jsxs)(v.a.Group,{children:[Object(u.jsx)(v.a.Label,{children:"Number of Players"}),Object(u.jsxs)(v.a.Control,{as:"select",children:[Object(u.jsx)("option",{children:"2"}),Object(u.jsx)("option",{children:"3"}),Object(u.jsx)("option",{children:"4"})]})]}),Object(u.jsxs)(v.a.Group,{children:[Object(u.jsx)(v.a.Label,{children:"Board size"}),Object(u.jsxs)(v.a.Control,{as:"select",children:[Object(u.jsx)("option",{children:"13"}),Object(u.jsx)("option",{children:"15"}),Object(u.jsx)("option",{children:"17"})]})]}),Object(u.jsx)(x.a,{variant:"primary",type:"submit",children:"New Game"})]})})})})}})]})]}),document.getElementById("root"))}},[[35,1,2]]]);
//# sourceMappingURL=main.7eaa5ece.chunk.js.map