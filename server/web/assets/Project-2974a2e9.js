import{E as g}from"./el-select-d2e1cdef.js";import{a as f}from"./api-0f4679da.js";import{d as h}from"./dayjs.min-5433e12a.js";import{d as v,r as s,c as n,b as a,F as d,e as y,u as r,i as b,o as c,t as l,_ as C}from"./index-494d7300.js";const N={class:"list"},k={class:"text-[#cdcccc] mr-5"},x=["onClick"],P={class:"date"},j={class:"clear-both overflow-hidden py-2"},D=v({__name:"Project",setup(Y){const _=s([]),o=s(1),i=s(1),u=async()=>{const e=await f({parentName:"博客文章",categoryName:"小项目",page:o.value,limit:10});_.value=e.list,o.value=Number(e.currentPage),i.value=Number(e.totalItems)};u();const p=e=>{console.log(`当前页: ${e}`),o.value=e,u()};return(e,$)=>{const m=g;return c(),n(d,null,[a("ul",N,[(c(!0),n(d,null,y(r(_),t=>(c(),n("li",{key:t._id},[a("b",k,"No."+l(t.serialNumber),1),a("h3",{onClick:B=>e.$router.push(`./detail/${t._id}`)},l(t.title),9,x),a("div",P,l(r(h)(t.date).format("YYYY-MM-DD")),1)]))),128))]),a("div",j,[b(m,{class:"float-right",background:"",layout:"prev, pager, next",onCurrentChange:p,total:r(i)},null,8,["total"])])],64)}}});const L=C(D,[["__scopeId","data-v-5fc8238e"]]);export{L as default};
