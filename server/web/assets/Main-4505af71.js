import{u as y}from"./menuStore-239aa3b7.js";import{d as k,u as w,a as x,o as C,w as S,r as p,b as $,c,e,F as b,f as B,g as i,n as M,h as R,i as I,j as o,k as N,t as T,p as z,l as j,m,_ as q}from"./index-b69b726a.js";const h=a=>(z("data-v-d83dbfc5"),a=a(),j(),a),E={class:"wrap flex"},F={class:"content"},P={class:"menu"},V=["onClick"],X=h(()=>e("header",{class:"header"},[e("div",{class:"content"},[e("div",{class:"solgen"},"乘风破浪 激流勇进")])],-1)),D={class:"main"},L={class:"container"},W={key:0,class:"welcome p-[10px] text-[15px]"},A=h(()=>e("footer",{class:"flex p-[20px]"},[e("div",{class:"copyright"},[e("p",null,"make by expressjs"),e("span",null,[e("a",{href:"http://beian.miit.gov.cn/",target:"_blank"},"粤ICP备14062482号")])])],-1)),G=k({__name:"Main",setup(a){const r=y(),f=w(),l=x();C(()=>{r.fetchMenu()}),S(()=>r.menu,async t=>{t.length>0&&(await m(),_())},{immediate:!0});const u=p(0),d=p(75),_=()=>{const t=document.querySelector(".menu"),s=document.querySelector(".current");!s||!t||(d.value=s.getBoundingClientRect().width,u.value=s.getBoundingClientRect().left-t.getBoundingClientRect().left)},g=t=>{t.pageName!==f.name&&sessionStorage.setItem("currentPage","1"),l.push(`/${t.pageName}`),l.afterEach(()=>{m(()=>{_()})})};return(t,s)=>{const v=$("router-view");return o(),c("section",E,[e("nav",null,[e("div",F,[e("div",{class:"logo",onClick:s[0]||(s[0]=n=>t.$router.push("/"))},"Tuziki的个人记录"),e("ul",P,[(o(!0),c(b,null,B(i(r).menu,n=>(o(),c("li",{key:n._id,class:N({current:`${n.pageName}`===t.$route.name}),onClick:H=>g(n)},T(n.name),11,V))),128)),e("div",{class:"linebg",style:M({transform:`translateX(${i(u)}px)`,width:`${i(d)}px`})},null,4)])])]),X,e("div",D,[e("div",L,[t.$route.path==="/"?(o(),c("div",W," 你好！欢迎来Tuziki ! ")):R("",!0),(o(),I(v,{key:t.$route.path}))])]),A])}}});const O=q(G,[["__scopeId","data-v-d83dbfc5"]]);export{O as default};