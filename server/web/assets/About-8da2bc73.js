import{c as n}from"./api-0b26dce1.js";import{d as c}from"./dayjs.min-5433e12a.js";import{d as o,r as i,c as r,b as a,u as e,t as l,F as _,o as d}from"./index-ffc6089a.js";const u=["innerHTML"],f={class:"articleDate pb-4 text-[#999] text-center text-[14px] italic"},p=["innerHTML"],v=o({__name:"About",setup(m){const t=i({body:"",title:"",date:""});return(async()=>{const s=await n("658a87b41a9e685c9acdbff9");t.value=s})(),(s,D)=>(d(),r(_,null,[a("div",{class:"articleTitle",innerHTML:e(t).title},null,8,u),a("div",f,l(e(c)(e(t).date).format("YYYY-MM-DD ")),1),a("div",{class:"articleDetails",innerHTML:e(t).body},null,8,p)],64))}});export{v as default};
