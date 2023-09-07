/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import{e as o,w as s}from"./p-156967ec.js";import{f as t,s as a}from"./p-b24aa895.js";import{c as r}from"./p-63eb0acd.js";import"./p-1b8e1d03.js";const e=()=>{const e=window;e.addEventListener("statusTap",(()=>{o((()=>{const o=document.elementFromPoint(e.innerWidth/2,e.innerHeight/2);if(!o)return;const n=t(o);n&&new Promise((o=>r(n,o))).then((()=>{s((async()=>{n.style.setProperty("--overflow","hidden"),await a(n,300),n.style.removeProperty("--overflow")}))}))}))}))};export{e as startStatusTap}