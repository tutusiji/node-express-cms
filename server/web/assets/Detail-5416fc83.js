import{T as f,U as g}from"./el-loading-85a82bd6.js";import{d as v,r as d,aa as D,w as y,o as h,c as u,b as o,f as e,t as M,g as b,J as m,K as w,F as x,i as p}from"./index-132c4de3.js";import{u as T,g as k}from"./menuStore-8b61a4ba.js";const L=["innerHTML"],H={key:0,class:"articleDate pb-4 text-[#999] text-center text-[14px] italic"},S=["innerHTML"],j=v({__name:"Detail",setup(Y){const l=T(),t=d({body:"",title:"",date:"",dateDisplay:!0}),n=d(!1),r=D();let c=r.params.id;const _=async()=>{n.value=!0;const a=l.menu.find(i=>`${i.path}`===r.path);a&&a.pageId&&(c=a.pageId);const s=await k(c);t.value=s,n.value=!1};return y(()=>l.menu,async a=>{a.length>0&&await _()},{immediate:!0}),h(()=>{}),(a,s)=>{const i=f;return p(),u(x,null,[o("div",{class:"articleTitle",innerHTML:e(t).title},null,8,L),e(t).title&&e(t).dateDisplay?(p(),u("div",H,M(e(g)(e(t).date).format("YYYY-MM-DD ")),1)):b("",!0),m(o("div",{class:"articleDetails",innerHTML:e(t).body},null,8,S),[[i,e(n)]]),m(o("div",{class:"back",onClick:s[0]||(s[0]=B=>a.$router.go(-1))}," 返回 ",512),[[w,e(t).title]])],64)}}});export{j as default};
