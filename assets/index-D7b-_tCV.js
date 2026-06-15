(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();function Ct(e){const t=Ht(e),n=Array.isArray(t.opportunities)?t.opportunities.map(Mt).filter(r=>!!r):[];if(n.length===0)throw new Error("Model response did not include any valid opportunities.");return{summary:typeof t.summary=="string"&&t.summary.trim()?t.summary.trim():"Model generated opportunities.",opportunities:n,generatedBy:"model"}}function Ht(e){const t=Dt(e.trim()),n=t.startsWith("{")?t:t.slice(t.indexOf("{"),t.lastIndexOf("}")+1);if(!n.startsWith("{")||!n.endsWith("}"))throw new Error("Model response did not contain a JSON object.");const r=JSON.parse(n);if(!Ie(r))throw new Error("Model response JSON was not an object.");return r}function Mt(e){if(!Ie(e))return null;const t=C(e.name,"Untitled opportunity"),n=Ot(e.scores);return{id:C(e.id,Nt(t)),name:t,tagline:C(e.tagline,`${t} helps builders evaluate an AI product wedge.`),targetUser:C(e.targetUser,"AI builders"),wedge:C(e.wedge,"turns a noisy AI signal into a concrete product wedge"),differentiator:C(e.differentiator,"transparent scoring and launch-ready exports"),moat:C(e.moat,"a growing library of reusable opportunity examples"),score:q(e.score),scores:n,firstRelease:be(e.firstRelease,["Ship the smallest useful workflow"]),launchPlan:be(e.launchPlan,["Publish a demo and README"]),repoHook:C(e.repoHook,`${t}: a launch-ready AI app opportunity.`),risks:be(e.risks,["The input signal may be too broad"])}}function Ot(e){const t=Ie(e)?e:{};return{pain:q(t.pain),urgency:q(t.urgency),distribution:q(t.distribution),buildability:q(t.buildability),starPotential:q(t.starPotential)}}function Dt(e){return e.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"").trim()}function C(e,t){return typeof e=="string"&&e.trim()?e.trim().slice(0,500):t}function be(e,t){if(!Array.isArray(e))return t;const n=e.filter(r=>typeof r=="string"&&r.trim().length>0).map(r=>r.trim().slice(0,500)).slice(0,8);return n.length>0?n:t}function q(e){const t=typeof e=="number"?e:Number(e);return Number.isFinite(t)?Math.max(1,Math.min(10,Math.round(t))):5}function Nt(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function Ie(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const Y="open-source-star-path",Ae=[{id:Y,name:"Open-source star path",tagline:"Balanced pain, distribution, and visible star potential.",bestFor:"General GitHub launch bets",weights:{pain:.24,urgency:.18,distribution:.24,buildability:.16,starPotential:.18}},{id:"local-first-tool",name:"Local-first tool",tagline:"Rewards no-key utility, setup relief, and fast solo adoption.",bestFor:"Ollama, desktop, CLI, and privacy-friendly tools",weights:{pain:.28,urgency:.16,distribution:.18,buildability:.26,starPotential:.12}},{id:"provider-sdk",name:"Provider SDK",tagline:"Prefers composable APIs, integration hooks, and contributor surface.",bestFor:"SDKs, adapters, and provider migration helpers",weights:{pain:.18,urgency:.14,distribution:.22,buildability:.28,starPotential:.18}},{id:"agent-debugging",name:"Agent debugging",tagline:"Prioritizes urgent failure visibility and explainable workflows.",bestFor:"Agent traces, permissions, evals, and incident review",weights:{pain:.3,urgency:.24,distribution:.14,buildability:.2,starPotential:.12}},{id:"launch-generator",name:"Launch generator",tagline:"Optimizes for shareable artifacts and public distribution loops.",bestFor:"README, gallery, demo, and social launch tools",weights:{pain:.16,urgency:.16,distribution:.3,buildability:.14,starPotential:.24}}],Ut=re(Y);function re(e){return Ae.find(t=>t.id===e)??Ae[0]}const Gt=["Radar","Workbench","Scout","Foundry","Console","Briefing","Studio","Navigator"],Ft=["turns scattered trend notes into ranked product bets","converts a messy launch idea into an issue-by-issue open-source roadmap","compares model, API, and local-first implementation paths before code is written","generates a public README, demo script, and launch checklist from one product brief","scores ideas by pain, urgency, distribution, buildability, and star potential"],jt=["local-first demo mode plus optional OpenAI-compatible and Ollama adapters","opinionated GitHub-readiness scoring instead of generic brainstorm output","launch artifacts that are immediately copyable into issues, README sections, and demos","transparent scoring so users can challenge the ranking instead of trusting a black box","designed for builders who need one sharp wedge, not a list of vague startup ideas"],Bt=["Signal intake with audience, trend, constraints, and channel context","Opportunity scoring matrix with editable assumptions","README hook and launch-plan generator","Provider switcher for demo, OpenAI-compatible APIs, and Ollama","Exportable Markdown brief for GitHub issues and Product Hunt drafts"],qt={en:{productNouns:Gt,wedges:Ft,differentiators:jt,releaseItems:Bt,launchPlan:["Ship a polished 90-second screen recording and a no-login hosted demo.","Open 5 starter issues labeled good-first-opportunity so contributors can extend templates.","Publish a transparent build log explaining why this idea scored well.","Post before/after examples that turn vague AI trends into concrete repos."],risks:["Generic output if the input signal is too broad.","Users may expect business validation beyond a launch-readiness score.","Real model calls need clear privacy expectations for pasted research notes."]},"zh-CN":{productNouns:["雷达","工作台","侦察器","工坊","控制台","简报台","实验室","导航器"],wedges:["把零散趋势笔记整理成可排序的产品机会","把模糊发布想法拆成 issue 级别的开源路线图","在写代码前比较模型、API 和本地优先实现路径","从一份产品简报生成公开 README、demo 脚本和发布清单","按痛点、紧迫性、分发、可构建性和 Star 潜力给想法打分"],differentiators:["本地演示模式加可选 OpenAI 兼容接口和 Ollama 适配","用面向 GitHub 发布的评分替代泛泛的头脑风暴输出","发布素材可以直接复制到 issue、README 和 demo 文案里","评分过程透明，用户可以质疑排名而不是盲信黑盒","为需要一个清晰切入点的开发者设计，而不是生成一堆模糊创业点子"],releaseItems:["输入目标用户、趋势、约束和渠道上下文","用可编辑假设展示机会评分矩阵","生成 README hook 和发布计划","支持本地 demo、OpenAI 兼容 API 和 Ollama 的 Provider 切换","导出可用于 GitHub issue 和 Product Hunt 草稿的 Markdown 简报"],launchPlan:["发布一个打磨过的 90 秒录屏和无需登录的在线 demo。","开放 5 个 good-first-opportunity 新手 issue，方便贡献者扩展模板。","发布透明构建日志，解释为什么这个想法得分高。","发布前后对比示例，把模糊 AI 趋势变成具体仓库。"],risks:["如果输入信号过宽，输出可能变得泛泛。","用户可能期待超出发布就绪评分之外的商业验证。","真实模型调用需要清晰说明粘贴调研笔记时的隐私预期。"]}},nt=Ut.weights;function J(e){return Math.max(1,Math.min(10,Math.round(e)))}function zt(e,t){var r;const n=t==="zh-CN"?/[\u4e00-\u9fff]{2,8}|[a-z0-9-]{5,}/gi:/[a-z0-9-]{5,}/gi;return Array.from(new Set(((r=e.toLowerCase().match(n))==null?void 0:r.map(o=>o.trim()).filter(o=>t==="zh-CN"?o.length>=2:o.length>4).filter(o=>!["there","their","about","would","could","should"].includes(o)))??[])).slice(0,12)}function Wt(e,t){const n=e.constraints.toLowerCase().includes("local")?8:6,r=e.channels.toLowerCase().includes("github")?8:6;return{pain:J(e.pain+t%2-1),urgency:J(e.urgency+t%3-1),distribution:J(e.distribution+t%2),buildability:J(n+(t===0?1:0)-Math.floor(t/3)),starPotential:J(r+(t===1?1:0)-Math.floor(t/4))}}function rt(e,t=nt){return Math.round(Object.entries(t).reduce((n,[r,o])=>n+e[r]*o,0))}function Ee(e,t=nt,n="en"){const r=zt(`${e.audience} ${e.signal} ${e.constraints}`,n),o=r[0]??"ai",s=e.audience.trim()||(n==="zh-CN"?"AI 开发者":"AI builders"),a=qt[n],p=a.productNouns.slice(0,5).map((g,l)=>{const m=n==="zh-CN"?`${_t(o)}${g}`:`${Kt(o)} ${g}`,R=n==="zh-CN"?`${Vt(o)||"ai"}-${l+1}`:`${o}-${g.toLowerCase()}`,P=Wt(e,l),j=rt(P,t);return{id:R,name:m,tagline:n==="zh-CN"?`${m}帮助${s}在写代码前选出更清晰的 AI 产品切入点。`:`${m} helps ${s} choose a sharper AI product wedge before they start building.`,targetUser:s,wedge:a.wedges[l%a.wedges.length],differentiator:a.differentiators[l%a.differentiators.length],moat:n==="zh-CN"?l%2===0?"不断增长的公开评分简报会沉淀成可复用 benchmark。":"工作流把市场信号、实现范围和发布素材连接在一个地方。":l%2===0?"A growing public library of scored launch briefs compounds into a reusable benchmark.":"The workflow connects market signal, implementation scope, and launch assets in one place.",score:j,scores:P,firstRelease:Jt(a.releaseItems,l).slice(0,3),launchPlan:a.launchPlan,repoHook:n==="zh-CN"?`${m}：把趋势噪音转成可排序、可发布到 GitHub 的 AI 应用方案。`:`${m}: an AI opportunity radar that turns trend noise into ranked, GitHub-ready app ideas.`,risks:a.risks}});return p.sort((g,l)=>l.score-g.score),{summary:n==="zh-CN"?`从 ${r.length} 个信号关键词里找到 ${p.length} 个可发布的 AI 应用方向。最高分方向同时具备清晰痛点、快速分发路径和较小的 TypeScript 首版范围。`:`Found ${p.length} launchable AI app directions from ${r.length} extracted signal terms. The top idea balances visible pain, fast distribution loops, and a small TypeScript-first build surface.`,opportunities:p,generatedBy:"local-engine"}}function Jt(e,t){return[...e.slice(t),...e.slice(0,t)]}function Kt(e){return e.charAt(0).toUpperCase()+e.slice(1)}function _t(e){return e.replace(/[^\u4e00-\u9fffa-z0-9-]/gi,"").slice(0,10)||"AI"}function Vt(e){return e.toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,32)}const qe="You are OpenTop, an exacting AI product strategist for open-source TypeScript apps. Return only valid JSON matching { summary: string, opportunities: Opportunity[] } where each Opportunity has id, name, tagline, targetUser, wedge, differentiator, moat, score, scores, firstRelease, launchPlan, repoHook, risks. Scores are 1-10. Keep ids ASCII kebab-case.";async function Zt(e,t,n="en"){if(t.provider==="demo")return Ee(e,void 0,n);const r=Xt(e,t,n),o=await fetch(r.endpoint,{method:"POST",headers:r.headers,body:r.body});if(!o.ok)throw new Error(`Model request failed with ${o.status} ${o.statusText}`);const s=await o.json(),a=nn(s,t.provider);if(!a)throw new Error("Model returned an empty response.");return Ct(a)}function Xt(e,t,n="en"){return ot(t.provider)?Yt(e,t,n):t.provider==="anthropic-vertex"?en(e,t,n):Qt(e,t,n)}function ee(e){return e==="ollama"?"http://localhost:11434/v1/chat/completions":e==="anthropic"?"https://api.anthropic.com/v1/messages":e==="anthropic-bedrock"?"https://bedrock-mantle.us-east-1.api.aws/anthropic/v1/messages":e==="anthropic-vertex"?"https://global-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/publishers/anthropic/models/MODEL:rawPredict":"https://api.openai.com/v1/chat/completions"}function te(e){return e==="ollama"?"llama3.1":e==="anthropic"?"claude-sonnet-4-5":e==="anthropic-bedrock"?"anthropic.claude-haiku-4-5":e==="anthropic-vertex"?"claude-haiku-4-5@20251001":"gpt-4.1-mini"}function Qt(e,t,n){const r=t.model.trim()||te(t.provider);return{endpoint:t.endpoint.trim()||ee(t.provider),headers:{"Content-Type":"application/json",...t.apiKey.trim()?{Authorization:`Bearer ${t.apiKey.trim()}`}:{}},body:JSON.stringify({model:r,temperature:.4,response_format:{type:"json_object"},messages:tn(e,n)})}}function Yt(e,t,n){const r=t.apiKey.trim();return{endpoint:t.endpoint.trim()||ee(t.provider),headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01",...r?{"x-api-key":r}:{}},body:JSON.stringify({model:t.model.trim()||te(t.provider),max_tokens:2600,system:Le(n),messages:[{role:"user",content:JSON.stringify(e)}]})}}function en(e,t,n){const r=t.apiKey.trim(),o=t.model.trim()||te("anthropic-vertex");return{endpoint:on(t.endpoint.trim()||ee("anthropic-vertex"),o),headers:{"Content-Type":"application/json",...r?{Authorization:`Bearer ${r}`}:{}},body:JSON.stringify({anthropic_version:"vertex-2023-10-16",max_tokens:2600,system:Le(n),messages:[{role:"user",content:JSON.stringify(e)}]})}}function tn(e,t){return[{role:"system",content:Le(t)},{role:"user",content:JSON.stringify(e)}]}function Le(e){return e==="zh-CN"?`${qe} Output all user-facing string fields in Simplified Chinese: summary, name, tagline, targetUser, wedge, differentiator, moat, firstRelease, launchPlan, repoHook, and risks. Keep product names concise and natural for Chinese developers.`:`${qe} Output all user-facing string fields in English.`}function nn(e,t){var n,r,o,s;return rn(t)?(n=e.content)==null?void 0:n.filter(a=>a.type==="text"||!a.type).map(a=>a.text).filter(a=>!!a).join(`
`).trim():(s=(o=(r=e.choices)==null?void 0:r[0])==null?void 0:o.message)==null?void 0:s.content}function rn(e){return ot(e)||e==="anthropic-vertex"}function ot(e){return e==="anthropic"||e==="anthropic-bedrock"}function on(e,t){return e.replace(/\bMODEL\b/g,sn(t))}function sn(e){return encodeURIComponent(e).replace(/%40/g,"@")}function an(e,t){return t.map(n=>{const r=e.scores[n.dimension];return{repo:n.repo,url:n.url,sourceUrl:n.sourceUrl,dimension:n.dimension,dimensionLabel:cn(n.dimension),score:r,signal:n.publicSignal,lesson:n.lesson,use:n.openTopUse,alignment:ln(r)}})}function cn(e){return e==="starPotential"?"Star potential":e.replace(/[A-Z]/g,t=>` ${t}`).replace(/^./,t=>t.toUpperCase())}function ln(e){return e>=8?"strong":e>=6?"watch":"gap"}function st(e,t){return`# ${e}

${t.repoHook}

## Why this can work

- Target user: ${t.targetUser}
- Wedge: ${t.wedge}
- Differentiator: ${t.differentiator}
- Moat: ${t.moat}

## First release

${t.firstRelease.map(n=>`- ${n}`).join(`
`)}

## Launch plan

${t.launchPlan.map(n=>`- ${n}`).join(`
`)}
`}function it(e){return`Show HN: ${e.name} - ${e.repoHook}

I built ${e.name} for ${e.targetUser}.

The wedge: ${e.wedge}

Why it is different: ${e.differentiator}

First release scope:
${e.firstRelease.map(t=>`- ${t}`).join(`
`)}

Launch plan:
${e.launchPlan.map(t=>`- ${t}`).join(`
`)}
`}function at(e){const t=e.firstRelease[0]??"Ship one narrow workflow that proves the wedge.",n=fe(e.launchPlan),r=e.risks[0]??"The idea may be too broad for a useful first release.";return`# Build Log: How I Chose ${e.name} Before Writing the Whole App

I am using OpenTop to decide whether ${e.name} is worth building as an open-source AI app before committing to a full implementation.

## Starting Signal

${e.repoHook}

## Target User

${e.targetUser}

## Why This Wedge Is Specific

${e.wedge}

## Score Context

- Overall: ${e.score}/10
- Pain: ${e.scores.pain}/10
- Urgency: ${e.scores.urgency}/10
- Distribution: ${e.scores.distribution}/10
- Buildability: ${e.scores.buildability}/10
- Star potential: ${e.scores.starPotential}/10

## First Slice

${t}

## Launch Path

Primary channel: ${n}

${e.launchPlan.map(o=>`- ${o}`).join(`
`)}

## Risks I Am Watching

${e.risks.map(o=>`- ${o}`).join(`
`)}

The first risk I would ask readers to challenge is: ${r}

## What I Need Feedback On

- Is the target user specific enough?
- Is the first slice small enough to try in one sitting?
- Would the README and demo make you star, try, or ignore the repository?

I will use the answers to tighten the README, starter issues, and launch examples before asking a broader audience for stars.
`}function ct(e){const t=e.firstRelease.slice(0,3).map(r=>`- ${r}`).join(`
`),n=e.risks.slice(0,2).map(r=>`- ${r}`).join(`
`);return`1/ I am building ${e.name}: ${e.repoHook}

2/ Target user:
${e.targetUser}

3/ Wedge:
${e.wedge}

4/ Why it is different:
${e.differentiator}

5/ First release:
${t}

6/ Why it could earn GitHub stars:
Pain ${e.scores.pain}/10, distribution ${e.scores.distribution}/10, star potential ${e.scores.starPotential}/10.

7/ Risks I am watching:
${n}

8/ The goal: a small TypeScript-first AI app that is useful locally, easy to fork, and clear enough to judge from the README.
`}function lt(e){return`Title: I am building ${e.name}, a TypeScript-first AI app for ${e.targetUser}

${e.repoHook}

The problem:
${e.wedge}

What makes it different:
${e.differentiator}

First release scope:
${e.firstRelease.map(t=>`- ${t}`).join(`
`)}

Why I think it has open-source potential:
- Pain: ${e.scores.pain}/10
- Urgency: ${e.scores.urgency}/10
- Distribution: ${e.scores.distribution}/10
- Buildability: ${e.scores.buildability}/10
- Star potential: ${e.scores.starPotential}/10

Risks:
${e.risks.map(t=>`- ${t}`).join(`
`)}

I would like feedback on the first-release scope and whether the wedge is specific enough for a useful GitHub project.
`}function ut(e){const t=e.firstRelease.slice(0,3).map(n=>`- ${n}`).join(`
`);return`# Product Hunt Launch Draft: ${e.name}

## Tagline

${pe(e.repoHook)}

## Short Description

${e.name} helps ${e.targetUser} turn an AI workflow signal into a scoped, launch-ready open-source project plan.

## Maker Comment

I built ${e.name} because ${e.targetUser} often see AI trends, issues, and tool ideas before they know which project is worth shipping.

The demo focuses on one loop: paste a signal, compare opportunities by pain, urgency, distribution, buildability, and star potential, then copy launch artifacts for GitHub.

First release proof:
${t}

I would like feedback on whether the wedge is specific enough and which export would make this more useful before a public GitHub launch.

## Gallery Notes

- Show the score matrix first.
- Show one generated README or launch brief.
- Show the share card or opportunity gallery so visitors can judge output quality quickly.
`}function dt(e){const t=fe(e.launchPlan),n=e.firstRelease[0]??"Ship one narrow workflow that proves the wedge.";return`Subject: ${e.name} - ${e.repoHook}

Hi,

I am launching ${e.name}, a TypeScript-first open-source AI tool for ${e.targetUser}.

The problem: ${e.wedge}

The useful loop:

1. Paste a trend signal, GitHub issue, link list, or product hunch.
2. Compare generated opportunities by pain, urgency, distribution, buildability, and star potential.
3. Copy a README brief, launch brief, repo listing pack, contributor queue, or starter repo plan.

Why it may be useful for your readers:

- It runs locally without requiring an API key.
- It makes the tradeoffs behind an AI project idea visible before code is written.
- It produces GitHub-ready launch and contribution artifacts instead of only brainstorming text.

First release slice: ${n}

Best channel fit: ${t}

I would be grateful for feedback on whether the scoring dimensions match how builders actually decide which AI projects to ship.
`}function pt(e){const t=e.firstRelease[0]??"Ship one narrow workflow that proves the wedge.",n=e.risks[0]??"The wedge is too broad to judge quickly.";return`# 90-Second Demo Script: ${e.name}

## Recording Goal

Show how ${e.name} turns one messy AI product signal into a scored open-source project direction and a launch-ready artifact.

## Timeline

- 0-10s: Open with the problem: ${e.targetUser} need to decide whether an AI app idea is worth building before writing code.
- 10-25s: Paste one trend signal, GitHub issue, link list, or research note into OpenTop.
- 25-45s: Show the ranked opportunities and call out why ${e.name} scored ${e.score}/10.
- 45-60s: Explain the wedge: ${e.wedge}
- 60-75s: Show the first release slice: ${t}
- 75-90s: Copy one launch artifact, then ask viewers to star the repo, try the demo, or comment on the biggest risk: ${n}

## Shot Checklist

- Show the input signal before generating ideas.
- Show the score matrix and selected opportunity.
- Show one copied artifact, such as the README brief, Product Hunt draft, launch kit, or starter repo ZIP.
- End on the GitHub repository or hosted demo URL so viewers know where to act.
`}function ht(e){return`## Problem

${e.repoHook}

## Target user

${e.targetUser}

## Wedge

${e.wedge}

## Why this is different

${e.differentiator}

## First release scope

${e.firstRelease.map(t=>`- [ ] ${t}`).join(`
`)}

## Score

- Overall: ${e.score}/10
- Pain: ${e.scores.pain}/10
- Urgency: ${e.scores.urgency}/10
- Distribution: ${e.scores.distribution}/10
- Buildability: ${e.scores.buildability}/10
- Star potential: ${e.scores.starPotential}/10

## Risks

${e.risks.map(t=>`- ${t}`).join(`
`)}
`}function ft(e){return`# ${e.name} Launch Kit

${e.repoHook}

## Positioning

- Target user: ${e.targetUser}
- Wedge: ${e.wedge}
- Differentiator: ${e.differentiator}
- Moat: ${e.moat}
- Score: ${e.score}/10

## GitHub Repo Listing Pack

${Pe(e).trim()}

## Launch Checklist

- [ ] Add a screenshot or short demo clip above the README fold.
- [ ] Publish a no-login local quick start that works in under 60 seconds.
- [ ] Copy the public launch brief and make every post point to one concrete proof item.
- [ ] Open starter issues from the first-release scope below.
- [ ] Share one concrete before/after example in every launch post.
- [ ] Ask for feedback on the wedge, not on the whole product category.

## Public Launch Brief

${Te(e).trim()}

## 90-Second Demo Script

${pt(e).trim()}

## README Brief

${st(e.name,e).trim()}

## GitHub Issue Body

${ht(e).trim()}

## Contributor Queue

${He(e).trim()}

## Star Growth Plan

${Ce(e).trim()}

## Show HN Draft

${it(e).trim()}

## Build Log Draft

${at(e).trim()}

## X Thread Draft

${ct(e).trim()}

## Reddit Draft

${lt(e).trim()}

## Product Hunt Draft

${ut(e).trim()}

## Newsletter Pitch

${dt(e).trim()}
`}function un(e){const t=e.firstRelease[0]??"Ship one narrow workflow that proves the wedge.",n=e.firstRelease[1]??"Add one example that makes the output easy to judge.",r=fe(e.launchPlan);return{headline:pe(`${e.name}: ${e.repoHook}`),oneLiner:`${e.name} helps ${e.targetUser} ${e.wedge.toLowerCase()}.`,demoStory:[`Before: ${e.targetUser} has a signal but no clear first-release wedge.`,`Action: run ${e.name} and compare ideas by pain, urgency, distribution, buildability, and star potential.`,`After: publish a scoped repository plan with this first slice: ${t}`],proofChecklist:["README first screen names the user, outcome, local quick start, and current demo path.","Screenshot, share card, or generated output is visible before broad launch.",`Starter issue exists for the next slice: ${n}`,"Launch posts link to GitHub, the hosted or fallback demo, and one concrete example."],channelSequence:[`Primary channel: ${r}`,"GitHub: pin the first-release map and label good-first-issue work before posting.","Hacker News or Reddit: lead with the before/after demo story, not a generic AI app claim.","X/Twitter or newsletter: show one generated artifact and invite feedback on the wedge."],followUpLoop:["First 24 hours: answer setup questions and convert repeated confusion into README edits.","First 72 hours: open issues for every useful request and close unclear or broad suggestions with scope notes.","First week: ship one example, one doc improvement, and one contributor-friendly issue from launch feedback."],feedbackAsk:`What would make ${e.name} more useful for ${e.targetUser}: sharper scoring, clearer examples, or a smaller first-release scope?`}}function Te(e){const t=un(e);return`# ${e.name} Public Launch Brief

${t.headline}

## One-Liner

${t.oneLiner}

## Demo Story

${t.demoStory.map(n=>`- ${n}`).join(`
`)}

## Proof Checklist

${t.proofChecklist.map(n=>`- [ ] ${n}`).join(`
`)}

## Channel Sequence

${t.channelSequence.map(n=>`- ${n}`).join(`
`)}

## Follow-Up Loop

${t.followUpLoop.map(n=>`- [ ] ${n}`).join(`
`)}

## Feedback Ask

${t.feedbackAsk}
`}function dn(e){const t=pe(`${e.name}: ${e.repoHook}`),n=gn(e),r="Use the hosted demo URL once it works; until then keep the README Quick Start as the visible fallback.",o=pe(`${e.name} interface showing ${e.targetUser} turning an AI workflow signal into a launch-ready repository plan.`),s=`Start here: ${e.name} first release map`,a=`## Why this repository exists

${e.repoHook}

## First release

${e.firstRelease.map(l=>`- [ ] ${l}`).join(`
`)}

## Good first contribution paths

- Improve README proof for the target user: ${e.targetUser}
- Add one example that demonstrates the wedge: ${e.wedge}
- Open or refine starter issues for docs, examples, provider support, and launch assets.

## Score context

- Overall: ${e.score}/10
- Distribution: ${e.scores.distribution}/10
- Star potential: ${e.scores.starPotential}/10
`,p=[`gh repo edit OWNER/REPO --description ${yn(t)}`,"gh repo edit OWNER/REPO --homepage https://YOUR-DEMO-URL.example.com","gh repo edit OWNER/REPO --enable-issues",`gh repo edit OWNER/REPO ${n.map(l=>`--add-topic ${l}`).join(" ")}`];return{description:t,topics:n,homepageRecommendation:r,socialPreviewAlt:o,pinnedIssueTitle:s,pinnedIssueBody:a,ghCommands:p,checklist:["Description names the outcome, not just the category.","Topics include TypeScript, AI, open-source, and the strongest user workflow.","Homepage points to a working hosted demo before broad launch.","Social preview image or screenshot matches the README first screen.","Pinned issue gives first-time contributors a clear starting point."]}}function Pe(e){const t=dn(e);return`# ${e.name} GitHub Repo Listing Pack

Use this before a public launch so GitHub visitors can understand, search for, and contribute to the repository from the first screen.

## About Description

${t.description}

## Topics

${t.topics.map(n=>`\`${n}\``).join(", ")}

## Homepage

${t.homepageRecommendation}

## Social Preview Alt Text

${t.socialPreviewAlt}

## Pinned Issue

Title: ${t.pinnedIssueTitle}

${t.pinnedIssueBody.trim()}

## GitHub CLI Setup

\`\`\`bash
${t.ghCommands.join(`
`)}
\`\`\`

## Listing Checklist

${t.checklist.map(n=>`- [ ] ${n}`).join(`
`)}
`}function pn(e){const t=fe(e.launchPlan),n=e.firstRelease[0]??"Ship one narrow workflow that proves the wedge.",r=e.firstRelease[1]??"Add one example that makes the workflow easy to judge.",o=e.firstRelease[2]??"Add contributor documentation and starter issues.",s=e.risks[0]??"The wedge may be too broad for visitors to understand quickly.",a=e.scores.distribution>=8?"Strong distribution can still fail if the demo and README do not prove the outcome in the first minute.":"Distribution score is not yet high enough; treat channel testing as required product work.",p=e.scores.starPotential>=8?"High star potential depends on clear proof, not on generic launch copy.":"Star potential needs stronger public proof before a large launch push.";return[{milestone:"1 star",objective:"Make the repository understandable enough for one trusted builder to star after a cold visit.",actions:[`Tighten the first README screen around this hook: ${e.repoHook}`,`Ship the smallest first-release slice: ${n}`,"Add a no-signup quick start and one screenshot or generated output above the fold."],proof:["A new visitor can explain the target user and outcome without reading the full README.","Local install, test, and build commands are visible and current.","At least one trusted target user has reviewed the repository link."],risks:[s,"Do not ask broad audiences for stars before the first-screen proof is clear."]},{milestone:"10 stars",objective:"Turn early feedback into a repeatable public demo and contributor surface.",actions:[`Publish one before/after example for ${e.targetUser}`,`Open starter issues from the contributor queue, starting with: ${r}`,"Share the repository with a small trusted audience and ask for README clarity feedback."],proof:["README links to one concrete example or gallery item.","Issues are enabled with good-first-issue labels and scoped acceptance criteria.","Feedback creates at least one README, example, or first-release improvement."],risks:[a,"Avoid optimizing for comments if the repository is still hard to run."]},{milestone:"100 stars",objective:"Convert the strongest launch channel into a durable acquisition loop.",actions:[`Turn this launch channel into a repeatable post: ${t}`,`Ship the next first-release slice: ${o}`,"Add a short demo video, social preview card, and copied launch posts that point back to GitHub."],proof:["Every public post links to the repository, demo status, and one concrete example.","The repo profile has topics, license, homepage, starter issues, and current badges.","Questions from visitors are converted into docs, examples, or labeled issues."],risks:[p,"A channel spike without a contributor path usually decays after launch day."]},{milestone:"1,000 stars",objective:"Make the project forkable, extensible, and visibly maintained.",actions:["Add templates, provider adapters, examples, or plugin points that let others reuse the core workflow.","Publish a weekly changelog or build note that shows active maintenance and real user problems.","Invite contributors to own docs, examples, provider integrations, and launch benchmark improvements."],proof:["The repository has multiple paths for contribution beyond core code changes.","Examples cover at least three realistic use cases or launch channels.","Maintainer responses convert repeated support questions into durable documentation."],risks:["A larger audience will amplify unclear setup, stale demos, and unsupported provider claims.","Keep scope tight; a broad AI platform pitch is harder to star than a sharp tool."]},{milestone:"10,000 stars",objective:"Become the reference open-source workflow for this specific AI builder problem.",actions:[`Name the category around the wedge: ${e.wedge}`,"Publish comparison docs, migration examples, templates, and a public roadmap that make the project easy to cite.","Create a maintainer loop for triage, releases, docs freshness, security fixes, and community examples."],proof:["External posts can describe the project in one sentence without copying the README.","The project has recurring examples, releases, and contributor activity that do not depend on one launch event.","The repository is safe to recommend: current demo status, license, setup, and contribution paths are visible."],risks:["10k stars require distribution outside the maintainer's network; invest in repeatable proof and references.","Do not chase broad feature requests that weaken the original wedge."]}]}function Ce(e){const t=pn(e);return`# ${e.name} Star Growth Plan

${e.repoHook}

This plan translates the opportunity score into staged GitHub growth work. It is a roadmap for earning trust, contribution, and distribution; it is not a guarantee of stars.

## Score Context

- Overall: ${e.score}/10
- Pain: ${e.scores.pain}/10
- Urgency: ${e.scores.urgency}/10
- Distribution: ${e.scores.distribution}/10
- Buildability: ${e.scores.buildability}/10
- Star potential: ${e.scores.starPotential}/10

${t.map(n=>`## ${n.milestone}

Objective: ${n.objective}

Actions:
${n.actions.map(r=>`- [ ] ${r}`).join(`
`)}

Proof:
${n.proof.map(r=>`- ${r}`).join(`
`)}

Risks:
${n.risks.map(r=>`- ${r}`).join(`
`)}
`).join(`
`)}
`}function hn(e){const t=e.firstRelease.slice(0,3).map((r,o)=>({title:`Build first-release slice ${o+1}: ${r}`,labels:["good-first-issue","first-release","help-wanted"],body:ye({item:e,problem:r,context:e.repoHook,acceptance:["The slice is implemented in a small, reviewable change.","README or example output is updated when user-facing behavior changes.","Local tests and production build pass."]})})),n=[{title:`Add README proof for ${e.name}`,labels:["docs","growth","good-first-issue"],body:ye({item:e,problem:"Improve the first-screen GitHub proof so visitors can understand the wedge before reading the full README.",context:`Focus on this differentiator: ${e.differentiator}`,acceptance:["README includes a current screenshot, GIF, or concrete generated output.","The first screen explains who the project helps and what it produces.","The change avoids private metrics or unsupported star claims."]})},{title:`Create launch example for ${e.targetUser}`,labels:["example","growth","help-wanted"],body:ye({item:e,problem:"Create one realistic example that shows the workflow end-to-end for the target user.",context:`Target user: ${e.targetUser}`,acceptance:["Example input and output are committed under docs or examples.","The example maps back to the scored wedge and launch plan.","The README links to the example from the first half of the page."]})}];return[...t,...n]}function He(e){const t=hn(e);return`# ${e.name} Contributor Queue

${e.repoHook}

Use these issues to make the repository easier to fork, extend, and star. They are intentionally small enough for first-time contributors.

${t.map((n,r)=>`## ${r+1}. ${n.title}

Labels: ${n.labels.map(o=>`\`${o}\``).join(", ")}

${n.body.trim()}
`).join(`
`)}
`}function fn(e){return`# ${e.name} Repository Scaffold

${e.repoHook}

## File Tree

\`\`\`text
${wn(e.name)}/
  README.md
  LICENSE
  package.json
  src/
    index.ts
    app.ts
    scoring.ts
  docs/
    launch-plan.md
    examples.md
  tests/
    scoring.test.ts
  .github/
    workflows/ci.yml
    ISSUE_TEMPLATE/feature_request.yml
\`\`\`

## README Structure

- Product hook: ${e.repoHook}
- Target user: ${e.targetUser}
- Differentiator: ${e.differentiator}
- Install and quick-start path
- One screenshot or SVG share card
- First successful workflow in under 60 seconds

## First Release Scope

${e.firstRelease.map(t=>`- [ ] ${t}`).join(`
`)}

## Starter Issues

${e.launchPlan.map(t=>`- [ ] ${t}`).join(`
`)}

## Risks To Document

${e.risks.map(t=>`- ${t}`).join(`
`)}
`}function fe(e){return e.find(t=>/\b(Hacker News|Product Hunt|Reddit|GitHub|newsletter|X|Twitter)\b/i.test(t))??e[0]??"Share the strongest concrete demo with a developer audience."}function pe(e){const t=e.replace(/\s+/g," ").trim();return t.length<=160?t:`${t.slice(0,157).replace(/\s+\S*$/,"")}...`}function gn(e){const t=`${e.name} ${e.tagline} ${e.wedge} ${e.targetUser}`.toLowerCase().split(/[^a-z0-9]+/).filter(r=>r.length>=4&&!mn.has(r)),n=["ai","typescript","open-source","developer-tools",e.repoHook.match(/\b(local|without an api key|no api key|no signup)\b/i)?"local-first":"ai-tools",e.scores.distribution>=8?"launch-tools":"startup-ideas",e.scores.starPotential>=8?"open-source-growth":"repo-scaffold",...t];return bn(n).slice(0,8)}const mn=new Set(["with","without","from","that","this","into","your","their","builder","builders","developer","developers","workflow","workflows"]);function bn(e){const t=[];for(const n of e){const r=n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,50);!r||t.includes(r)||t.push(r)}return t}function yn(e){return`"${e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}"`}function wn(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function ye({item:e,problem:t,context:n,acceptance:r}){return`## Background

${n}

## Task

${t}

## Acceptance

${r.map(o=>`- [ ] ${o}`).join(`
`)}

## Source Opportunity

- Name: ${e.name}
- Score: ${e.score}/10
- Wedge: ${e.wedge}
- Star potential: ${e.scores.starPotential}/10
`}const $n=["ArrowDown","ArrowRight","ArrowUp","ArrowLeft","Home","End"];function kn(e){return $n.includes(e)}function vn(e,t,n){if(t<=0)return-1;const r=Math.min(Math.max(e,0),t-1);return n==="Home"?0:n==="End"?t-1:n==="ArrowDown"||n==="ArrowRight"?Math.min(r+1,t-1):Math.max(r-1,0)}const gt="en",Sn=[{value:"en",label:"English"},{value:"zh-CN",label:"简体中文"}];function Me(e){return typeof e=="string"&&e.toLowerCase().startsWith("zh")?"zh-CN":"en"}function An(e){return e!=null&&e.some(t=>t.toLowerCase().startsWith("zh"))?"zh-CN":gt}const xn={en:{audience:"solo developers, AI engineers, and open-source maintainers",signal:"Developers are overwhelmed by fast-moving AI APIs, agent frameworks, and local model tooling. They want smaller tools that help them decide what to build, ship fast, and explain the project clearly.",constraints:"Must be TypeScript-first, runnable locally, useful without a paid API key, and easy to publish on GitHub.",channels:"GitHub, Hacker News, Product Hunt, Reddit r/LocalLLaMA, X/Twitter demos, developer newsletters",pain:8,urgency:7,distribution:8},"zh-CN":{audience:"独立开发者、AI 工程师和开源维护者",signal:"AI API、Agent 框架和本地模型工具变化太快，开发者很难判断哪个应用想法值得先做。他们需要一个小工具，把趋势、issue 和调研笔记整理成可比较的开源项目方案。",constraints:"必须使用 TypeScript，能本地运行，不依赖付费 API Key，适合发布到 GitHub。",channels:"GitHub、Hacker News、Product Hunt、Reddit r/LocalLLaMA、中文开发者社区、技术 newsletter",pain:8,urgency:7,distribution:8}};function Oe(e){return xn[e]}const Rn={en:{appTitle:"AI Opportunity Radar",workspaceAria:"OpenTop workspace",currentInferenceMode:"Current inference mode",language:"Language",tryBrief:"Try a brief",importSignals:"Import Trend Signals",trendSignalsLabel:"Paste CSV, bullets, notes, bookmark links, or GitHub issue URLs",trendSignalsPlaceholder:`Local-first AI debugging https://news.ycombinator.com/item?id=4242
<A HREF="https://github.com/example/repo">Agent debugging toolkit</A>
- Reddit: Local model setup is still painful`,useSignals:"Use Signals",readmeAudit:"README Star Audit",githubRepositoryUrl:"GitHub repository URL",pasteOrFetchReadme:"Paste or fetch a project README",fetchReadme:"Fetch README",auditReadme:"Audit README",copyAudit:"Copy Audit",copySprint:"Copy 7-Day Sprint",copyProfile:"Copy Profile",noCriticalGaps:"No critical gaps found. Keep screenshots, examples, and demo links current.",checks:"checks",topFixes:"Top fixes",profileFixes:"Profile fixes",scoringTemplates:"Scoring templates",audience:"Audience",signalBrief:"Signal Brief",constraints:"Constraints",launchChannels:"Launch Channels",pain:"Pain",urgency:"Urgency",distribution:"Distribution",analyze:"Analyze",analyzing:"Analyzing...",modelSettings:"Model Settings",provider:"Provider",endpoint:"Endpoint",apiKey:"API Key",model:"Model",saveSettings:"Save Settings",warmingUp:"warming-up",preparingMap:"Reading the signal brief and preparing the first opportunity map.",opportunityGallery:"Opportunity gallery",proofBeforeSetup:"Proof before setup",load:"Load",openLink:"Open link",selectedWedge:"Selected wedge",scoreExplanation:"Score explanation",scoreMath:"Score math",benchmarkLessons:"Benchmark lessons",benchmarkProof:"Benchmark proof",loadingBenchmarks:"Loading public repo lessons...",benchmarkLoadingNote:"Lessons load from the committed public benchmark JSON.",benchmarkUnavailable:"Benchmark lessons unavailable",benchmarkUnavailableNote:"Could not load public benchmark examples from benchmarks.json.",publicSignal:"Public signal",lesson:"Lesson",openTopUse:"OpenTop use",viewEvidence:"View evidence",publicRepoPatterns:"Patterns from public AI repos",benchmarkNote:"Each benchmark maps to one OpenTop score dimension. No star counts or private metrics are used.",wedge:"Wedge",differentiator:"Differentiator",moat:"Moat",firstRelease:"First Release",launchPlan:"Launch Plan",risks:"Risks",copied:"Copied",downloaded:"Downloaded",rendering:"Rendering...",pngFailed:"PNG failed",buildingZip:"Building ZIP...",noUsableSignals:"No usable signals found",couldNotImportIssues:"Could not import GitHub issues",fetchingReadme:"Fetching README...",couldNotFetchReadme:"Could not fetch README",modelFallback:"Model request failed. Falling back to local analysis.",providerLabels:{demo:"Demo engine","openai-compatible":"API ready",ollama:"Ollama ready",anthropic:"Anthropic ready","anthropic-bedrock":"Bedrock ready","anthropic-vertex":"Vertex ready"},trendLabels:{csv:"CSV rows",notes:"notes","github-issues":"GitHub issues",links:"links"},dimensionLabels:{pain:"pain",urgency:"urgency",distribution:"distribution",buildability:"buildability",starPotential:"star potential"},copyLabels:{"show-hn":"Copy Show HN","product-hunt":"Copy Product Hunt","build-log":"Copy Build Log",newsletter:"Copy Newsletter","demo-script":"Copy Demo Script","github-issue":"Copy GitHub Issue","launch-brief":"Copy Launch Brief","launch-kit":"Copy Launch Kit","contributor-queue":"Copy Contributor Queue","star-plan":"Copy Star Plan","repo-listing":"Copy Repo Listing","x-thread":"Copy X Thread",reddit:"Copy Reddit","repo-scaffold":"Copy Repo Plan","share-url":"Copy Share Link",markdown:"Copy README Brief"}},"zh-CN":{appTitle:"AI 应用选题雷达",workspaceAria:"OpenTop 工作台",currentInferenceMode:"当前推理模式",language:"语言",tryBrief:"试用示例简报",importSignals:"导入趋势信号",trendSignalsLabel:"粘贴 CSV、要点、调研笔记、书签链接或 GitHub issue URL",trendSignalsPlaceholder:`本地优先 AI 调试 https://news.ycombinator.com/item?id=4242
<A HREF="https://github.com/example/repo">Agent 调试工具</A>
- 中文社区：本地模型配置仍然很痛苦`,useSignals:"使用这些信号",readmeAudit:"README Star 审计",githubRepositoryUrl:"GitHub 仓库 URL",pasteOrFetchReadme:"粘贴或抓取项目 README",fetchReadme:"抓取 README",auditReadme:"审计 README",copyAudit:"复制审计结果",copySprint:"复制 7 天冲刺",copyProfile:"复制仓库 Profile",noCriticalGaps:"没有发现关键缺口。继续保持截图、示例和 demo 链接可用。",checks:"项检查",topFixes:"优先修复",profileFixes:"Profile 修复",scoringTemplates:"评分模板",audience:"目标用户",signalBrief:"信号简报",constraints:"约束条件",launchChannels:"发布渠道",pain:"痛点",urgency:"紧迫性",distribution:"分发",analyze:"分析机会",analyzing:"分析中...",modelSettings:"模型设置",provider:"Provider",endpoint:"Endpoint",apiKey:"API Key",model:"模型",saveSettings:"保存设置",warmingUp:"准备中",preparingMap:"正在读取信号简报，并准备第一版机会地图。",opportunityGallery:"机会图库",proofBeforeSetup:"先看证明，再配置环境",load:"载入",openLink:"打开链接",selectedWedge:"当前切入点",scoreExplanation:"评分解释",scoreMath:"评分计算",benchmarkLessons:"基准案例",benchmarkProof:"基准证明",loadingBenchmarks:"正在加载公开仓库案例...",benchmarkLoadingNote:"案例来自仓库中提交的公开 benchmark JSON。",benchmarkUnavailable:"基准案例暂不可用",benchmarkUnavailableNote:"无法从 benchmarks.json 加载公开 benchmark 示例。",publicSignal:"公开信号",lesson:"经验",openTopUse:"OpenTop 用法",viewEvidence:"查看证据",publicRepoPatterns:"公开 AI 仓库里的模式",benchmarkNote:"每个 benchmark 都映射到一个 OpenTop 评分维度，不使用 star 数或私有指标。",wedge:"切入点",differentiator:"差异化",moat:"护城河",firstRelease:"第一版范围",launchPlan:"发布计划",risks:"风险",copied:"已复制",downloaded:"已下载",rendering:"正在渲染...",pngFailed:"PNG 失败",buildingZip:"正在生成 ZIP...",noUsableSignals:"没有找到可用信号",couldNotImportIssues:"无法导入 GitHub issue",fetchingReadme:"正在抓取 README...",couldNotFetchReadme:"无法抓取 README",modelFallback:"模型请求失败，已回退到本地分析。",providerLabels:{demo:"本地演示引擎","openai-compatible":"API 可用",ollama:"Ollama 可用",anthropic:"Anthropic 可用","anthropic-bedrock":"Bedrock 可用","anthropic-vertex":"Vertex 可用"},trendLabels:{csv:"CSV 行",notes:"笔记","github-issues":"GitHub issue",links:"链接"},dimensionLabels:{pain:"痛点",urgency:"紧迫性",distribution:"分发",buildability:"可构建性",starPotential:"Star 潜力"},copyLabels:{"show-hn":"复制 Show HN","product-hunt":"复制 Product Hunt","build-log":"复制构建日志",newsletter:"复制 Newsletter","demo-script":"复制 Demo 脚本","github-issue":"复制 GitHub Issue","launch-brief":"复制发布简报","launch-kit":"复制 Launch Kit","contributor-queue":"复制贡献任务","star-plan":"复制 Star 增长计划","repo-listing":"复制仓库 Profile","x-thread":"复制 X Thread",reddit:"复制 Reddit","repo-scaffold":"复制仓库计划","share-url":"复制分享链接",markdown:"复制 README 简报"}}};function y(e){return Rn[e]}function In(e,t){return{...e,scoringTemplate:{id:t.id,name:t.name,bestFor:t.bestFor,weights:t.weights}}}const En=[{id:"clear-hook",label:"Clear first-screen hook",weight:16,test:e=>/^#\s+\S+/m.test(e)&&/\b(helps|turns|builds|for|without|local|open-source)\b/i.test(e),evidence:"The README opens with a named project and a concrete value proposition.",fix:"Open with one sentence that says who it helps and what outcome they get."},{id:"visual-proof",label:"Visual proof above the fold",weight:14,test:e=>/!\[[^\]]*]\([^)]+\)|<img\b/i.test(e),evidence:"A screenshot, GIF, or image appears in the README.",fix:"Add one current screenshot or 20-40 second GIF before the feature list."},{id:"quick-start",label:"Fast quick start",weight:15,test:e=>/quick\s*start|getting\s*started|install/i.test(e)&&/\b(pnpm|npm|yarn|bun|npx|docker)\s+(install|i|dev|start|run|up|create)\b/i.test(e),evidence:"The README gives visitors copy-paste setup commands.",fix:"Add a Quick Start block with install and run commands that work in under 60 seconds."},{id:"demo-path",label:"Demo path",weight:12,test:e=>/\b(demo|try|preview|playground|live)\b/i.test(e)&&/https?:\/\//i.test(e),evidence:"Visitors can find a hosted demo, preview, or explicit demo status.",fix:"Link a working hosted demo or state the current demo status and local fallback."},{id:"useful-without-signup",label:"Useful without signup",weight:10,test:e=>/\b(no signup|without signup|without an api key|no api key|local-first|runs locally)\b/i.test(e),evidence:"The README reduces adoption friction by saying what works locally.",fix:"State which core workflow runs without signup, cloud setup, or a paid API key."},{id:"examples",label:"Concrete examples",weight:11,test:e=>/\b(example|sample|gallery|screenshot|output|before\/after)\b/i.test(e),evidence:"The README links or shows examples of real output.",fix:"Add one generated example, gallery link, or before/after output."},{id:"contribution-path",label:"Contributor path",weight:10,test:e=>/\b(contribut|good first|starter issue|roadmap|issue)\b/i.test(e),evidence:"The README tells potential contributors where to help.",fix:"Link starter issues, contribution notes, or a short roadmap."},{id:"trust-signals",label:"Trust signals",weight:8,test:e=>/!\[[^\]]*]\([^)]*(badge|shields|actions|license)[^)]*\)|\b(MIT|Apache|BSD|GPL|license)\b/i.test(e),evidence:"Badges or license information are visible.",fix:"Show CI/license badges or add a clear license section."},{id:"share-ready",label:"Share-ready launch copy",weight:4,test:e=>/\b(Hacker News|Show HN|Product Hunt|Reddit|Twitter|X\/Twitter|launch)\b/i.test(e),evidence:"The README connects the project to concrete launch channels.",fix:"Add one short launch note or channel-specific example visitors can share."}],Ln=[{id:"description",label:"Searchable description",weight:16,test:e=>e.description.length>=30,evidence:e=>`Description is ${e.description.length} characters.`,fix:"Add a specific GitHub About description that names the user and outcome."},{id:"homepage",label:"Homepage or demo link",weight:14,test:e=>/^https?:\/\//i.test(e.homepage),evidence:e=>`Homepage points to ${e.homepage}.`,fix:"Add a working homepage, hosted demo, or docs URL in the repository About panel."},{id:"topics",label:"Discovery topics",weight:14,test:e=>e.topics.length>=3,evidence:e=>`Repository has ${e.topics.length} topics: ${e.topics.slice(0,5).join(", ")}.`,fix:"Add at least three GitHub topics that match the audience and AI workflow."},{id:"license",label:"Clear license",weight:12,test:e=>e.license.length>0,evidence:e=>`License is ${e.license}.`,fix:"Add a standard open-source license so visitors know they can use and fork the project."},{id:"issues",label:"Contributor entry points",weight:10,test:e=>e.hasIssues&&e.openIssues>0,evidence:e=>`${e.openIssues} open issue${e.openIssues===1?"":"s"} are visible.`,fix:"Enable issues and open a few starter tasks for docs, examples, providers, or integrations."},{id:"forkability",label:"Forkability signal",weight:10,test:e=>e.forks>0,evidence:e=>`${e.forks} fork${e.forks===1?"":"s"} show reuse interest.`,fix:"Add starter templates, example outputs, or contribution tasks that make forking obvious."},{id:"traction",label:"Initial traction",weight:12,test:e=>e.stars>0,evidence:e=>`${e.stars} star${e.stars===1?"":"s"} are visible.`,fix:"Share the repository with a small trusted audience to get the first stars and feedback."},{id:"active",label:"Active repository",weight:12,test:e=>!e.archived,evidence:()=>"Repository is not archived.",fix:"Unarchive the repository before asking visitors to try, star, or contribute."}];function mt(e){const t=e.trim(),n=t.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);if(n)return We(n[1],n[2]);let r;try{r=new URL(t)}catch{return null}if(r.hostname!=="github.com")return null;const[o,s]=r.pathname.replace(/^\/+|\/+$/g,"").split("/").map(a=>a.trim()).filter(Boolean);return!o||!s?null:We(o,s.replace(/\.git$/i,""))}async function Tn(e,t=fetch){const n=mt(e);if(!n)throw new Error("Paste a GitHub repository URL like https://github.com/owner/repo or owner/repo.");const r=await t(n.apiUrl,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)throw new Error(`Could not fetch README for ${n.owner}/${n.repo}: ${r.status}`);const o=await r.json(),s=jn(o);if(!s)throw new Error(`GitHub did not return a readable README for ${n.owner}/${n.repo}.`);return{reference:n,readme:s}}async function Pn(e,t=fetch){const n=mt(e);if(!n)throw new Error("Paste a GitHub repository URL like https://github.com/owner/repo or owner/repo.");const r=await t(`https://api.github.com/repos/${n.owner}/${n.repo}`,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)throw new Error(`Could not fetch repository profile for ${n.owner}/${n.repo}: ${r.status}`);return Cn(Bn(await r.json()))}function ze(e){const t=e.trim(),n=En.map(l=>{const m=t.length>0&&l.test(t);return{id:l.id,label:l.label,passed:m,weight:l.weight,evidence:m?l.evidence:"Missing or too hard to find in the first README pass.",fix:l.fix}}),r=n.reduce((l,m)=>l+m.weight,0),o=n.reduce((l,m)=>l+(m.passed?m.weight:0),0),s=t.length===0?0:Math.round(o/r*100),a=Nn(s),p=n.filter(l=>l.passed).length,g=n.filter(l=>!l.passed).sort((l,m)=>m.weight-l.weight).slice(0,3);return{score:s,grade:a,summary:Un(s,g),passedCount:p,totalCount:n.length,items:n,topFixes:g}}function Cn(e){const t=Ln.map(a=>{const p=a.test(e);return{id:a.id,label:a.label,passed:p,weight:a.weight,evidence:p?a.evidence(e):"Missing or too weak for a first-pass GitHub visitor.",fix:a.fix}}),n=t.reduce((a,p)=>a+p.weight,0),r=t.reduce((a,p)=>a+(p.passed?p.weight:0),0),o=Math.round(r/n*100),s=t.filter(a=>!a.passed).sort((a,p)=>p.weight-a.weight).slice(0,3);return{score:o,grade:Gn(o),summary:Fn(o,s),stats:e,items:t,topFixes:s}}function Hn(e){const t=e.items.map(r=>`- ${r.passed?"[x]":"[ ]"} ${r.label}: ${r.passed?r.evidence:r.fix}`).join(`
`),n=e.topFixes.length>0?e.topFixes.map((r,o)=>`${o+1}. ${r.fix}`).join(`
`):"No critical gaps found. Keep examples and screenshots current as the product changes.";return`# README Star Audit

Score: ${e.score}/100
Grade: ${e.grade}

${e.summary}

## Top Fixes

${n}

## Checklist

${t}
`}function Mn(e){const t=e.items.map(r=>`- ${r.passed?"[x]":"[ ]"} ${r.label}: ${r.passed?r.evidence:r.fix}`).join(`
`),n=e.topFixes.length>0?e.topFixes.map((r,o)=>`${o+1}. ${r.fix}`).join(`
`):"No critical repository profile gaps found. Keep the demo URL, topics, and starter issues current.";return`# GitHub Star Profile

Score: ${e.score}/100
Grade: ${e.grade}

${e.summary}

## Repository Snapshot

- Stars: ${e.stats.stars}
- Forks: ${e.stats.forks}
- Open issues: ${e.stats.openIssues}
- Topics: ${e.stats.topics.length>0?e.stats.topics.join(", "):"none"}
- License: ${e.stats.license||"none"}
- Homepage: ${e.stats.homepage||"none"}

## Top Fixes

${n}

## Checklist

${t}
`}function On(e,t){const n=e.topFixes.map(l=>l.fix),r=(t==null?void 0:t.topFixes.map(l=>l.fix))??[],o=[...n,...r],s=["Refresh the first-screen hook, screenshot, quick start, and demo status.","Open starter issues that are specific enough for first-time contributors.","Share the repository with a small trusted audience before a broad launch."],a=o.length>0?o:s,p=t?`, profile ${t.score}/100 ${t.grade}`:"",g=o.length>0?"Focus the next 7 days on the highest-weight gaps before asking a broad audience for stars.":"The audit is launch-ready; use the next 7 days to keep proof fresh and convert visitors into contributors.";return{title:"7-Day Star Readiness Sprint",scoreline:`README ${e.score}/100 ${e.grade}${p}`,summary:g,days:[{day:1,title:"First-screen proof",tasks:[a[0],"Move the clearest screenshot, demo status, and one-sentence value proposition above long feature lists."],proof:"A cold visitor can say who the project helps and what it produces in under one minute."},{day:2,title:"Quick start and local trust",tasks:[a[1]??s[0],"Run the documented setup locally and update commands, prerequisites, and no-key fallback text."],proof:"The README quick start works from a clean checkout and does not depend on a paid API key."},{day:3,title:"GitHub profile metadata",tasks:[r[0]??"Check the repository About description, homepage, topics, license, and issue visibility.","Apply the repo listing pack before sending launch traffic to GitHub."],proof:"GitHub About metadata matches the README hook and gives search/discovery context."},{day:4,title:"Examples and share proof",tasks:[a[2]??s[1],"Add one concrete example, gallery item, or before/after output that a launch post can cite."],proof:"A public post can link to a real output, not just a promise."},{day:5,title:"Contributor entry points",tasks:[r[1]??"Open or refresh small good-first issues with acceptance criteria.","Pin or link the first-release map so new contributors know where to start."],proof:"A new contributor can pick one issue without asking for project context."},{day:6,title:"Launch copy rehearsal",tasks:["Generate Show HN, X, Reddit, and newsletter copy from the strongest opportunity.","Ask for feedback on the wedge and first-release scope, not a generic star request."],proof:"Each launch draft includes the hook, one example, demo/local fallback, and GitHub link."},{day:7,title:"Launch gate",tasks:["Run local tests, production build, and the publish check.","Share first with a small trusted group, then update README or issues from their feedback before broader distribution."],proof:"The repository is runnable, understandable, and ready for public traffic."}],launchGate:["README score is 82+ or all top fixes have owners.",t?"Repository profile score is 82+ or all profile top fixes have owners.":"Repository profile has been fetched and reviewed.","Hosted demo works, or README clearly states demo status and local fallback.","At least three starter issues are open and scoped.","Launch copy points to proof, not unsupported star claims."]}}function Dn(e,t){const n=On(e,t);return`# ${n.title}

${n.scoreline}

${n.summary}

${n.days.map(r=>`## Day ${r.day}: ${r.title}

${r.tasks.map(o=>`- [ ] ${o}`).join(`
`)}

Proof: ${r.proof}
`).join(`
`)}
## Launch Gate

${n.launchGate.map(r=>`- [ ] ${r}`).join(`
`)}
`}function Nn(e){return e>=82?"launch-ready":e>=58?"promising":"needs-work"}function Un(e,t){return e===0?"Paste a README to score its GitHub star-readiness.":t.length===0?"This README already gives visitors a clear reason to try, trust, and share the project.":`The README has a usable foundation. The fastest lift is: ${t.map(n=>n.label).join(", ")}.`}function Gn(e){return e>=82?"growth-ready":e>=58?"promising":"needs-foundation"}function Fn(e,t){return t.length===0?"The repository profile has the public metadata, trust, and contributor signals needed for a stronger launch.":e<40?`The repository profile needs foundation work before a serious star push. Start with: ${t.map(n=>n.label).join(", ")}.`:`The repository profile has some launch signal. The fastest public lift is: ${t.map(n=>n.label).join(", ")}.`}function We(e,t){return{owner:e,repo:t,displayUrl:`https://github.com/${e}/${t}`,apiUrl:`https://api.github.com/repos/${e}/${t}/readme`}}function jn(e){if(!e||typeof e!="object")return"";const t=e,n=typeof t.content=="string"?t.content:"",r=typeof t.encoding=="string"?t.encoding.toLowerCase():"";return!n||r!=="base64"?"":qn(n.replace(/\s+/g,""))}function Bn(e){const t=e&&typeof e=="object"?e:{},n=t.license&&typeof t.license=="object"?t.license:{};return{description:se(t.description),homepage:se(t.homepage),topics:Array.isArray(t.topics)?t.topics.filter(r=>typeof r=="string"):[],stars:we(t.stargazers_count),forks:we(t.forks_count),openIssues:we(t.open_issues_count),license:se(n.spdx_id)||se(n.name),hasIssues:t.has_issues===!0,archived:t.archived===!0}}function se(e){return typeof e=="string"?e.trim():""}function we(e){return typeof e=="number"&&Number.isFinite(e)?Math.max(0,Math.round(e)):0}function qn(e){try{return decodeURIComponent(Array.from(atob(e),t=>`%${t.charCodeAt(0).toString(16).padStart(2,"0")}`).join(""))}catch{return""}}const Je=new TextEncoder,bt=33,yt=0;let K=null;function G(e){return nr(e.name)||"opentop-scaffold"}function zn(e){const t=G(e),n=t.toLowerCase();return[{path:`${t}/README.md`,content:Kn(e)},{path:`${t}/LICENSE`,content:`MIT License

Copyright (c) 2026 ${e.name}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`},{path:`${t}/package.json`,content:`${JSON.stringify({name:n,version:"0.1.0",description:e.tagline,type:"module",private:!1,packageManager:"pnpm@10.0.0",scripts:{build:"tsc --noEmit",test:"tsx --test tests/*.test.ts",check:"pnpm test && pnpm build"},keywords:["ai","typescript","open-source"],license:"MIT",devDependencies:{"@types/node":"^22.0.0",tsx:"^4.19.0",typescript:"^5.8.3"}},null,2)}
`},{path:`${t}/tsconfig.json`,content:`{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "tests"]
}
`},{path:`${t}/src/index.ts`,content:`import { buildLaunchChecklist, opportunity } from "./app.js";
import { scoreOpportunity } from "./scoring.js";

const score = scoreOpportunity(opportunity.scores);

console.log(\`\${opportunity.name}: \${score}/10\`);
console.log(buildLaunchChecklist().join("\\n"));
`},{path:`${t}/src/app.ts`,content:`export const opportunity = {
  name: ${JSON.stringify(e.name)},
  tagline: ${JSON.stringify(e.tagline)},
  targetUser: ${JSON.stringify(e.targetUser)},
  wedge: ${JSON.stringify(e.wedge)},
  differentiator: ${JSON.stringify(e.differentiator)},
  firstRelease: ${JSON.stringify(e.firstRelease,null,2)},
  launchPlan: ${JSON.stringify(e.launchPlan,null,2)},
  scores: ${JSON.stringify(e.scores,null,2)}
} as const;

export function buildLaunchChecklist(): string[] {
  return [
    "Validate the wedge with 3 target users.",
    ...opportunity.firstRelease.map((item) => \`Ship: \${item}\`),
    ...opportunity.launchPlan.map((item) => \`Launch: \${item}\`)
  ];
}
`},{path:`${t}/src/scoring.ts`,content:`export interface ScoreBreakdown {
  pain: number;
  urgency: number;
  distribution: number;
  buildability: number;
  starPotential: number;
}

const weights: Record<keyof ScoreBreakdown, number> = {
  pain: 0.26,
  urgency: 0.18,
  distribution: 0.22,
  buildability: 0.16,
  starPotential: 0.18
};

export function scoreOpportunity(scores: ScoreBreakdown): number {
  const weighted = Object.entries(weights).reduce((total, [key, weight]) => {
    const value = clampScore(scores[key as keyof ScoreBreakdown]);
    return total + value * weight;
  }, 0);

  return Math.round(weighted);
}

function clampScore(value: number): number {
  return Math.min(10, Math.max(1, Number.isFinite(value) ? value : 1));
}
`},{path:`${t}/tests/scoring.test.ts`,content:`import assert from "node:assert/strict";
import { test } from "node:test";
import { scoreOpportunity } from "../src/scoring.js";

test("scoreOpportunity returns a bounded public score", () => {
  const score = scoreOpportunity({
    pain: 10,
    urgency: 8,
    distribution: 9,
    buildability: 7,
    starPotential: 8
  });

  assert.equal(score, 9);
});
`},{path:`${t}/docs/launch-plan.md`,content:`# Launch Plan

${e.launchPlan.map(r=>`- [ ] ${r}`).join(`
`)}

## Risks to watch

${e.risks.map(r=>`- ${r}`).join(`
`)}
`},{path:`${t}/docs/examples.md`,content:`# Examples

Use this file to collect screenshots, prompts, command output, and before/after examples.

## First release scope

${e.firstRelease.map(r=>`- ${r}`).join(`
`)}
`},{path:`${t}/.github/workflows/ci.yml`,content:`name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: corepack enable
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
`},{path:`${t}/.github/ISSUE_TEMPLATE/feature_request.yml`,content:`name: Feature request
description: Propose a focused improvement.
title: "[Feature]: "
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: What user pain should this solve?
    validations:
      required: true
  - type: textarea
    id: scope
    attributes:
      label: First release scope
      description: What is the smallest useful version?
    validations:
      required: true
`}]}function Wn(e){return new Blob([Jn(e)],{type:"application/zip"})}function Jn(e){return _n(zn(e))}function Kn(e){return`# ${e.name}

${e.repoHook}

## Target user

${e.targetUser}

## Wedge

${e.wedge}

## Why this is different

${e.differentiator}

## Quick start

\`\`\`bash
pnpm install
pnpm test
pnpm build
\`\`\`

## First release

${e.firstRelease.map(t=>`- [ ] ${t}`).join(`
`)}

## Launch plan

${e.launchPlan.map(t=>`- [ ] ${t}`).join(`
`)}
`}function _n(e){const t=[],n=[];let r=0;for(const p of e){const g=tr(p.path),l=Je.encode(g),m=Je.encode(p.content),R=Yn(m),P=Vn(l.length,m.length,R),j=Zn(l.length,m.length,R,r);t.push(P,l,m),n.push(j,l),r+=P.length+l.length+m.length}const o=r,s=n.reduce((p,g)=>p+g.length,0),a=Xn(e.length,s,o);return Qn([...t,...n,a])}function Vn(e,t,n){const r=new Uint8Array(30),o=new DataView(r.buffer);return o.setUint32(0,67324752,!0),o.setUint16(4,20,!0),o.setUint16(6,0,!0),o.setUint16(8,0,!0),o.setUint16(10,yt,!0),o.setUint16(12,bt,!0),o.setUint32(14,n,!0),o.setUint32(18,t,!0),o.setUint32(22,t,!0),o.setUint16(26,e,!0),o.setUint16(28,0,!0),r}function Zn(e,t,n,r){const o=new Uint8Array(46),s=new DataView(o.buffer);return s.setUint32(0,33639248,!0),s.setUint16(4,20,!0),s.setUint16(6,20,!0),s.setUint16(8,0,!0),s.setUint16(10,0,!0),s.setUint16(12,yt,!0),s.setUint16(14,bt,!0),s.setUint32(16,n,!0),s.setUint32(20,t,!0),s.setUint32(24,t,!0),s.setUint16(28,e,!0),s.setUint16(30,0,!0),s.setUint16(32,0,!0),s.setUint16(34,0,!0),s.setUint16(36,0,!0),s.setUint32(38,0,!0),s.setUint32(42,r,!0),o}function Xn(e,t,n){const r=new Uint8Array(22),o=new DataView(r.buffer);return o.setUint32(0,101010256,!0),o.setUint16(4,0,!0),o.setUint16(6,0,!0),o.setUint16(8,e,!0),o.setUint16(10,e,!0),o.setUint32(12,t,!0),o.setUint32(16,n,!0),o.setUint16(20,0,!0),r}function Qn(e){const t=e.reduce((o,s)=>o+s.length,0),n=new Uint8Array(t);let r=0;for(const o of e)n.set(o,r),r+=o.length;return n}function Yn(e){const t=er();let n=4294967295;for(const r of e)n=n>>>8^t[(n^r)&255];return(n^4294967295)>>>0}function er(){if(K)return K;K=new Uint32Array(256);for(let e=0;e<256;e+=1){let t=e;for(let n=0;n<8;n+=1)t=t&1?3988292384^t>>>1:t>>>1;K[e]=t>>>0}return K}function tr(e){return e.replace(/\\/g,"/").replace(/^\/+/,"")}function nr(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,64)}const rr=[{id:"local-model-debugger",title:"Local model debugger",input:{audience:"developers building with Ollama, llama.cpp, and local model wrappers",signal:"Local AI stacks are powerful but difficult to debug. Developers need a small tool that captures prompt, model, parameters, latency, and output drift.",constraints:"TypeScript, local-first, no cloud account, browser UI, exportable runs",channels:"GitHub, Reddit r/LocalLLaMA, Hacker News, Discord communities",pain:9,urgency:8,distribution:8}},{id:"agent-trace-notebook",title:"Agent trace notebook",input:{audience:"developers building AI agents and workflow automations",signal:"Agent failures are hard to explain because tool calls, intermediate state, retries, and model outputs are scattered across logs.",constraints:"TypeScript, file-based storage, Markdown export, works with any framework",channels:"GitHub, AI engineering newsletters, X/Twitter demos, framework Discords",pain:8,urgency:9,distribution:7}},{id:"prompt-regression-lab",title:"Prompt regression lab",input:{audience:"product engineers shipping LLM features",signal:"Teams change prompts often but lack lightweight regression checks for important user scenarios, tone, refusal behavior, and JSON shape.",constraints:"TypeScript, CLI plus web UI, supports OpenAI-compatible APIs and local mock mode",channels:"GitHub, DevTools communities, Product Hunt, engineering blogs",pain:8,urgency:8,distribution:8}},{id:"readme-positioning-assistant",title:"README positioning assistant",input:{audience:"open-source maintainers launching developer tools",signal:"Useful repositories get ignored when the README fails to explain the wedge, install path, screenshot, and first successful outcome in the first screen.",constraints:"TypeScript, no backend, paste existing README, export patch suggestions",channels:"GitHub, Hacker News, maintainer communities, launch newsletters",pain:7,urgency:7,distribution:9}},{id:"rag-fixture-builder",title:"RAG fixture builder",input:{audience:"engineers building retrieval-augmented generation features for support, docs, and internal knowledge bases",signal:"Teams ship RAG prototypes quickly but struggle to create repeatable fixtures that catch retrieval drift, citation mistakes, stale chunks, and prompt changes before customers notice.",constraints:"TypeScript, local document fixtures, works with any vector database, exports JSONL test cases",channels:"GitHub, LangChain and LlamaIndex communities, AI engineering newsletters, DevTools Slack groups",pain:9,urgency:8,distribution:8}},{id:"llm-cost-watch",title:"LLM cost watch",input:{audience:"startup engineers and maintainers running OpenAI-compatible, Anthropic, and local model workloads",signal:"Small teams lose track of token spend, latency, fallback behavior, and provider mix across AI features because logs are fragmented and dashboards are too heavyweight.",constraints:"TypeScript, browser dashboard, CSV import, no hosted backend, redacts prompts by default",channels:"GitHub, SaaS engineering blogs, Hacker News, FinOps communities, X/Twitter demos",pain:8,urgency:9,distribution:8}},{id:"provider-migration-copilot",title:"Provider migration copilot",input:{audience:"developers moving AI apps between OpenAI-compatible APIs, Anthropic, Ollama, OpenRouter, and cloud gateways",signal:"AI teams need to switch providers for cost, latency, compliance, or model quality, but each migration breaks request shapes, streaming behavior, JSON mode, tool calls, and eval baselines.",constraints:"TypeScript, adapter checklist, request diff viewer, no secrets stored, generates migration issues",channels:"GitHub, provider Discords, AI SDK communities, Reddit r/LocalLLaMA, developer newsletters",pain:8,urgency:8,distribution:9}},{id:"agent-permission-simulator",title:"Agent permission simulator",input:{audience:"developers adding tool-using agents to internal apps, CLIs, and developer workflows",signal:"Agent products need clear permission boundaries, but teams often discover risky file, shell, browser, or API actions only after a bad tool call reaches production.",constraints:"TypeScript, local-only policy simulator, scenario fixtures, Markdown reports, no live destructive actions",channels:"GitHub, security engineering communities, AI agent newsletters, Hacker News, framework Discords",pain:9,urgency:8,distribution:7}},{id:"eval-report-publisher",title:"Eval report publisher",input:{audience:"AI product teams that run prompt, model, or agent evaluations but struggle to communicate results",signal:"Evaluation runs often stay trapped in notebooks or vendor dashboards. Teams need a lightweight way to turn eval outputs into readable changelogs, scorecards, and GitHub-ready release notes.",constraints:"TypeScript, imports JSON/CSV eval runs, static HTML export, share cards, works without a model API",channels:"GitHub, Product Hunt, AI engineering blogs, DevTools communities, maintainer newsletters",pain:7,urgency:8,distribution:9}},{id:"agent-memory-inspector",title:"Agent memory inspector",input:{audience:"developers shipping long-running agents with vector memory, summaries, and user-specific context",signal:"Agent memory failures are subtle: stale facts, over-retained private data, duplicate memories, and missing citations often surface only after users complain.",constraints:"TypeScript, local-first inspection UI, imports JSON logs, redacts sensitive values, exports reproducible memory bug reports",channels:"GitHub, AI agent communities, security engineering newsletters, Hacker News, framework Discords",pain:9,urgency:8,distribution:8}},{id:"local-vector-index-doctor",title:"Local vector index doctor",input:{audience:"engineers running local RAG prototypes with SQLite, LanceDB, Chroma, or file-backed vector indexes",signal:"Local retrieval demos often decay when chunks change, embeddings are regenerated, filters break, or index files drift from the source documents.",constraints:"TypeScript, no hosted backend, scans local index metadata, compares source files, writes repair checklists",channels:"GitHub, Reddit r/LocalLLaMA, LangChain communities, docs engineering forums, DevTools newsletters",pain:8,urgency:8,distribution:8}},{id:"model-routing-playground",title:"Model routing playground",input:{audience:"developers deciding when to route requests between cheap, fast, local, and high-quality models",signal:"Teams want smaller model bills without degrading user-visible answers, but routing experiments are scattered across spreadsheets, logs, and provider dashboards.",constraints:"TypeScript, local demo mode, imports request samples, compares latency/cost/quality notes, no secrets in exports",channels:"GitHub, SaaS engineering blogs, AI infrastructure newsletters, FinOps communities, X/Twitter demos",pain:8,urgency:9,distribution:8}},{id:"ai-release-risk-reviewer",title:"AI release risk reviewer",input:{audience:"engineering teams preparing releases that change prompts, models, retrieval data, or agent tools",signal:"AI releases fail in ways normal changelogs miss: prompt regressions, changed refusal behavior, broken JSON contracts, and new tool permissions.",constraints:"TypeScript, imports release notes and eval summaries, produces GitHub checklist, works without model API",channels:"GitHub, DevOps communities, AI engineering newsletters, internal platform teams, Hacker News",pain:8,urgency:8,distribution:7}},{id:"support-thread-signal-miner",title:"Support thread signal miner",input:{audience:"founders and maintainers turning support tickets, Discord threads, and GitHub discussions into AI product ideas",signal:"Useful product signals are buried in repeated setup questions, confusing errors, integration requests, and workaround threads across support channels.",constraints:"TypeScript, paste-only import, local clustering, no customer data upload, exports opportunity briefs and starter issues",channels:"GitHub, founder communities, support engineering blogs, Product Hunt, developer newsletters",pain:8,urgency:7,distribution:9}},{id:"mcp-server-contract-tester",title:"MCP server contract tester",input:{audience:"developers exposing internal tools, data sources, and automation APIs through MCP servers",signal:"MCP servers are easy to prototype but hard to trust because schema drift, auth assumptions, tool side effects, and model-facing descriptions often break after small changes.",constraints:"TypeScript, local test harness, records tool schemas, mocks dangerous calls, exports GitHub-ready regression reports",channels:"GitHub, MCP communities, AI agent newsletters, DevTools blogs, Hacker News",pain:9,urgency:8,distribution:8}},{id:"ai-coding-agent-pr-triage",title:"AI coding agent PR triage",input:{audience:"open-source maintainers receiving AI-generated pull requests, issue fixes, and automated refactors",signal:"Maintainers need a fast way to separate useful AI-generated contributions from risky churn, missing tests, broad rewrites, and changes that ignore project conventions.",constraints:"TypeScript, GitHub issue and diff import, local scoring, no repository write access, exports review checklists",channels:"GitHub, maintainer communities, AI coding newsletters, DevTools forums, Hacker News",pain:8,urgency:8,distribution:9}}],or=[S("local-model-debugger","本地模型调试器","使用 Ollama、llama.cpp 和本地模型封装的开发者","本地 AI 栈很强，但调试很难。开发者需要一个小工具记录 prompt、模型、参数、延迟和输出漂移。","TypeScript、本地优先、无需云账号、浏览器 UI、可导出运行记录","GitHub、Reddit r/LocalLLaMA、Hacker News、Discord 社区",9,8,8),S("agent-trace-notebook","Agent Trace 笔记本","构建 AI Agent 和自动化工作流的开发者","Agent 失败很难解释，因为工具调用、中间状态、重试和模型输出分散在日志里。","TypeScript、文件存储、Markdown 导出、兼容任意框架","GitHub、AI 工程 newsletter、X/Twitter demo、框架 Discord",8,9,7),S("prompt-regression-lab","Prompt 回归实验室","交付 LLM 功能的产品工程师","团队频繁修改 prompt，却缺少轻量回归检查来覆盖关键场景、语气、拒答行为和 JSON 结构。","TypeScript、CLI 加 Web UI、支持 OpenAI 兼容 API 和本地 mock 模式","GitHub、DevTools 社区、Product Hunt、工程博客",8,8,8),S("readme-positioning-assistant","README 定位助手","发布开发者工具的开源维护者","很多有用仓库被忽略，是因为 README 首屏没有讲清切入点、安装路径、截图和首次成功结果。","TypeScript、无后端、粘贴现有 README、导出修复建议","GitHub、Hacker News、维护者社区、发布 newsletter",7,7,9),S("rag-fixture-builder","RAG Fixture 生成器","为支持、文档和内部知识库构建 RAG 功能的工程师","团队能快速做出 RAG 原型，但很难创建可复现 fixture 来发现检索漂移、引用错误、过期 chunk 和 prompt 变化。","TypeScript、本地文档 fixture、兼容任意向量库、导出 JSONL 测试用例","GitHub、LangChain 和 LlamaIndex 社区、AI 工程 newsletter、DevTools Slack",9,8,8),S("llm-cost-watch","LLM 成本观察台","运行 OpenAI 兼容、Anthropic 和本地模型工作负载的创业团队工程师和维护者","小团队很难跨 AI 功能跟踪 token 成本、延迟、fallback 行为和 provider 组合，因为日志分散、仪表盘又太重。","TypeScript、浏览器仪表盘、CSV 导入、无托管后端、默认脱敏 prompt","GitHub、SaaS 工程博客、Hacker News、FinOps 社区、X/Twitter demo",8,9,8),S("provider-migration-copilot","Provider 迁移 Copilot","在 OpenAI 兼容 API、Anthropic、Ollama、OpenRouter 和云网关之间迁移 AI 应用的开发者","AI 团队因为成本、延迟、合规或模型质量切换 provider，但迁移会打破请求结构、流式行为、JSON mode、工具调用和 eval 基线。","TypeScript、适配清单、请求 diff 查看器、不存储密钥、生成迁移 issue","GitHub、provider Discord、AI SDK 社区、Reddit r/LocalLLaMA、开发者 newsletter",8,8,9),S("agent-permission-simulator","Agent 权限模拟器","为内部应用、CLI 和开发者工作流加入工具型 Agent 的开发者","Agent 产品需要清晰权限边界，但团队常在危险文件、shell、浏览器或 API 调用进入生产后才发现问题。","TypeScript、本地策略模拟器、场景 fixture、Markdown 报告、不执行真实破坏操作","GitHub、安全工程社区、AI Agent newsletter、Hacker News、框架 Discord",9,8,7),S("eval-report-publisher","Eval 报告发布器","运行 prompt、模型或 Agent eval 但难以沟通结果的 AI 产品团队","Eval 结果常被困在 notebook 或厂商仪表盘里。团队需要轻量方式把结果转成可读 changelog、scorecard 和 GitHub release notes。","TypeScript、导入 JSON/CSV eval、静态 HTML 导出、分享卡片、不依赖模型 API","GitHub、Product Hunt、AI 工程博客、DevTools 社区、维护者 newsletter",7,8,9),S("agent-memory-inspector","Agent 记忆检查器","交付带向量记忆、摘要和用户上下文的长期运行 Agent 的开发者","Agent 记忆问题很隐蔽：过期事实、过度保留隐私数据、重复记忆和缺少引用，通常在用户投诉后才暴露。","TypeScript、本地优先检查 UI、导入 JSON 日志、脱敏敏感值、导出可复现记忆 bug 报告","GitHub、AI Agent 社区、安全工程 newsletter、Hacker News、框架 Discord",9,8,8),S("local-vector-index-doctor","本地向量索引医生","使用 SQLite、LanceDB、Chroma 或文件型向量索引运行本地 RAG 原型的工程师","本地检索 demo 会因为 chunk 变化、embedding 重建、过滤器损坏或索引文件与源文档漂移而失效。","TypeScript、无托管后端、扫描本地索引元数据、比较源文件、写出修复清单","GitHub、Reddit r/LocalLLaMA、LangChain 社区、文档工程论坛、DevTools newsletter",8,8,8),S("model-routing-playground","模型路由实验场","决定何时在便宜、快速、本地和高质量模型之间路由请求的开发者","团队想降低模型账单又不降低用户可见答案质量，但路由实验分散在表格、日志和 provider 仪表盘里。","TypeScript、本地 demo 模式、导入请求样本、比较延迟/成本/质量备注、导出不含密钥","GitHub、SaaS 工程博客、AI 基础设施 newsletter、FinOps 社区、X/Twitter demo",8,9,8),S("ai-release-risk-reviewer","AI 发布风险审查器","准备发布 prompt、模型、检索数据或 Agent 工具变更的工程团队","AI 发布会以普通 changelog 捕捉不到的方式失败：prompt 回归、拒答行为变化、JSON contract 损坏和新工具权限。","TypeScript、导入 release notes 和 eval 摘要、生成 GitHub checklist、不依赖模型 API","GitHub、DevOps 社区、AI 工程 newsletter、内部平台团队、Hacker News",8,8,7),S("support-thread-signal-miner","支持线程信号挖掘器","把支持工单、Discord 线程和 GitHub discussion 转成 AI 产品想法的创始人和维护者","有价值产品信号埋在重复配置问题、困惑报错、集成请求和各种 workaround 线程里。","TypeScript、粘贴式导入、本地聚类、不上传客户数据、导出机会简报和 starter issue","GitHub、创始人社区、支持工程博客、Product Hunt、开发者 newsletter",8,7,9),S("mcp-server-contract-tester","MCP Server Contract 测试器","通过 MCP server 暴露内部工具、数据源和自动化 API 的开发者","MCP server 容易原型化但难以信任，因为 schema 漂移、鉴权假设、工具副作用和面向模型的描述会在小改动后失效。","TypeScript、本地测试 harness、记录工具 schema、mock 危险调用、导出 GitHub 可用回归报告","GitHub、MCP 社区、AI Agent newsletter、DevTools 博客、Hacker News",9,8,8),S("ai-coding-agent-pr-triage","AI 编码 Agent PR 分诊","收到 AI 生成 PR、issue 修复和自动重构的开源维护者","维护者需要快速区分有价值的 AI 贡献和高风险 churn、缺失测试、大范围重写、无视项目惯例的改动。","TypeScript、GitHub issue 和 diff 导入、本地评分、无仓库写权限、导出 review checklist","GitHub、维护者社区、AI 编码 newsletter、DevTools 论坛、Hacker News",8,8,9)];function De(e){return e==="zh-CN"?or:rr}function S(e,t,n,r,o,s,a,p,g){return{id:e,title:t,input:{audience:n,signal:r,constraints:o,channels:s,pain:a,urgency:p,distribution:g}}}const N={height:630,width:1200};function wt(e){const t=_(e.name),n=_(e.repoHook),r=_(Ke(e.wedge,110)),o=_(`${e.score}/10`),s=_(Ke(e.targetUser,88));return`<svg width="${N.width}" height="${N.height}" viewBox="0 0 ${N.width} ${N.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#10130F"/>
  <path d="M0 72H1200M0 144H1200M0 216H1200M0 288H1200M0 360H1200M0 432H1200M0 504H1200M0 576H1200" stroke="#F5F1E6" stroke-opacity=".08"/>
  <path d="M104 0L0 630M224 0L120 630M344 0L240 630M464 0L360 630M584 0L480 630M704 0L600 630M824 0L720 630M944 0L840 630M1064 0L960 630M1184 0L1080 630" stroke="#D8FF4F" stroke-opacity=".12"/>
  <circle cx="920" cy="170" r="220" fill="#32DCC0" fill-opacity=".16"/>
  <circle cx="244" cy="530" r="270" fill="#FF704D" fill-opacity=".18"/>
  <rect x="78" y="72" width="1044" height="486" rx="20" fill="#1C1F19" fill-opacity=".84" stroke="#F5F1E6" stroke-opacity=".16"/>
  <text x="112" y="132" fill="#D8FF4F" font-family="Consolas, monospace" font-size="28" font-weight="700">OPENTOP OPPORTUNITY</text>
  <text x="112" y="238" fill="#F5F1E6" font-family="Georgia, serif" font-size="78" font-weight="700">${t}</text>
  <text x="112" y="306" fill="#D8D4C2" font-family="Georgia, serif" font-size="32">${n}</text>
  <text x="112" y="388" fill="#F5F1E6" font-family="Georgia, serif" font-size="34">${r}</text>
  <text x="112" y="456" fill="#A8AA9A" font-family="Consolas, monospace" font-size="22">Target: ${s}</text>
  <rect x="112" y="488" width="172" height="58" rx="10" fill="#D8FF4F"/>
  <text x="138" y="527" fill="#10130F" font-family="Consolas, monospace" font-size="28" font-weight="700">${o}</text>
  <text x="312" y="527" fill="#F5F1E6" font-family="Consolas, monospace" font-size="24" font-weight="700">Built with TypeScript. Local-first. GitHub-ready.</text>
</svg>
`}function sr(e){return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(wt(e))}`}async function ir(e){const t=await ar(sr(e)),n=document.createElement("canvas");n.width=N.width,n.height=N.height;const r=n.getContext("2d");if(!r)throw new Error("Canvas rendering is not available.");return r.drawImage(t,0,0,N.width,N.height),new Promise((o,s)=>{n.toBlob(a=>{a?o(a):s(new Error("PNG export failed."))},"image/png")})}async function ar(e){const t=new Image;t.decoding="async";const n=new Promise((r,o)=>{t.onload=()=>r(t),t.onerror=()=>o(new Error("Share card image failed to load."))});return t.src=e,typeof t.decode=="function"?(await t.decode(),t):n}function Ke(e,t){return e.length>t?`${e.slice(0,t-1)}...`:e}function _(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const cr={provider:"demo",endpoint:"",apiKey:"",model:""},H={audience:"solo developers, AI engineers, and open-source maintainers",signal:"Developers are overwhelmed by fast-moving AI APIs, agent frameworks, and local model tooling. They want smaller tools that help them decide what to build, ship fast, and explain the project clearly.",constraints:"Must be TypeScript-first, runnable locally, useful without a paid API key, and easy to publish on GitHub.",channels:"GitHub, Hacker News, Product Hunt, Reddit r/LocalLLaMA, X/Twitter demos, developer newsletters",pain:8,urgency:7,distribution:8},$t="opentop.input.v1",kt="opentop.locale.v1",vt="opentop.settings.v1",St="opentop.scoringProfile.v1";function At(e,t){try{const n=localStorage.getItem(e);return n?{...t,...JSON.parse(n)}:t}catch{return t}}function lr(e=H){return At($t,e)}function ie(e){localStorage.setItem($t,JSON.stringify(e))}function ur(e=gt){try{return Me(JSON.parse(localStorage.getItem(kt)??JSON.stringify(e)))}catch{return e}}function dr(e){localStorage.setItem(kt,JSON.stringify(Me(e)))}function pr(){return At(vt,cr)}function hr(e){localStorage.setItem(vt,JSON.stringify(e))}function fr(){try{const e=localStorage.getItem(St);return e?re(JSON.parse(e)).id:Y}catch{return Y}}function gr(e){localStorage.setItem(St,JSON.stringify(re(e).id))}const mr=/https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/issues\/(\d+)(?:[/?#][^\s<)]*)?/gi,br=/<a\b[^>]*\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi,yr=/^\[([^\]]+)]\((https?:\/\/[^)]+)\)$/i,xt=/https?:\/\/[^\s<>"']+/i;function wr(e){return Or(e)?kr(e):Sr(e)??vr(e)}function Rt(e){const t=new Set,n=[];for(const r of e.matchAll(mr)){const o=r[1],s=r[2],a=Number(r[3]),p=`${o.toLowerCase()}/${s.toLowerCase()}#${a}`;t.has(p)||(t.add(p),n.push({owner:o,repo:s,number:a,url:`https://github.com/${o}/${s}/issues/${a}`}))}return n}async function $r(e,t=globalThis.fetch){const n=Rt(e).slice(0,12);if(n.length===0)return null;if(!t)throw new Error("This browser cannot fetch GitHub issues.");const r=await Promise.all(n.map(a=>Cr(a,t))),o=r.flatMap(a=>a.item?[a.item]:[]),s=r.flatMap(a=>a.failure?[a.failure]:[]);if(o.length===0)throw new Error(`Could not import GitHub issues: ${s.join("; ")}`);return{...ge(o),ignoredCount:n.length-o.length,format:"github-issues",failures:s}}function kr(e){const t=Ur(e).map(l=>l.map(m=>m.trim()).filter(Boolean)).filter(l=>l.length>0);if(t.length===0)return null;const n=t[0].map(l=>l.toLowerCase()),r=n.some(l=>["source","channel","signal","note","trend","url"].includes(l)),o=r?t.slice(1):t,s=Ve(n,["source","channel","platform"]),a=Ve(n,["signal","note","trend","summary"]),p=o.map(l=>{const m=E(l[r&&s>=0?s:0]),R=E(l[r&&a>=0?a:l.length>1?1:0]);return R?{source:m,signal:R}:null}),g=p.filter(l=>!!l).slice(0,12);return g.length===0?null:{...ge(g),ignoredCount:p.length-g.length,format:"csv"}}function vr(e){const t=e.split(/\r?\n/).map(Dr).filter(r=>r.length>0).map(Nr),n=t.filter(r=>!!r).slice(0,12);return n.length===0?null:{...ge(n),ignoredCount:t.length-n.length,format:"notes"}}function Sr(e){const t=Ar(e);if(t.length>0)return _e(t);const n=e.split(/\r?\n/).map(xr).filter(r=>r.length>0);return Rr(n)?_e(n.map(r=>Er(r))):null}function ge(e){const t=Array.from(new Set(e.map(r=>r.source).filter(Boolean))).join(", "),n=e.map(r=>`${r.source?`${r.source}: `:""}${r.signal}`).join(`
`);return{channels:t,rowCount:e.length,signal:n}}function _e(e){const t=new Set,n=[];let r=0;for(const o of e){if(!o||t.has(o.key)||n.length>=12){r+=1;continue}t.add(o.key),n.push(o.item)}return n.length===0?null:{...ge(n),ignoredCount:r,format:"links"}}function Ar(e){const t=[];for(const n of e.matchAll(br)){const r=n[1]??n[2]??n[3]??"",o=Pr(n[4]);t.push(xe(r,o))}return t}function xr(e){return e.replace(/^\s{0,3}[-*+]\s+/,"").replace(/^\s{0,3}\d+[.)]\s+/,"").replace(/^>\s?/,"").trim()}function Rr(e){if(e.length===0)return!1;const t=e.filter(r=>xt.test(r)).length;if(t===0)return!1;const n=e.filter(Ir).length;return n>0&&n>=t?!1:t>=Math.ceil(e.length/2)}function Ir(e){return/^[^:|-]{2,32}\s*:\s*\[[^\]]+]\(https?:\/\//i.test(e)}function Er(e){var o;const t=e.match(yr);if(t)return xe(t[2],t[1]);const n=((o=e.match(xt))==null?void 0:o[0])??"";if(!n)return null;const r=E(e.replace(n,"").replace(/^[\s:|\u2013\u2014-]+|[\s:|\u2013\u2014-]+$/g,""));return xe(n,r)}function xe(e,t){const n=Lr(e);if(!n)return null;const r=new URL(n),o=It(r.hostname),s=E(t)||Tr(r);return{key:n.toLowerCase(),item:{source:o,signal:`${s} - ${n}`}}}function Lr(e){const t=e.replace(/&amp;/g,"&").trim().replace(/[)\].,;!?]+$/g,"");try{const n=new URL(t);return n.protocol!=="http:"&&n.protocol!=="https:"?null:(n.hash="",n.hostname=n.hostname.toLowerCase(),n.pathname=n.pathname.length>1?n.pathname.replace(/\/+$/g,""):n.pathname,n.toString())}catch{return null}}function It(e){return e.replace(/^www\./i,"").toLowerCase()}function Tr(e){const t=It(e.hostname),n=decodeURIComponent(e.pathname).replace(/^\/+/,"").replace(/\/+/g," / ");return E(n?`${t} / ${n}`:t)}function Pr(e){return E(e.replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'"))}async function Cr(e,t){var r;const n=`${e.owner}/${e.repo}#${e.number}`;try{const o=await t(`https://api.github.com/repos/${e.owner}/${e.repo}/issues/${e.number}`,{headers:{Accept:"application/vnd.github+json"}});if(!o.ok)return{item:null,failure:`${n}: ${o.status} ${o.statusText||"request failed"}`};const s=await o.json();if(s.pull_request)return{item:null,failure:`${n}: pull requests are skipped`};const a=E(s.title);if(!a)return{item:null,failure:`${n}: missing issue title`};const p=E(s.state),g=Hr(s.labels),l=Mr(s.body),m=(r=s.html_url)!=null&&r.startsWith("https://github.com/")?s.html_url:e.url,R=[a,l,g?`labels: ${g}`:"",p?`state: ${p}`:"",m].filter(Boolean);return{item:{source:`GitHub ${n}`,signal:R.join(" | ")},failure:null}}catch(o){return{item:null,failure:`${n}: ${o instanceof Error?o.message:"request failed"}`}}}function Hr(e){return(e??[]).map(t=>typeof t=="string"?t:t.name??"").map(E).filter(Boolean).slice(0,5).join(", ")}function Mr(e){return E((e??"").replace(/```[\s\S]*?```/g," ").replace(/`([^`]+)`/g,"$1").replace(/!\[[^\]]*]\([^)]+\)/g," ").replace(/\[([^\]]+)]\([^)]+\)/g,"$1").replace(/^#{1,6}\s+/gm,"").replace(/^\s{0,3}[-*+]\s+/gm,"").replace(/\s+/g," "))}function Or(e){const t=e.split(/\r?\n/).map(r=>r.trim()).filter(Boolean);if(t.length===0)return!1;const n=t[0].toLowerCase();return n.includes(",")&&(n.includes("source")||n.includes("signal")||n.includes("channel"))}function Dr(e){return e.replace(/^\s{0,3}[-*+]\s+/,"").replace(/^\s{0,3}\d+[.)]\s+/,"").replace(/^>\s?/,"").trim()}function Nr(e){const t=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,"$1 $2"),n=t.match(/^([^:|-]{2,32})\s*[:|-]\s*(.+)$/),r=E(n==null?void 0:n[1]),o=E((n==null?void 0:n[2])??t);return o.length<12?null:{source:r,signal:o}}function Ur(e){const t=[];let n=[],r="",o=!1;for(let s=0;s<e.length;s+=1){const a=e[s],p=e[s+1];a==='"'&&o&&p==='"'?(r+='"',s+=1):a==='"'?o=!o:a===","&&!o?(n.push(r),r=""):(a===`
`||a==="\r")&&!o?(a==="\r"&&p===`
`&&(s+=1),n.push(r),t.push(n),n=[],r=""):r+=a}return n.push(r),t.push(n),t}function Ve(e,t){return e.findIndex(n=>t.includes(n))}function E(e){return(e??"").replace(/\s+/g," ").trim().slice(0,360)}function Gr(e){const t=new TextEncoder().encode(JSON.stringify(e));let n="";for(const r of t)n+=String.fromCharCode(r);return btoa(n).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function Fr(e){if(!e)return null;try{const t=e.replace(/-/g,"+").replace(/_/g,"/"),n=t.padEnd(Math.ceil(t.length/4)*4,"="),r=atob(n),o=Uint8Array.from(r,a=>a.charCodeAt(0)),s=JSON.parse(new TextDecoder().decode(o));return jr(s)}catch{return null}}function Et(e){return Fr(new URLSearchParams(e).get("brief"))}function Lt(e,t){const n=new URL(t);return n.searchParams.set("brief",Gr(e)),n.hash="",n.toString()}function jr(e){return{audience:ae(e.audience,H.audience),signal:ae(e.signal,H.signal),constraints:ae(e.constraints,H.constraints),channels:ae(e.channels,H.channels),pain:$e(e.pain,H.pain),urgency:$e(e.urgency,H.urgency),distribution:$e(e.distribution,H.distribution)}}function ae(e,t){return typeof e=="string"&&e.trim()?e.slice(0,2e3):t}function $e(e,t){const n=typeof e=="number"?e:Number(e);return Number.isFinite(n)?Math.max(1,Math.min(10,Math.round(n))):t}const Br=zr(),qr=new Set(["pain","urgency","distribution","buildability","starPotential"]);let h=ur(An(navigator.languages)),$=Et(window.location.search)??lr(Oe(h)),v=pr(),Re=fr(),f=null,x="",he=!1,le="",Tt="",ue="",X="",L=null,D=null,O="",de=[],Q="loading";U();z();Xr();function U(){const e=y(h),t=De(h);Br.innerHTML=`
    <main class="shell">
      <section class="workspace" aria-label="${i(e.workspaceAria)}">
        <header class="topbar">
          <div>
            <p class="eyebrow">OpenTop</p>
            <h1>${i(e.appTitle)}</h1>
          </div>
          <div class="topbar-actions">
            <label class="locale-switch">
              <span>${i(e.language)}</span>
              <select name="locale" aria-label="${i(e.language)}">
                ${Sn.map(n=>`
                      <option value="${n.value}" ${n.value===h?"selected":""}>${i(n.label)}</option>
                    `).join("")}
              </select>
            </label>
            <div class="status-pill" title="${i(e.currentInferenceMode)}">
              <span class="pulse"></span>
              ${i(Qe(v.provider))}
            </div>
          </div>
        </header>

        <div class="layout">
          <aside class="control-panel">
            <section class="sample-strip" aria-label="${i(e.tryBrief)}">
              <p class="eyebrow">${i(e.tryBrief)}</p>
              <div class="sample-grid">
                ${t.map(n=>`
                      <button class="sample-button" data-sample="${n.id}" type="button">
                        ${i(n.title)}
                      </button>
                    `).join("")}
              </div>
            </section>

            <details class="import-panel">
              <summary>${i(e.importSignals)}</summary>
              <label>
                ${i(e.trendSignalsLabel)}
                <textarea name="trendSignals" rows="5" placeholder="${i(e.trendSignalsPlaceholder)}"></textarea>
              </label>
              <div class="import-actions">
                <button class="secondary-action" data-import-trends type="button">${i(e.useSignals)}</button>
                <span data-import-feedback aria-live="polite">${i(Tt)}</span>
              </div>
            </details>

            ${Wr()}

            ${_r()}

            <form id="briefForm">
              <label>
                ${i(e.audience)}
                <input name="audience" value="${i($.audience)}" />
              </label>
              <label>
                ${i(e.signalBrief)}
                <textarea name="signal" rows="7">${i($.signal)}</textarea>
              </label>
              <label>
                ${i(e.constraints)}
                <textarea name="constraints" rows="4">${i($.constraints)}</textarea>
              </label>
              <label>
                ${i(e.launchChannels)}
                <textarea name="channels" rows="4">${i($.channels)}</textarea>
              </label>

              <div class="slider-grid">
                ${ke("pain",e.pain,$.pain)}
                ${ke("urgency",e.urgency,$.urgency)}
                ${ke("distribution",e.distribution,$.distribution)}
              </div>

              <button class="primary-action" type="submit" ${he?"disabled":""}>
                ${i(he?e.analyzing:e.analyze)}
              </button>
            </form>

            <details class="settings">
              <summary>${i(e.modelSettings)}</summary>
              <form id="settingsForm">
                <label>
                  ${i(e.provider)}
                  <select name="provider">
                    ${B("demo",Qe("demo"),v.provider)}
                    ${B("openai-compatible","OpenAI-compatible",v.provider)}
                    ${B("ollama","Ollama",v.provider)}
                    ${B("anthropic","Anthropic",v.provider)}
                    ${B("anthropic-bedrock","Anthropic on Bedrock",v.provider)}
                    ${B("anthropic-vertex","Anthropic on Vertex AI",v.provider)}
                  </select>
                </label>
                <label>
                  ${i(e.endpoint)}
                  <input name="endpoint" placeholder="https://api.openai.com/v1/chat/completions" value="${i(v.endpoint)}" />
                </label>
                <label>
                  ${i(e.apiKey)}
                  <input name="apiKey" type="password" autocomplete="off" value="${i(v.apiKey)}" />
                </label>
                <label>
                  ${i(e.model)}
                  <input name="model" placeholder="gpt-4.1-mini or llama3.1" value="${i(v.model)}" />
                </label>
                <button type="submit" class="secondary-action">${i(e.saveSettings)}</button>
              </form>
            </details>
          </aside>

          <section class="radar-panel">
            <div class="canvas-wrap">
              <canvas id="radarCanvas" width="760" height="360" aria-label="${i(e.scoreExplanation)}"></canvas>
              <div class="canvas-copy">
                <span>${f?f.generatedBy:i(e.warmingUp)}</span>
                <strong>${i(f?f.summary:e.preparingMap)}</strong>
              </div>
            </div>

            ${eo()}

            <div class="results-grid">
              ${f?Qr(f):ao()}
            </div>
          </section>
        </div>
      </section>
    </main>
  `,Zr(),oo(),Yr()}function zr(){const e=document.querySelector("#app");if(!e)throw new Error("Missing #app root.");return e}function Wr(){const e=y(h),t=L;return`
    <details class="readme-audit-panel" ${X||t?"open":""}>
      <summary>${i(e.readmeAudit)}</summary>
      <label>
        ${i(e.githubRepositoryUrl)}
        <input name="readmeRepoUrl" placeholder="https://github.com/owner/repo" value="${i(ue)}" />
      </label>
      <label>
        ${i(e.pasteOrFetchReadme)}
        <textarea name="readmeAudit" rows="5" placeholder="# My AI Tool&#10;&#10;A local-first assistant for...">${i(X)}</textarea>
      </label>
      <div class="readme-audit-actions">
        <button class="secondary-action" data-fetch-readme type="button">${i(e.fetchReadme)}</button>
        <button class="secondary-action" data-audit-readme type="button">${i(e.auditReadme)}</button>
        ${t?`<button class="secondary-action" data-copy-readme-audit type="button">${i(e.copyAudit)}</button>`:""}
        ${t?`<button class="secondary-action" data-copy-star-sprint type="button">${i(e.copySprint)}</button>`:""}
        ${D?`<button class="secondary-action" data-copy-repo-profile type="button">${i(e.copyProfile)}</button>`:""}
        <span data-readme-audit-feedback aria-live="polite">${i(O)}</span>
      </div>
      ${t?Jr(t):""}
      ${D?Kr(D):""}
    </details>
  `}function Jr(e){const t=y(h),n=e.topFixes.length>0?e.topFixes.map(o=>`<li>${i(o.fix)}</li>`).join(""):`<li>${i(t.noCriticalGaps)}</li>`,r=e.items.map(o=>`
        <span class="${o.passed?"passed":"missing"}">
          <b>${o.passed?"Pass":"Fix"}</b>
          ${i(o.label)}
        </span>
      `).join("");return`
    <section class="readme-audit-result" aria-label="README star audit result">
      <div class="readme-audit-score">
        <strong>${e.score}</strong>
        <span>${i(e.grade)}</span>
        <small>${e.passedCount}/${e.totalCount} ${i(t.checks)}</small>
      </div>
      <p>${i(e.summary)}</p>
      <div>
        <h3>${i(t.topFixes)}</h3>
        <ol>${n}</ol>
      </div>
      <div class="readme-audit-checks">
        ${r}
      </div>
    </section>
  `}function Kr(e){const t=y(h),n=e.topFixes.length>0?e.topFixes.map(o=>`<li>${i(o.fix)}</li>`).join(""):`<li>${i(t.noCriticalGaps)}</li>`,r=[["Stars",String(e.stats.stars)],["Forks",String(e.stats.forks)],["Issues",String(e.stats.openIssues)],["Topics",e.stats.topics.length>0?e.stats.topics.slice(0,4).join(", "):"none"]];return`
    <section class="repo-profile-result" aria-label="GitHub star profile result">
      <div class="repo-profile-heading">
        <div>
          <p class="eyebrow">GitHub profile</p>
          <h3>${e.score}/100 ${i(e.grade)}</h3>
        </div>
        <p>${i(e.summary)}</p>
      </div>
      <div class="repo-profile-stats">
        ${r.map(([o,s])=>`<span><b>${i(s)}</b>${i(o)}</span>`).join("")}
      </div>
      <div>
        <h3>${i(t.profileFixes)}</h3>
        <ol>${n}</ol>
      </div>
    </section>
  `}function _r(){const e=y(h),t=F();return`
    <section class="scoring-marketplace" aria-label="Scoring template marketplace">
      <div class="marketplace-heading">
        <p class="eyebrow">${i(e.scoringTemplates)}</p>
        <strong>${i(t.name)}</strong>
        <span>${i(t.bestFor)}</span>
      </div>
      <div class="template-grid">
        ${Ae.map(n=>Vr(n,t.id)).join("")}
      </div>
    </section>
  `}function Vr(e,t){const n=e.id===t,r=Object.entries(e.weights).map(([o,s])=>`
        <span title="${i(me(o))}: ${Math.round(s*100)}%">
          <i style="height: ${Math.round(s*100)}%"></i>
        </span>
      `).join("");return`
    <button
      class="template-card ${n?"active":""}"
      data-scoring-profile="${e.id}"
      type="button"
      aria-pressed="${n?"true":"false"}"
    >
      <span>${i(e.name)}</span>
      <small>${i(e.tagline)}</small>
      <div class="weight-bars" aria-label="${i(e.name)} score weights">
        ${r}
      </div>
    </button>
  `}function Zr(){var e,t,n,r,o,s,a,p,g,l,m,R,P,j,Ne,Ue,Ge,Fe,je;(e=document.querySelector("[name='locale']"))==null||e.addEventListener("change",u=>{const c=u.currentTarget,d=Me(c.value);if(d===h)return;const w=go($,h);h=d,dr(h),!Et(window.location.search)&&w&&($=Oe(h),ie($)),f=null,z()}),(t=document.querySelector("#briefForm"))==null||t.addEventListener("submit",u=>{u.preventDefault(),$=so(u.currentTarget),ie($),z()}),(n=document.querySelector("#settingsForm"))==null||n.addEventListener("submit",u=>{u.preventDefault(),v=io(u.currentTarget),hr(v),U()}),(r=document.querySelector("#settingsForm [name='provider']"))==null||r.addEventListener("change",u=>{const c=u.currentTarget.value,d=document.querySelector("#settingsForm"),b=d==null?void 0:d.elements.namedItem("endpoint"),w=d==null?void 0:d.elements.namedItem("model");b&&(!v.endpoint||b.value===ee(v.provider))&&(b.value=c==="demo"?"":ee(c)),w&&(!v.model||w.value===te(v.provider))&&(w.value=c==="demo"?"":te(c))}),document.querySelectorAll("[data-select]").forEach(u=>{u.addEventListener("click",()=>{Ze(u.dataset.select??x)}),u.addEventListener("keydown",c=>{var W;if(!kn(c.key))return;c.preventDefault();const d=Array.from(document.querySelectorAll("[data-select]")),b=d.findIndex(oe=>oe===c.currentTarget),w=vn(b,d.length,c.key),I=(W=d[w])==null?void 0:W.dataset.select;!I||I===x||Ze(I,!0)})}),document.querySelectorAll("[data-sample]").forEach(u=>{u.addEventListener("click",()=>{const c=De(h).find(d=>d.id===u.dataset.sample);c&&($=c.input,ie($),z())})}),document.querySelectorAll("[data-scoring-profile]").forEach(u=>{u.addEventListener("click",()=>{Re=re(u.dataset.scoringProfile??Y).id,gr(Re),z()})}),document.querySelectorAll("[data-copy]").forEach(u=>{u.addEventListener("click",async()=>{const c=f==null?void 0:f.opportunities.find(b=>b.id===x);if(!c)return;const d=u.dataset.copy;await navigator.clipboard.writeText(uo(d,c)),u.textContent=y(h).copied,window.setTimeout(()=>{u.textContent=Pt(d)},1400)})}),(o=document.querySelector("[data-import-trends]"))==null||o.addEventListener("click",async u=>{var oe,Be;const c=u.currentTarget,d=document.querySelector("[name='trendSignals']"),b=document.querySelector("[data-import-feedback]"),w=(d==null?void 0:d.value)??"",I=Rt(w).length,W=y(h);c.disabled=!0,I>0&&ce(b,h==="zh-CN"?`正在抓取 ${I} 个公开 GitHub issue...`:`Fetching ${I} public GitHub issue${I===1?"":"s"}...`);try{const k=I>0?await $r(w):wr(w);if(!k){ce(b,W.noUsableSignals);return}ce(b,h==="zh-CN"?`已导入 ${k.rowCount} 条${Ye(k.format)}${k.ignoredCount>0?`，跳过 ${k.ignoredCount} 条`:""}${(oe=k.failures)!=null&&oe.length?`，失败 ${k.failures.length} 条`:""}`:`Imported ${k.rowCount} ${Ye(k.format)}${k.ignoredCount>0?`, skipped ${k.ignoredCount}`:""}${(Be=k.failures)!=null&&Be.length?`, failed ${k.failures.length}`:""}`),$={...$,signal:k.signal,channels:k.channels||$.channels,distribution:Math.max($.distribution,Math.min(10,5+Math.ceil(k.rowCount/2)))},ie($),z()}catch(k){ce(b,k instanceof Error?k.message:W.couldNotImportIssues)}finally{c.disabled=!1}}),(s=document.querySelector("[data-audit-readme]"))==null||s.addEventListener("click",()=>{const u=document.querySelector("[name='readmeRepoUrl']"),c=document.querySelector("[name='readmeAudit']");ue=(u==null?void 0:u.value)??"",X=(c==null?void 0:c.value)??"",L=ze(X),D=null,O=`${L.score}/100 ${L.grade}`,U()}),(a=document.querySelector("[data-fetch-readme]"))==null||a.addEventListener("click",async u=>{const c=u.currentTarget,d=document.querySelector("[name='readmeRepoUrl']"),b=(d==null?void 0:d.value)??"";c.disabled=!0,O=y(h).fetchingReadme,tt(O);try{const[w,I]=await Promise.all([Tn(b),Pn(b)]);ue=w.reference.displayUrl,X=w.readme,L=ze(w.readme),D=I,O=`${w.reference.owner}/${w.reference.repo}: README ${L.score}/100, profile ${I.score}/100`,U()}catch(w){ue=b,O=w instanceof Error?w.message:y(h).couldNotFetchReadme,tt(O)}finally{c.disabled=!1}}),(p=document.querySelector("[data-copy-readme-audit]"))==null||p.addEventListener("click",async u=>{if(!L)return;const c=u.currentTarget;await navigator.clipboard.writeText(Hn(L)),c.textContent=y(h).copied,window.setTimeout(()=>{c.textContent=y(h).copyAudit},1400)}),(g=document.querySelector("[data-copy-repo-profile]"))==null||g.addEventListener("click",async u=>{if(!D)return;const c=u.currentTarget;await navigator.clipboard.writeText(Mn(D)),c.textContent=y(h).copied,window.setTimeout(()=>{c.textContent=y(h).copyProfile},1400)}),(l=document.querySelector("[data-copy-star-sprint]"))==null||l.addEventListener("click",async u=>{if(!L)return;const c=u.currentTarget;await navigator.clipboard.writeText(Dn(L,D)),c.textContent=y(h).copied,window.setTimeout(()=>{c.textContent=y(h).copySprint},1400)}),(m=document.querySelector("[data-download]"))==null||m.addEventListener("click",()=>{const u=f==null?void 0:f.opportunities.find(c=>c.id===x);u&&po(`${u.id}.json`,u)}),(R=document.querySelector("[data-download-card-svg]"))==null||R.addEventListener("click",()=>{const u=f==null?void 0:f.opportunities.find(c=>c.id===x);u&&ho(`${u.id}-share-card.svg`,wt(u))}),(P=document.querySelector("[data-download-card-png]"))==null||P.addEventListener("click",async u=>{const c=f==null?void 0:f.opportunities.find(w=>w.id===x);if(!c)return;const d=u.currentTarget,b=y(h);d.textContent=b.rendering,d.disabled=!0;try{const w=await ir(c);ne(`${c.id}-share-card.png`,w),d.textContent=b.downloaded}catch{d.textContent=b.pngFailed}finally{window.setTimeout(()=>{d.textContent=M("card-png"),d.disabled=!1},1400)}}),(j=document.querySelector("[data-download-launch-brief]"))==null||j.addEventListener("click",u=>{const c=f==null?void 0:f.opportunities.find(b=>b.id===x);if(!c)return;const d=u.currentTarget;d.textContent=y(h).downloaded,V(`${G(c)}-public-launch-brief.md`,Te(c)),window.setTimeout(()=>{d.textContent=M("launch-brief")},1400)}),(Ne=document.querySelector("[data-download-launch-kit]"))==null||Ne.addEventListener("click",u=>{const c=f==null?void 0:f.opportunities.find(b=>b.id===x);if(!c)return;const d=u.currentTarget;d.textContent=y(h).downloaded,V(`${G(c)}-launch-kit.md`,ft(c)),window.setTimeout(()=>{d.textContent=M("launch-kit")},1400)}),(Ue=document.querySelector("[data-download-contributor-queue]"))==null||Ue.addEventListener("click",u=>{const c=f==null?void 0:f.opportunities.find(b=>b.id===x);if(!c)return;const d=u.currentTarget;d.textContent=y(h).downloaded,V(`${G(c)}-contributor-queue.md`,He(c)),window.setTimeout(()=>{d.textContent=M("contributor-queue")},1400)}),(Ge=document.querySelector("[data-download-star-plan]"))==null||Ge.addEventListener("click",u=>{const c=f==null?void 0:f.opportunities.find(b=>b.id===x);if(!c)return;const d=u.currentTarget;d.textContent=y(h).downloaded,V(`${G(c)}-star-growth-plan.md`,Ce(c)),window.setTimeout(()=>{d.textContent=M("star-plan")},1400)}),(Fe=document.querySelector("[data-download-repo-listing]"))==null||Fe.addEventListener("click",u=>{const c=f==null?void 0:f.opportunities.find(b=>b.id===x);if(!c)return;const d=u.currentTarget;d.textContent=y(h).downloaded,V(`${G(c)}-repo-listing-pack.md`,Pe(c)),window.setTimeout(()=>{d.textContent=M("repo-listing")},1400)}),(je=document.querySelector("[data-download-scaffold]"))==null||je.addEventListener("click",u=>{const c=f==null?void 0:f.opportunities.find(b=>b.id===x);if(!c)return;const d=u.currentTarget;d.textContent=y(h).buildingZip,d.disabled=!0,ne(`${G(c)}.zip`,Wn(c)),window.setTimeout(()=>{d.textContent=M("repo-zip"),d.disabled=!1},1400)})}async function z(){var e,t;he=!0,U();try{f=Xe(await Zt($,v,h),F()),x=((e=f.opportunities[0])==null?void 0:e.id)??""}catch(n){f={generatedBy:"local-engine",summary:n instanceof Error?n.message:y(h).modelFallback,opportunities:[]}}finally{he=!1;const n=f;if(!n||n.opportunities.length===0){const r=fo($);f=n?Xe({...n,opportunities:r.opportunities},F()):r,x=((t=f.opportunities[0])==null?void 0:t.id)??""}U()}}async function Xr(){Q="loading";try{const e=await fetch(new URL("benchmarks.json",new URL(".",window.location.href)));if(!e.ok)throw new Error(`${e.status} ${e.statusText||"request failed"}`);de=co(await e.json()),Q=de.length>0?"ready":"failed"}catch{de=[],Q="failed"}U()}function Qr(e){const t=e.opportunities.find(n=>n.id===x)??e.opportunities[0];return`
    <div class="opportunity-list">
      ${e.opportunities.map(n=>`
            <button class="opportunity-card ${n.id===(t==null?void 0:t.id)?"active":""}" data-select="${n.id}" type="button" tabindex="${n.id===(t==null?void 0:t.id)?"0":"-1"}" aria-pressed="${n.id===(t==null?void 0:t.id)?"true":"false"}">
              <span>${n.score}/10</span>
              <strong>${i(n.name)}</strong>
              <small>${i(n.tagline)}</small>
            </button>
          `).join("")}
    </div>
    ${t?to(t):""}
  `}function Ze(e,t=!1){x=e,le=t?e:"",U()}function Yr(){if(!le)return;const e=document.querySelector(`[data-select="${CSS.escape(le)}"]`);le="",e==null||e.focus({preventScroll:!0})}function eo(){const e=y(h),t=De(h);return`
    <section class="gallery-rail" aria-label="${i(e.opportunityGallery)}">
      <div>
        <p class="eyebrow">${i(e.opportunityGallery)}</p>
        <h2>${i(e.proofBeforeSetup)}</h2>
      </div>
      <div class="gallery-cards">
        ${t.map(n=>{const r=Ee(n.input,F().weights,h).opportunities[0],o=Lt(n.input,window.location.href);return`
              <article class="gallery-card">
                <div>
                  <span>${r.score}/10</span>
                  <strong>${i(n.title)}</strong>
                </div>
                <p>${i(r.name)} - ${i(r.wedge)}</p>
                <div class="gallery-actions">
                  <button class="secondary-action" data-sample="${n.id}" type="button">${i(e.load)}</button>
                  <a href="${i(o)}">${i(e.openLink)}</a>
                </div>
              </article>
            `}).join("")}
      </div>
    </section>
  `}function to(e){const t=y(h);return`
    <article class="detail-panel">
      <div class="detail-heading">
        <div>
          <p class="eyebrow">${i(t.selectedWedge)}</p>
          <h2>${i(e.name)}</h2>
        </div>
        <div class="action-row">
          ${A("markdown")}
          ${A("show-hn")}
          ${A("build-log")}
          ${A("product-hunt")}
          ${A("demo-script")}
          ${A("x-thread")}
          ${A("newsletter")}
          ${A("reddit")}
          ${A("github-issue")}
          ${A("launch-brief")}
          ${A("launch-kit")}
          ${A("contributor-queue")}
          ${A("star-plan")}
          ${A("repo-listing")}
          ${A("repo-scaffold")}
          ${T("launch-brief","data-download-launch-brief")}
          ${T("launch-kit","data-download-launch-kit")}
          ${T("contributor-queue","data-download-contributor-queue")}
          ${T("star-plan","data-download-star-plan")}
          ${T("repo-listing","data-download-repo-listing")}
          ${T("repo-zip","data-download-scaffold")}
          ${A("share-url")}
          ${T("card-png","data-download-card-png")}
          ${T("card-svg","data-download-card-svg")}
          ${T("json","data-download")}
        </div>
      </div>
      <p class="tagline">${i(e.tagline)}</p>
      <div class="score-strip">
        ${Object.entries(e.scores).map(([n,r])=>`<span><b>${r}</b>${me(n)}</span>`).join("")}
      </div>
      ${no(e)}
      ${ro(e)}
      <div class="detail-grid">
        ${ve(t.wedge,e.wedge)}
        ${ve(t.differentiator,e.differentiator)}
        ${ve(t.moat,e.moat)}
        ${Se(t.firstRelease,e.firstRelease)}
        ${Se(t.launchPlan,e.launchPlan)}
        ${Se(t.risks,e.risks)}
      </div>
    </article>
  `}function no(e){const t=y(h),n=F(),r=Object.entries(n.weights).map(([o,s])=>{const a=e.scores[o];return`
        <span>
          <b>${me(o)}</b>
          <em>${a} x ${Math.round(s*100)}%</em>
        </span>
      `}).join("");return`
    <section class="score-math" aria-label="${i(t.scoreExplanation)}">
      <div>
        <h3>${i(t.scoreMath)}</h3>
        <p>${h==="zh-CN"?`${i(n.name)} 权重计算后得到 ${e.score}/10。`:`${i(n.name)} weights round to ${e.score}/10.`}</p>
      </div>
      <div class="score-math-grid">
        ${r}
      </div>
    </section>
  `}function ro(e){const t=y(h);if(Q==="loading")return`
      <section class="benchmark-panel" aria-label="${i(t.benchmarkLessons)}">
        <div class="benchmark-heading">
          <div>
            <p class="eyebrow">${i(t.benchmarkProof)}</p>
            <h3>${i(t.loadingBenchmarks)}</h3>
          </div>
          <p>${i(t.benchmarkLoadingNote)}</p>
        </div>
      </section>
    `;if(Q==="failed")return`
      <section class="benchmark-panel" aria-label="${i(t.benchmarkLessons)}">
        <div class="benchmark-heading">
          <div>
            <p class="eyebrow">${i(t.benchmarkProof)}</p>
            <h3>${i(t.benchmarkUnavailable)}</h3>
          </div>
          <p>${i(t.benchmarkUnavailableNote)}</p>
        </div>
      </section>
    `;const n=an(e,de).map(r=>`
        <article class="benchmark-card ${r.alignment}">
          <div class="benchmark-card-top">
            <span>${r.score}/10 ${me(r.dimension)}</span>
            <a href="${i(r.url)}" target="_blank" rel="noreferrer">${i(r.repo)}</a>
          </div>
          <p><b>${i(t.publicSignal)}</b>${i(r.signal)}</p>
          <p><b>${i(t.lesson)}</b>${i(r.lesson)}</p>
          <p><b>${i(t.openTopUse)}</b>${i(r.use)}</p>
          <a class="benchmark-source" href="${i(r.sourceUrl)}" target="_blank" rel="noreferrer">
            ${i(t.viewEvidence)}
          </a>
        </article>
      `).join("");return`
    <section class="benchmark-panel" aria-label="${i(t.benchmarkLessons)}">
      <div class="benchmark-heading">
        <div>
          <p class="eyebrow">${i(t.benchmarkProof)}</p>
          <h3>${i(t.publicRepoPatterns)}</h3>
        </div>
        <p>${i(t.benchmarkNote)}</p>
      </div>
      <div class="benchmark-grid">
        ${n}
      </div>
    </section>
  `}function oo(){const e=document.querySelector("#radarCanvas"),t=e==null?void 0:e.getContext("2d");if(!e||!t)return;const n=e.width,r=e.height;t.clearRect(0,0,n,r),t.fillStyle="#10130f",t.fillRect(0,0,n,r);for(let s=0;s<32;s+=1)t.strokeStyle=`rgba(190, 255, 70, ${s%4===0?.18:.06})`,t.beginPath(),t.moveTo(s*28,0),t.lineTo(s*28-180,r),t.stroke();((f==null?void 0:f.opportunities)??[]).forEach((s,a)=>{const p=90+a*145,g=r-48-s.score*24,l=18+s.score*2,m=t.createRadialGradient(p,g,2,p,g,l);m.addColorStop(0,"#f8ff7a"),m.addColorStop(.48,a%2?"#36e4c6":"#ff6a4d"),m.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=m,t.beginPath(),t.arc(p,g,l,0,Math.PI*2),t.fill(),t.fillStyle="#f4f1e7",t.font="600 13px Georgia",t.fillText(`${s.score}/10`,p-18,g-l-8)})}function so(e){const t=new FormData(e);return{audience:String(t.get("audience")??""),signal:String(t.get("signal")??""),constraints:String(t.get("constraints")??""),channels:String(t.get("channels")??""),pain:Number(t.get("pain")??5),urgency:Number(t.get("urgency")??5),distribution:Number(t.get("distribution")??5)}}function io(e){const t=new FormData(e);return{provider:String(t.get("provider")??"demo"),endpoint:String(t.get("endpoint")??""),apiKey:String(t.get("apiKey")??""),model:String(t.get("model")??"")}}function ao(){return Array.from({length:3},()=>'<div class="skeleton"></div>').join("")}function ke(e,t,n){return`
    <label class="range-label">
      <span>${t}</span>
      <output>${n}</output>
      <input name="${e}" type="range" min="1" max="10" value="${n}" />
    </label>
  `}function B(e,t,n){return`<option value="${e}" ${e===n?"selected":""}>${t}</option>`}function ve(e,t){return`<section><h3>${e}</h3><p>${i(t)}</p></section>`}function Se(e,t){return`<section><h3>${e}</h3><ul>${t.map(n=>`<li>${i(n)}</li>`).join("")}</ul></section>`}function A(e){return`<button class="secondary-action" data-copy="${e}" type="button">${i(Pt(e))}</button>`}function T(e,t){return`<button class="secondary-action" ${t} type="button">${i(M(e))}</button>`}function F(){return re(Re)}function Xe(e,t){const n=e.opportunities.map(r=>({...r,score:rt(r.scores,t.weights)})).sort((r,o)=>o.score-r.score);return{...e,opportunities:n}}function Qe(e){return y(h).providerLabels[e]}function Ye(e){return y(h).trendLabels[e]}function co(e){return Array.isArray(e)?e.flatMap(t=>{if(!t||typeof t!="object")return[];const n=t,r=n.dimension,o=Z(n.repo),s=et(n.url),a=et(n.sourceUrl),p=Z(n.publicSignal),g=Z(n.lesson),l=Z(n.openTopUse);return!lo(r)||!o||!s||!a||!p||!g||!l?[]:[{repo:o,url:s,sourceUrl:a,dimension:r,publicSignal:p,lesson:g,openTopUse:l}]}):[]}function lo(e){return typeof e=="string"&&qr.has(e)}function Z(e){return typeof e=="string"?e.trim().slice(0,640):""}function et(e){const t=Z(e);return t.startsWith("https://github.com/")?t:""}function ce(e,t){Tt=t,e&&(e.textContent=t)}function tt(e){O=e;const t=document.querySelector("[data-readme-audit-feedback]");t&&(t.textContent=e)}function me(e){const t=y(h);return e in t.dimensionLabels?t.dimensionLabels[e]:e.replace(/[A-Z]/g,n=>` ${n}`).toLowerCase()}function uo(e,t){return e==="show-hn"?it(t):e==="product-hunt"?ut(t):e==="build-log"?at(t):e==="newsletter"?dt(t):e==="demo-script"?pt(t):e==="github-issue"?ht(t):e==="launch-brief"?Te(t):e==="launch-kit"?ft(t):e==="contributor-queue"?He(t):e==="star-plan"?Ce(t):e==="repo-listing"?Pe(t):e==="x-thread"?ct(t):e==="reddit"?lt(t):e==="repo-scaffold"?fn(t):e==="share-url"?Lt($,window.location.href):st(t.name,t)}function Pt(e){return y(h).copyLabels[e??"markdown"]??y(h).copyLabels.markdown}function M(e){return h==="zh-CN"?{"launch-brief":"下载发布简报","launch-kit":"下载 Launch Kit","contributor-queue":"下载贡献任务","star-plan":"下载 Star 增长计划","repo-listing":"下载仓库 Profile","repo-zip":"下载仓库 ZIP","card-png":"下载 PNG","card-svg":"下载 SVG",json:"下载 JSON"}[e]??"下载":{"launch-brief":"Download Launch Brief","launch-kit":"Download Launch Kit","contributor-queue":"Download Contributor Queue","star-plan":"Download Star Plan","repo-listing":"Download Repo Listing","repo-zip":"Download Repo ZIP","card-png":"Download PNG","card-svg":"Download SVG",json:"Download JSON"}[e]??"Download"}function po(e,t){const n=new Blob([JSON.stringify(In(t,F()),null,2)],{type:"application/json"});ne(e,n)}function ho(e,t){ne(e,new Blob([t],{type:"image/svg+xml"}))}function V(e,t){ne(e,new Blob([t],{type:"text/markdown"}))}function ne(e,t){const n=document.createElement("a");n.href=URL.createObjectURL(t),n.download=e,n.click(),URL.revokeObjectURL(n.href)}function fo(e){return Ee(e,F().weights,h)}function go(e,t){return JSON.stringify(e)===JSON.stringify(Oe(t))}function i(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
